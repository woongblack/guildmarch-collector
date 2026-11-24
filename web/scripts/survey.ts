// Guild survey for a community data post (Growth_Plan.md, Inven content plan). Reads a list of
// guilds people advertised in public recruiting posts, looks each one up on the Forever API like the
// daily job does, and prints totals only: no guild or character names leave this script. Login
// times are used only to count who played in the last 7 days. Read-only; touches no database.
//   BLIZZARD_CLIENT_ID=… BLIZZARD_CLIENT_SECRET=… node scripts/survey.ts survey/guilds-2026-11.json
// Writes survey/out-<date>.json and, in GitHub Actions, a summary table for the run page.
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { findGuild, token } from "../server/blizzard.ts";
import type { Region } from "../server/types.ts";

type Entry = { region: Region; name: string; ruleset: "pvp" | "normal" | null };
type Member = { level: number; active7: boolean; active3: boolean; achievements: number | null; honor: number | null };
type Guild = { region: Region; ruleset: Entry["ruleset"]; faction: string | null; roster: number; members: Member[] };

const file = process.argv[2];
const { BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET, GITHUB_STEP_SUMMARY } = process.env;
if (!file || !BLIZZARD_CLIENT_ID || !BLIZZARD_CLIENT_SECRET) {
  console.error("usage: BLIZZARD_CLIENT_ID=… BLIZZARD_CLIENT_SECRET=… node scripts/survey.ts <guilds.json>");
  process.exit(1);
}
const list = (JSON.parse(readFileSync(file, "utf8")) as { guilds: Entry[] }).guilds;
const tok = await token({ BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET });
const now = Date.now();
const DAY = 86_400_000;
let calls = 0;

async function get(region: Region, path: string): Promise<any> {
  const url = `https://${region}.api.blizzard.com${path}?namespace=profile-forever-${region}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    calls++;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` }, signal: AbortSignal.timeout(20_000) });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
      if (res.status !== 429 && res.status < 500) return null;
    } catch {
      // retried below
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
  return null;
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]);
  }));
}

const seg = (s: string) => encodeURIComponent(s.toLowerCase());
const guilds: Guild[] = [];
const seen = new Set<string>();
let notFound = 0;

for (const e of list) {
  const r = await findGuild(tok, e.region, e.name);
  if (!("found" in r)) {
    notFound++;
    continue;
  }
  const key = `${e.region}:${r.found.id ?? r.found.slug}`;
  if (seen.has(key)) continue; // the same guild listed under two spellings
  seen.add(key);
  const roster = await get(e.region, `/data/wow/guild/${seg(r.found.slug)}/roster`);
  const chars: { slug: string; level: number }[] = (roster?.members ?? [])
    .map((m: any) => m.character)
    .filter((c: any) => c?.slug)
    .map((c: any) => ({ slug: c.slug, level: c.level ?? 0 }));
  const members: Member[] = [];
  await pool(chars, 8, async (c) => {
    const base = `/profile/wow/character/${seg(c.slug)}`;
    // Below level 10 the profile isn't public; the roster level is all there is
    if (c.level < 10) {
      members.push({ level: c.level, active7: false, active3: false, achievements: null, honor: null });
      return;
    }
    const p = await get(e.region, base);
    if (!p) {
      members.push({ level: c.level, active7: false, active3: false, achievements: null, honor: null });
      return;
    }
    const last = p.last_login_timestamp ?? 0;
    const [a, v] = await Promise.all([get(e.region, `${base}/achievements`), get(e.region, `${base}/pvp-summary`)]);
    const done = (a?.achievements ?? []).filter((x: any) => x.completed_timestamp).length;
    members.push({
      level: p.level ?? c.level,
      active7: now - last < 7 * DAY,
      active3: now - last < 3 * DAY,
      achievements: a ? done : null,
      honor: v ? v.honorable_kills ?? 0 : null,
    });
  });
  guilds.push({ region: e.region, ruleset: e.ruleset, faction: r.found.faction, roster: chars.length, members });
  console.log(`guild ${guilds.length}: ${chars.length} on roster`);
}

// Totals only from here on
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const pct = (xs: number[], p: number) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const share = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : null);
const bucket = (x: number, edges: number[], labels: string[]) => labels[edges.findIndex((e) => x < e)] ?? labels.at(-1)!;
const count = (xs: string[], labels: string[]) => Object.fromEntries(labels.map((l) => [l, xs.filter((x) => x === l).length]));

const all = guilds.flatMap((g) => g.members);
const readable = all.filter((m) => m.achievements !== null);
const active = all.filter((m) => m.active7);
const sizeLabels = ["1-9", "10-29", "30-59", "60-99", "100+"];
const levelLabels = ["1-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60"];
const levelOf = (m: Member) => bucket(m.level, [10, 20, 30, 40, 50, 60], levelLabels);
const activeOf = (g: Guild) => g.members.filter((m) => m.active7).length;
const side = (f: string) => {
  const gs = guilds.filter((g) => g.faction === f);
  return { guilds: gs.length, roster: gs.reduce((s, g) => s + g.roster, 0), active7: gs.reduce((s, g) => s + activeOf(g), 0) };
};
const byRuleset = (r: Entry["ruleset"]) => {
  const gs = guilds.filter((g) => g.ruleset === r);
  const ms = gs.flatMap((g) => g.members).filter((m) => m.active7 && m.honor !== null);
  return { guilds: gs.length, activeHonorMedian: median(ms.map((m) => m.honor!)), activeHonorP90: pct(ms.map((m) => m.honor!), 90), activeWithHonor: share(ms.filter((m) => m.honor! > 0).length, ms.length) };
};

const out = {
  surveyedAt: new Date(now).toISOString(),
  listed: list.length,
  found: guilds.length,
  notFound,
  duplicates: list.length - notFound - guilds.length,
  apiCalls: calls,
  guildSize: {
    rosterMedian: median(guilds.map((g) => g.roster)),
    rosterBuckets: count(guilds.map((g) => bucket(g.roster, [10, 30, 60, 100], sizeLabels)), sizeLabels),
    active7Median: median(guilds.map(activeOf)),
    active7Buckets: count(guilds.map((g) => bucket(activeOf(g), [10, 30, 60, 100], sizeLabels)), sizeLabels),
    activeShareMedian: median(guilds.map((g) => share(activeOf(g), g.roster) ?? 0)),
  },
  factions: { horde: side("horde"), alliance: side("alliance") },
  rulesets: { pvp: byRuleset("pvp"), normal: byRuleset("normal") },
  members: {
    total: all.length,
    below10: share(all.filter((m) => m.level < 10).length, all.length),
    levels: count(all.map(levelOf), levelLabels),
    activeLevels: count(active.map(levelOf), levelLabels),
    at60: share(all.filter((m) => m.level >= 60).length, all.length),
    at60Active: share(active.filter((m) => m.level >= 60).length, active.length),
    levelMedian: median(all.map((m) => m.level)),
    activeLevelMedian: median(active.map((m) => m.level)),
    active7: share(active.length, all.length),
    active3: share(all.filter((m) => m.active3).length, all.length),
    achievementsMedian: median(readable.map((m) => m.achievements!)),
    achievementsP90: pct(readable.map((m) => m.achievements!), 90),
    honorMedianActive: median(active.filter((m) => m.honor !== null).map((m) => m.honor!)),
  },
};

const day = out.surveyedAt.slice(0, 10);
writeFileSync(new URL(`../survey/out-${day}.json`, import.meta.url), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
if (GITHUB_STEP_SUMMARY) appendFileSync(GITHUB_STEP_SUMMARY, `## Guild survey ${day}\n\n\`\`\`json\n${JSON.stringify(out, null, 2)}\n\`\`\`\n`);
