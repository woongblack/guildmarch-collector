// Checks /api/register, /api/opt-out, /api/discord, /api/view and /api/live against fake Battle.net, Supabase and Discord responses.
// Run from web/: node scripts/test-api.ts
import assert from "node:assert/strict";
import { weeklyMessage } from "../server/discord.ts";
import { handleDiscord, handleOptOut, handleRegister, type Env } from "../server/handlers.ts";
import { handleLive, handleView } from "../server/live.ts";
import type { GuildWeek, WeekTable } from "../lib/league.ts";
import { countsFrom, FIRST_WEEK } from "../server/types.ts";

const env: Env = {
  BLIZZARD_CLIENT_ID: "id",
  BLIZZARD_CLIENT_SECRET: "secret",
  SUPABASE_URL: "https://db.example",
  SUPABASE_SERVICE_KEY: "service",
};

// Guilds the fake API knows, by region and slug
const blizzard: Record<string, object> = {
  "kr/innocence": { name: "Innocence", id: 1, member_count: 29, faction: { type: "HORDE" } },
  "kr/포에버-형제단": { name: "포에버 형제단", id: 2, member_count: 20, faction: { type: "ALLIANCE" } },
  "eu/echo": { name: "Echo", id: 3, member_count: 39 },
};
let table: { region: string; slug: string; name: string; status: string; counts_from: string }[] = [];
let optOuts: object[] = [];
let calls: string[] = [];
let blizzardDown = false;
// Guilds by id for /api/discord, its webhook rows, and what reached Discord
const guildsById: Record<string, { name: string; status: string }> = { "7": { name: "Innocence", status: "tracked" }, "8": { name: "Echo", status: "opted_out" } };
let hooks: { guild_id: number; url: string; lang: string }[] = [];
let discordPosts: { url: string; body: any }[] = [];
let discordGone = false;
// page_view rows for /api/view and /api/live, and the guilds /api/live looks up
let views: { visitor: string; slot: number; guild_id: number; lang: string; at: string }[] = [];
const liveGuilds = [
  { id: 1, name: "War Song", region: "kr", faction: "horde", status: "tracked" },
  { id: 2, name: "Gone", region: "kr", faction: "horde", status: "opted_out" },
  { id: 3, name: "Echo", region: "eu", faction: "alliance", status: "tracked" },
];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  calls.push(`${method} ${url.host}${decodeURIComponent(url.pathname)}`);
  if (url.host === "oauth.battle.net") return Response.json({ access_token: "tok" });
  if (url.host.endsWith("api.blizzard.com")) {
    if (blizzardDown) return new Response("", { status: 503 });
    const region = url.host.split(".")[0];
    const slug = decodeURIComponent(url.pathname.split("/").pop()!);
    assert.equal(url.searchParams.get("namespace"), `profile-forever-${region}`);
    const g = blizzard[`${region}/${slug}`];
    return g ? Response.json(g) : new Response("", { status: 404 });
  }
  if (url.host === "discord.com") {
    discordPosts.push({ url: String(input), body: JSON.parse(String(init!.body)) });
    return new Response(discordGone ? "" : null, { status: discordGone ? 404 : 204 });
  }
  if (url.host === "db.example") {
    assert.equal((init?.headers as Record<string, string>).apikey, "service");
    if (url.pathname === "/rest/v1/guild" && method === "GET" && url.searchParams.get("id")?.startsWith("eq.")) {
      const g = guildsById[url.searchParams.get("id")!.slice(3)];
      return Response.json(g ? [g] : []);
    }
    if (url.pathname === "/rest/v1/page_view" && method === "POST") {
      assert.equal(url.searchParams.get("on_conflict"), "visitor,slot,guild_id");
      const row = JSON.parse(String(init!.body));
      if (!views.some((v) => v.visitor === row.visitor && v.slot === row.slot && v.guild_id === row.guild_id)) views.push({ ...row, at: new Date().toISOString() });
      return new Response(null, { status: 201 });
    }
    if (url.pathname === "/rest/v1/page_view" && method === "GET") {
      const since = Date.parse(url.searchParams.get("at")!.slice(4));
      const rows = views.filter((v) => Date.parse(v.at) >= since && (!url.searchParams.has("guild_id") || v.guild_id > 0));
      return Response.json([...rows].sort((a, b) => b.at.localeCompare(a.at)));
    }
    if (url.pathname === "/rest/v1/guild" && method === "GET" && url.searchParams.get("id")?.startsWith("in.")) {
      const ids = url.searchParams.get("id")!.slice(4, -1).split(",").map(Number);
      return Response.json(liveGuilds.filter((g) => ids.includes(g.id)));
    }
    if (url.pathname === "/rest/v1/discord_webhook" && method === "GET") {
      const id = Number(url.searchParams.get("guild_id")!.slice(3));
      return Response.json(hooks.filter((h) => h.guild_id === id).map((h) => ({ url: h.url })));
    }
    if (url.pathname === "/rest/v1/discord_webhook" && method === "POST") {
      const row = JSON.parse(String(init!.body));
      if (hooks.some((h) => h.url === row.url)) return new Response("", { status: 409 });
      hooks.push(row);
      return new Response(null, { status: 201 });
    }
    if (url.pathname === "/rest/v1/guild" && method === "GET") {
      const region = url.searchParams.get("region")!.slice(3);
      const slug = url.searchParams.get("slug")!.slice(3);
      return Response.json(table.filter((r) => r.region === region && r.slug === slug));
    }
    if (url.pathname === "/rest/v1/guild" && method === "POST") {
      const row = JSON.parse(String(init!.body));
      if (table.some((r) => r.region === row.region && r.slug === row.slug)) return new Response("", { status: 409 });
      table.push(row);
      return new Response(null, { status: 201 });
    }
    if (url.pathname === "/rest/v1/opt_out_request" && method === "POST") {
      optOuts.push(JSON.parse(String(init!.body)));
      return new Response(null, { status: 201 });
    }
  }
  throw new Error(`unexpected ${method} ${url}`);
};

const SITE = "https://guild-weekly.example";
const post = (path: string, body: unknown, origin = SITE) =>
  new Request(`${SITE}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
const register = async (body: unknown, now = Date.UTC(2026, 10, 8), origin?: string) => {
  const res = await handleRegister(post("/api/register", body, origin), env, now);
  return { status: res.status, ...(await res.json()) };
};
const reset = () => { table = []; optOuts = []; calls = []; blizzardDown = false; hooks = []; discordPosts = []; discordGone = false; };
const checks: [string, () => Promise<void>][] = [];
const check = (name: string, fn: () => Promise<void>) => checks.push([name, fn]);

check("week boundary: before week one, then the next Thursday 08:00 KST", async () => {
  assert.equal(countsFrom(Date.UTC(2026, 10, 8)), FIRST_WEEK);
  assert.equal(new Date(countsFrom(FIRST_WEEK + 1)).toISOString(), "2026-11-25T23:00:00.000Z");
  assert.equal(new Date(countsFrom(FIRST_WEEK)).toISOString(), "2026-11-25T23:00:00.000Z");
});

check("adds a found guild as pending, with the game's name, size and faction", async () => {
  reset();
  const r = await register({ region: "kr", ruleset: "pvp", faction: "horde", name: " innocence " });
  assert.deepEqual(r, { status: 201, result: "added", name: "Innocence", members: 29, faction: "horde", factionFromGame: false, countsFrom: FIRST_WEEK });
  assert.equal(table.length, 1);
  assert.equal(table[0].status, "pending");
  assert.equal(table[0].slug, "innocence");
});

check("Korean name with a space is tried as a hyphenated slug", async () => {
  reset();
  const r = await register({ region: "kr", ruleset: "normal", faction: "alliance", name: "포에버  형제단" });
  assert.equal(r.result, "added");
  assert.ok(calls.some((c) => c.endsWith("/data/wow/guild/포에버-형제단")));
});

check("faction from the game overrides the form and says so", async () => {
  reset();
  const r = await register({ region: "kr", ruleset: "pvp", faction: "alliance", name: "Innocence" });
  assert.equal(r.faction, "horde");
  assert.equal(r.factionFromGame, true);
});

check("keeps the form's faction when the game reports none", async () => {
  reset();
  const r = await register({ region: "eu", ruleset: "pvp", faction: "alliance", name: "Echo" });
  assert.equal(r.faction, "alliance");
  assert.equal(r.factionFromGame, false);
  assert.equal(r.members, 39);
});

check("same guild twice is reported as already added, not inserted again", async () => {
  reset();
  await register({ region: "kr", ruleset: "pvp", faction: "horde", name: "Innocence" });
  const r = await register({ region: "kr", ruleset: "pvp", faction: "horde", name: "INNOCENCE" });
  assert.equal(r.result, "exists");
  assert.equal(r.countsFrom, FIRST_WEEK);
  assert.equal(table.length, 1);
});

check("a guild that opted out can't be added again", async () => {
  reset();
  table.push({ region: "kr", slug: "innocence", name: "Innocence", status: "opted_out", counts_from: new Date(FIRST_WEEK).toISOString() });
  const r = await register({ region: "kr", ruleset: "pvp", faction: "horde", name: "Innocence" });
  assert.equal(r.status, 409);
  assert.equal(r.result, "opted_out");
});

check("unknown guild is not found and nothing is written", async () => {
  reset();
  const r = await register({ region: "us", ruleset: "pvp", faction: "horde", name: "No Such Guild" });
  assert.equal(r.status, 404);
  assert.equal(r.result, "not_found");
  assert.equal(calls.filter((c) => c.includes("db.example")).length, 0);
});

check("bad input is rejected before any API call", async () => {
  reset();
  for (const body of [
    { region: "cn", ruleset: "pvp", faction: "horde", name: "Echo" },
    { region: "kr", ruleset: "rp", faction: "horde", name: "Echo" },
    { region: "kr", ruleset: "pvp", faction: "scourge", name: "Echo" },
    { region: "kr", ruleset: "pvp", faction: "horde", name: "E" },
    { region: "kr", ruleset: "pvp", faction: "horde", name: "x".repeat(25) },
    { region: "kr", ruleset: "pvp", faction: "horde", name: "Echo\u0000" },
    "not an object",
  ]) {
    const r = await register(body);
    assert.equal(r.result, "invalid", JSON.stringify(body));
  }
  assert.equal(calls.length, 0);
});

check("posts from another site are refused", async () => {
  reset();
  const r = await register({ region: "kr", ruleset: "pvp", faction: "horde", name: "Innocence" }, undefined, "https://evil.example");
  assert.equal(r.status, 403);
  assert.equal(calls.length, 0);
});

check("Battle.net outage is an error, not a not-found", async () => {
  reset();
  blizzardDown = true;
  const r = await register({ region: "kr", ruleset: "pvp", faction: "horde", name: "Innocence" });
  assert.equal(r.status, 502);
  assert.equal(r.result, "error");
  assert.equal(table.length, 0);
});

check("registering mid-week counts from the following week", async () => {
  reset();
  const r = await register({ region: "kr", ruleset: "pvp", faction: "horde", name: "Innocence" }, FIRST_WEEK + 2 * 86_400_000);
  assert.equal(new Date(r.countsFrom).toISOString(), "2026-11-25T23:00:00.000Z");
  assert.equal(table[0].counts_from, "2026-11-25T23:00:00.000Z");
});

check("opt-out stores kind, region and name only", async () => {
  reset();
  const res = await handleOptOut(post("/api/opt-out", { kind: "character", region: "kr", name: "  가나다-라마  ", email: "x@example.com" }), env);
  assert.equal(res.status, 201);
  assert.deepEqual(optOuts, [{ kind: "character", region: "kr", name: "가나다-라마" }]);
});

check("opt-out takes guild removals and corrections for review", async () => {
  reset();
  const guild = await handleOptOut(post("/api/opt-out", { kind: "guild", region: "kr", name: "Echo" }), env);
  const fix = await handleOptOut(post("/api/opt-out", { kind: "correction", region: "eu", name: "Echo" }), env);
  assert.equal(guild.status, 201);
  assert.equal(fix.status, 201);
  assert.deepEqual(optOuts.map((o: any) => o.kind), ["guild", "correction"]);
});

check("opt-out rejects bad input and other sites", async () => {
  reset();
  const bad = await handleOptOut(post("/api/opt-out", { kind: "account", region: "kr", name: "Echo" }), env);
  assert.equal(bad.status, 400);
  const foreign = await handleOptOut(post("/api/opt-out", { kind: "guild", region: "kr", name: "Echo" }, "https://evil.example"), env);
  assert.equal(foreign.status, 403);
  assert.equal(optOuts.length, 0);
});

const HOOK = `https://discord.com/api/webhooks/123456789012345678/${"a".repeat(34)}-${"B".repeat(33)}`;
const discord = async (body: unknown, origin?: string) => {
  const res = await handleDiscord(post("/api/discord", body, origin), env);
  return { status: res.status, ...(await res.json()) };
};

check("discord: signs a channel up and says hello in its language, with no pings", async () => {
  reset();
  const r = await discord({ guild: "7", url: HOOK.replace("https://discord.com", "https://discordapp.com"), lang: "en" });
  assert.equal(r.result, "added");
  assert.deepEqual(hooks, [{ guild_id: 7, url: HOOK, lang: "en" }]);
  assert.equal(discordPosts.length, 1);
  assert.equal(discordPosts[0].url, HOOK);
  assert.match(discordPosts[0].body.content, /\*\*Innocence\*\*/);
  assert.deepEqual(discordPosts[0].body.allowed_mentions, { parse: [] });
});

check("discord: the same webhook twice is not stored or greeted again", async () => {
  reset();
  await discord({ guild: "7", url: HOOK, lang: "ko" });
  const again = await discord({ guild: "7", url: HOOK, lang: "ko" });
  assert.equal(again.result, "exists");
  assert.equal(hooks.length, 1);
  assert.equal(discordPosts.length, 1);
});

check("discord: rejects other URLs and sites before calling anyone", async () => {
  reset();
  for (const url of ["https://evil.example/api/webhooks/123456789012345678/abc", "https://discord.com/api/webhooks/1/short", "", 42]) {
    assert.equal((await discord({ guild: "7", url, lang: "ko" })).result, "invalid");
  }
  assert.equal((await discord({ guild: "7", url: HOOK, lang: "fr" })).result, "invalid");
  assert.equal((await discord({ guild: "x", url: HOOK, lang: "ko" })).result, "invalid");
  assert.equal((await discord({ guild: "7", url: HOOK, lang: "ko" }, "https://evil.example")).status, 403);
  assert.deepEqual(calls, []);
});

check("discord: a deleted webhook, a removed guild and a sixth channel are turned away", async () => {
  reset();
  discordGone = true;
  assert.equal((await discord({ guild: "7", url: HOOK, lang: "ko" })).result, "bad_webhook");
  assert.equal(hooks.length, 0);
  discordGone = false;
  discordPosts = [];
  assert.equal((await discord({ guild: "8", url: HOOK, lang: "ko" })).result, "not_found");
  assert.equal((await discord({ guild: "99", url: HOOK, lang: "ko" })).result, "not_found");
  hooks = [1, 2, 3, 4, 5].map((i) => ({ guild_id: 7, url: `${HOOK}${i}`, lang: "ko" }));
  assert.equal((await discord({ guild: "7", url: HOOK, lang: "ko" })).result, "limit");
  assert.equal(discordPosts.length, 0);
});

check("discord: the weekly post shows standing, tier, badges and a link", async () => {
  const parts = { levels: 0, reached60: 0, achievements: 0, honor: 0 };
  const row = (over: Partial<GuildWeek>): GuildWeek => ({ id: "7", name: "Innocence", registeredAt: 0, members: 30, active: 13, parts, total: 160, perMember: 12.31, league: null, status: "too-few-active", members_detail: [], badges: [], ...over });
  const ranked = row({ league: "small", status: "ranked", rank: 3, tier: 8, badges: ["rank-3", "climber"], change: { kind: "delta", n: 2 } });
  const others = Array.from({ length: 11 }, (_, i) => row({ id: String(100 + i), league: "small", status: "ranked" }));
  const table: WeekTable = { week: 0, closed: true, asOfDay: 7, guilds: [ranked], ranked: { small: [ranked, ...others], medium: [], large: [] } };
  const [e] = weeklyMessage("ko", { id: "7", name: "Innocence", region: "kr" }, ranked, table).embeds!;
  assert.equal(e.title, "Innocence · 1주차 결과");
  assert.equal(e.url, "https://guildmarch.com/ko/guild/kr/7/");
  assert.match(e.description, /소 리그 3위\*\* \(12곳 중\) · 지난주보다 2계단 상승/);
  assert.match(e.description, /성주/);
  assert.match(e.description, /인원당 점수 \*\*12\.3\*\*/);
  assert.match(e.description, /주간 3위, 급상승/);
  assert.equal(e.thumbnail?.url, "https://guildmarch.com/images/tiers/castellan-128.webp");

  const few = row({ active: 4 });
  const [f] = weeklyMessage("en", { id: "7", name: "Innocence", region: "kr" }, few, table).embeds!;
  assert.match(f.description, /Not ranked this week: 4 active members/);
  assert.equal(f.thumbnail, undefined);
});

const view = (body: unknown, headers: Record<string, string> = {}) =>
  handleView(new Request(`${SITE}/api/view`, { method: "POST", headers: { "Content-Type": "application/json", Origin: SITE, "CF-Connecting-IP": "203.0.113.7", "User-Agent": "Mozilla/5.0 Firefox", ...headers }, body: JSON.stringify(body) }), env);

check("view: stores a daily visitor hash, never the IP, once per ten minutes", async () => {
  views = [];
  assert.equal((await view({ guild: "1", lang: "ko" })).status, 204);
  await view({ guild: "1", lang: "ko" });
  await view({ lang: "en" });
  assert.equal(views.length, 2);
  assert.ok(views.every((v) => /^[0-9a-f]{24}$/.test(v.visitor) && !JSON.stringify(v).includes("203.0.113.7")));
  assert.deepEqual(views.map((v) => v.guild_id), [1, 0]);
});

check("view: bots, other sites and bad input add nothing or nothing harmful", async () => {
  views = [];
  await view({ guild: "1" }, { "User-Agent": "Googlebot/2.1" });
  await view({ guild: "1" }, { Origin: "https://elsewhere.example" });
  assert.equal(views.length, 0);
  await view({ guild: "1; drop table guild", lang: "xx" });
  assert.deepEqual(views.map((v) => [v.guild_id, v.lang]), [[0, "en"]]);
});

check("live: newest guild first, once each, opted-out guilds left out, visitors counted", async () => {
  views = [];
  await view({ guild: "3" }, { "CF-Connecting-IP": "198.51.100.1" });
  await view({ guild: "2" }, { "CF-Connecting-IP": "198.51.100.2" });
  await new Promise((r) => setTimeout(r, 5));
  await view({ guild: "1" }, { "CF-Connecting-IP": "198.51.100.3" });
  await view({ guild: "3" }, { "CF-Connecting-IP": "198.51.100.4" });
  const res = await handleLive(env);
  assert.equal(res.status, 200);
  const live = await res.json();
  assert.equal(live.online, 4);
  assert.deepEqual(live.recent.map((g: { name: string }) => g.name).sort(), ["Echo", "War Song"]);
  assert.equal(live.recent.length, 2);
});

let failed = 0;
for (const [name, fn] of checks) {
  try {
    await fn();
    console.log(`ok    ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${name}\n      ${e instanceof Error ? e.message : e}`);
  }
}
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
