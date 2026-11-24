// The live strip (R-46): /api/view records a page view, /api/live returns the guilds people opened
// lately and how many are on the site now. No cookies and no stored IP: a visitor is a hash of the
// IP, browser and Korean date with a server-side key, so it changes every day and can't be reversed.
import { sameOrigin } from "./handlers.ts";
import { rest, type SupabaseEnv } from "./supabase.ts";

export type LiveEnv = SupabaseEnv & { VISITOR_SALT?: string };
export type LiveGuild = { id: string; name: string; region: string; faction: string; at: number };
export type LiveResult = { online: number; recent: LiveGuild[] };

const MIN = 60_000;
// One row per visitor, guild page and ten minutes; reloads in between add nothing
const SLOT = 10 * MIN;
// "On the site now": seen within the last 15 minutes
export const ONLINE_WINDOW = 15 * MIN;
const RECENT_WINDOW = 24 * 60 * MIN;
const RECENT_MAX = 12;
// Crawlers, link previews and headless browsers don't count
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embed|headless|lighthouse|python|curl|wget|node-fetch|axios/i;

async function visitorOf(request: Request, env: LiveEnv, now: number) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const ua = request.headers.get("User-Agent") ?? "";
  const kstDay = new Date(now + 9 * 60 * MIN).toISOString().slice(0, 10);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.VISITOR_SALT ?? env.SUPABASE_SERVICE_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${kstDay}|${ip}|${ua}`));
  return [...new Uint8Array(sig).slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function handleView(request: Request, env: LiveEnv, now = Date.now()): Promise<Response> {
  const done = new Response(null, { status: 204 });
  if (!sameOrigin(request) || BOT.test(request.headers.get("User-Agent") ?? "")) return done;
  let b: Record<string, unknown> | null = null;
  try {
    b = (await request.json()) as Record<string, unknown>;
  } catch {}
  const guild = typeof b?.guild === "string" && /^\d{1,12}$/.test(b.guild) ? Number(b.guild) : 0;
  const lang = typeof b?.lang === "string" && /^(ko|en|zh-tw)$/.test(b.lang) ? b.lang : "en";
  try {
    await rest(env, "page_view?on_conflict=visitor,slot,guild_id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({ visitor: await visitorOf(request, env, now), slot: Math.floor(now / SLOT), guild_id: guild, lang }),
    });
  } catch {}
  // A view that couldn't be saved is not the visitor's problem
  return done;
}

export async function handleLive(env: LiveEnv, now = Date.now()): Promise<Response> {
  const since = (ms: number) => encodeURIComponent(new Date(now - ms).toISOString());
  try {
    const [views, seen] = await Promise.all([
      rest(env, `page_view?select=guild_id,at&guild_id=gt.0&at=gte.${since(RECENT_WINDOW)}&order=at.desc&limit=300`),
      rest(env, `page_view?select=visitor&at=gte.${since(ONLINE_WINDOW)}&limit=5000`),
    ]);
    if (!views.ok || !seen.ok) throw new Error(`page_view ${views.status} ${seen.status}`);
    const online = new Set(((await seen.json()) as { visitor: string }[]).map((v) => v.visitor)).size;
    const latest = new Map<number, number>();
    for (const v of (await views.json()) as { guild_id: number; at: string }[]) {
      if (!latest.has(v.guild_id)) latest.set(v.guild_id, Date.parse(v.at));
    }
    // A few spare, since opted-out or missing guilds drop out below
    const ids = [...latest.keys()].slice(0, RECENT_MAX + 8);
    let recent: LiveGuild[] = [];
    if (ids.length) {
      const res = await rest(env, `guild?select=id,name,region,faction,status&id=in.(${ids.join(",")})`);
      if (!res.ok) throw new Error(`guild ${res.status}`);
      const rows = (await res.json()) as { id: number; name: string; region: string; faction: string | null; status: string }[];
      const byId = new Map(rows.filter((g) => g.status !== "opted_out" && g.faction).map((g) => [g.id, g]));
      recent = ids.flatMap((id) => {
        const g = byId.get(id);
        return g ? [{ id: String(g.id), name: g.name, region: g.region, faction: g.faction!, at: latest.get(id)! }] : [];
      }).slice(0, RECENT_MAX);
    }
    const body: LiveResult = { online, recent };
    return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=20" } });
  } catch {
    return new Response(JSON.stringify({ online: 0, recent: [] } satisfies LiveResult), { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } });
  }
}
