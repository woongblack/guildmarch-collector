// "What changed since the last update" (roadmap 5). Each build publishes a small summary of the
// standings as /data/today.json; the next build's release step downloads the live one as
// data/yesterday.json and compares against it. A code deploy on the same data run would compare a
// run with itself, so today.json also carries the summary it was compared with (prev), and a build
// whose download has the same asOf uses that instead. No database change is needed.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { guildCards, lastRun, regions, territoryView, type Region } from "./data.ts";

// Per guild: league, league rank, score per member, cells it would hold if the week closed now
type GuildRow = { l: string | null; r: number | null; pm: number; c: number };
type RegionDigest = { week: number; guilds: Record<string, GuildRow>; sieges: string[]; lords: Record<string, string> };
export type Snapshot = { asOf: number | null; regions: Partial<Record<Region, RegionDigest>> };
export type Published = Snapshot & { prev: Snapshot | null };

export function today(): Snapshot {
  const out: Snapshot = { asOf: lastRun(), regions: {} };
  for (const region of regions) {
    const cards = guildCards().filter((g) => g.region === region);
    if (!cards.length) continue;
    const maps = territoryView(region);
    const cells = new Map<string, number>();
    const sieges: string[] = [];
    const lords: Record<string, string> = {};
    for (const m of maps) {
      const week = m.forecast ?? m.weeks.at(-1);
      if (!week) continue;
      m.guilds.forEach((g, i) => cells.set(g.id, week.cells[i] ?? 0));
      // A siege is keyed by place and sides, so the same siege on two days is not news
      for (const s of m.sieges) sieges.push(`${m.ruleset}:${s.region}:${m.guilds[s.attacker].id}:${m.guilds[s.defender].id}`);
      week.regionLords.forEach((x, r) => { if (x >= 0) lords[`${m.ruleset}:${r}`] = m.guilds[x].id; });
    }
    out.regions[region] = {
      week: Math.max(...cards.map((g) => g.now.week)),
      guilds: Object.fromEntries(cards.map((g) => [g.id, {
        l: g.now.status === "ranked" ? g.now.league : null,
        r: g.now.status === "ranked" ? g.now.rank : null,
        pm: Math.round(g.now.perMember * 10) / 10,
        c: cells.get(g.id) ?? 0,
      }])),
      sieges,
      lords,
    };
  }
  return out;
}

let cached: Snapshot | null | undefined;
// The summary to compare against: the downloaded one, or its own prev when it is the same data run
export function yesterday(): Snapshot | null {
  if (cached !== undefined) return cached;
  const file = path.join(process.cwd(), "data", "yesterday.json");
  cached = null;
  if (existsSync(file)) {
    try {
      const live = JSON.parse(readFileSync(file, "utf8")) as Published;
      const now = lastRun();
      cached = live.asOf !== null && live.asOf === now ? live.prev : live;
    } catch {
      cached = null;
    }
  }
  return cached;
}

export const published = (): Published => ({ ...today(), prev: yesterday() });

export type GuildChange = {
  // League rank then and now; null when unchanged or the guild was not ranked on one side
  rank: { from: number; to: number } | null;
  perMember: number;
  cells: number;
};

// One guild's change since the last update; null across a new week or with nothing to compare
export function guildChange(region: Region, id: string): GuildChange | null {
  const before = yesterday()?.regions[region];
  const now = today().regions[region];
  if (!before || !now || before.week !== now.week) return null;
  const a = before.guilds[id];
  const b = now.guilds[id];
  if (!a || !b) return null;
  return {
    rank: a.r !== null && b.r !== null && a.l === b.l && a.r !== b.r ? { from: a.r, to: b.r } : null,
    perMember: Math.round((b.pm - a.pm) * 10) / 10,
    cells: b.c - a.c,
  };
}

export type DigestItem =
  | { kind: "newWeek"; week: number }
  | { kind: "climb"; id: string; from: number; to: number; league: string }
  | { kind: "siege"; ruleset: string; place: number; attacker: string; defender: string }
  | { kind: "lord"; ruleset: string; place: number; id: string };

// A region's news since the last update: a new week alone, or the biggest climbs within a league,
// then new sieges and new lords in the forecast, a few of each so one kind can't fill the list
export function regionDigest(region: Region): { since: number | null; items: DigestItem[] } {
  const before = yesterday()?.regions[region];
  const now = today().regions[region];
  if (!before || !now) return { since: null, items: [] };
  const since = yesterday()?.asOf ?? null;
  if (before.week !== now.week) return { since, items: [{ kind: "newWeek", week: now.week }] };
  const sieges: DigestItem[] = [];
  const lords: DigestItem[] = [];
  const old = new Set(before.sieges);
  for (const key of now.sieges) {
    if (old.has(key)) continue;
    const [ruleset, place, attacker, defender] = key.split(":");
    sieges.push({ kind: "siege", ruleset, place: Number(place), attacker, defender });
  }
  for (const [key, id] of Object.entries(now.lords)) {
    if (before.lords[key] === id) continue;
    const [ruleset, place] = key.split(":");
    lords.push({ kind: "lord", ruleset, place: Number(place), id });
  }
  const climbs = Object.entries(now.guilds).flatMap(([id, b]) => {
    const a = before.guilds[id];
    return a && a.r !== null && b.r !== null && b.l !== null && a.l === b.l && b.r < a.r ? [{ kind: "climb" as const, id, from: a.r, to: b.r, league: b.l }] : [];
  });
  climbs.sort((x, y) => y.from - y.to - (x.from - x.to) || x.to - y.to);
  return { since, items: [...climbs.slice(0, 3), ...sieges.slice(0, 2), ...lords.slice(0, 2)] };
}
