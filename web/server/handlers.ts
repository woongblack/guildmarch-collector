// Request handlers behind /api/register, /api/opt-out and /api/discord. Plain Request in, Response out,
// so the same code runs in Cloudflare Functions and in the Node tests.
import { langs } from "../lib/i18n.ts";
import { findGuild, token, type BlizzardEnv } from "./blizzard.ts";
import { helloMessage, postWebhook, webhookUrl } from "./discord.ts";
import { rest, type SupabaseEnv } from "./supabase.ts";
import {
  FACTIONS,
  REGIONS,
  RULESETS,
  countsFrom,
  type DiscordResult,
  type Faction,
  type OptOutResult,
  type Region,
  type RegisterResult,
  type Ruleset,
} from "./types.ts";

export type Env = BlizzardEnv & SupabaseEnv;

const json = (body: RegisterResult | OptOutResult | DiscordResult, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

// Visible text only, no control characters
function cleanName(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().replace(/\s+/g, " ");
  return s.length >= 2 && s.length <= max && !/[\p{Cc}\p{Cf}]/u.test(s) ? s : null;
}

// Only the site's own pages may post here
export function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function body(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await request.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function handleRegister(request: Request, env: Env, now = Date.now()): Promise<Response> {
  if (!sameOrigin(request)) return json({ result: "forbidden" }, 403);
  const b = await body(request);
  const name = cleanName(b?.name, 24);
  if (!b || !name || !oneOf(REGIONS, b.region) || !oneOf(RULESETS, b.ruleset) || !oneOf(FACTIONS, b.faction)) {
    return json({ result: "invalid" }, 400);
  }
  const region: Region = b.region;
  const ruleset: Ruleset = b.ruleset;
  const chosen: Faction = b.faction;

  try {
    const lookup = await findGuild(await token(env), region, name);
    if ("notFound" in lookup) return json({ result: "not_found" }, 404);
    const g = lookup.found;

    const existing = await rest(env, `guild?select=name,status,counts_from&region=eq.${region}&slug=eq.${encodeURIComponent(g.slug)}`);
    if (!existing.ok) throw new Error(`guild select ${existing.status}`);
    const [row] = (await existing.json()) as { name: string; status: string; counts_from: string }[];
    if (row?.status === "opted_out") return json({ result: "opted_out" }, 409);
    if (row) return json({ result: "exists", name: row.name, countsFrom: Date.parse(row.counts_from) }, 200);

    // The game's faction wins over the form when the API reports one
    const faction = g.faction ?? chosen;
    const from = countsFrom(now);
    const insert = await rest(env, "guild", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        region,
        slug: g.slug,
        name: g.name,
        blizzard_id: g.id,
        ruleset,
        faction,
        status: "pending",
        counts_from: new Date(from).toISOString(),
        roster_seen_at: new Date(now).toISOString(),
        roster_size: g.members,
      }),
    });
    // Someone else added the same guild a moment ago
    if (insert.status === 409) return json({ result: "exists", name: g.name, countsFrom: from }, 200);
    if (!insert.ok) throw new Error(`guild insert ${insert.status}`);
    return json(
      { result: "added", name: g.name, members: g.members, faction, factionFromGame: g.faction !== null && g.faction !== chosen, countsFrom: from },
      201,
    );
  } catch (e) {
    console.error("register", e instanceof Error ? e.message : e);
    return json({ result: "error" }, 502);
  }
}

export async function handleOptOut(request: Request, env: Env): Promise<Response> {
  if (!sameOrigin(request)) return json({ result: "forbidden" }, 403);
  const b = await body(request);
  // Forever characters are looked up as name-surname, so allow more than a guild name
  const name = cleanName(b?.name, 40);
  if (!b || !name || !oneOf(["guild", "character", "correction"] as const, b.kind) || !oneOf(REGIONS, b.region)) {
    return json({ result: "invalid" }, 400);
  }
  try {
    const res = await rest(env, "opt_out_request", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ kind: b.kind, region: b.region, name }),
    });
    if (!res.ok) throw new Error(`opt_out insert ${res.status}`);
    return json({ result: "received" }, 201);
  } catch (e) {
    console.error("opt-out", e instanceof Error ? e.message : e);
    return json({ result: "error" }, 502);
  }
}

// Channels per guild, so one form can't fan the weekly post out to any number of webhooks
const MAX_WEBHOOKS = 5;

export async function handleDiscord(request: Request, env: Env): Promise<Response> {
  if (!sameOrigin(request)) return json({ result: "forbidden" }, 403);
  const b = await body(request);
  const url = webhookUrl(b?.url);
  const guild = typeof b?.guild === "string" && /^\d{1,12}$/.test(b.guild) ? b.guild : null;
  if (!b || !url || !guild || !oneOf(langs, b.lang)) return json({ result: "invalid" }, 400);
  const lang = b.lang;

  try {
    const found = await rest(env, `guild?select=name,status&id=eq.${guild}`);
    if (!found.ok) throw new Error(`guild select ${found.status}`);
    const [g] = (await found.json()) as { name: string; status: string }[];
    if (!g || g.status === "opted_out") return json({ result: "not_found" }, 404);

    const hooks = await rest(env, `discord_webhook?select=url&guild_id=eq.${guild}`);
    if (!hooks.ok) throw new Error(`webhook select ${hooks.status}`);
    const rows = (await hooks.json()) as { url: string }[];
    if (rows.some((r) => r.url === url)) return json({ result: "exists" }, 200);
    if (rows.length >= MAX_WEBHOOKS) return json({ result: "limit" }, 409);

    // The hello is also the check that the webhook works
    const sent = await postWebhook(url, helloMessage(lang, g.name));
    if (sent === "gone") return json({ result: "bad_webhook" }, 400);
    if (sent === "failed") throw new Error("hello not sent");

    const insert = await rest(env, "discord_webhook", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ guild_id: Number(guild), url, lang }),
    });
    // The same webhook is already on another guild
    if (insert.status === 409) return json({ result: "exists" }, 200);
    if (!insert.ok) throw new Error(`webhook insert ${insert.status}`);
    return json({ result: "added" }, 201);
  } catch (e) {
    console.error("discord", e instanceof Error ? e.message : e);
    return json({ result: "error" }, 502);
  }
}
