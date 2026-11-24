// Guild territory map (R-21, draft). Pure functions: weekly tiers in, cell owners out.
// One map per region and ruleset, about 2,000 fixed cells, reset each season. See
// Guild_League_Requirements.md "길드 영토 지도 규칙 (초안)".

export type MapCells = {
  cells: number;
  regions: number;
  neighbours: number[][];
  centre: [number, number][];
  // Pixels per cell on the map image
  size: number[];
  region: number[];
};

import { tierFor, type WeekTable } from "./league.ts";

// One guild's result for a closed week; tier 0 means not ranked that week
export type TerritoryGuild = { id: string; status: "ranked" | "too-few-active" | "not-found" | "pending"; tier: number; registeredAt: number };

export type TerritoryWeek = {
  // Guild id per cell, null for unclaimed land
  owner: (string | null)[];
  capitals: Record<string, number>;
  multiplier: number;
  claimed: number;
  captured: number;
  expeditions: number;
  // Region index to the guild holding more than half of it
  lords: Record<number, string>;
  // What happened, turn by turn, for the replay and the war chronicle (R-30)
  events: MarchEvent[];
};

// One step of a week's march. round 0 is capitals; each later round every guild with claims left
// moves once, strongest first. hold: a weaker neighbour's cell the guild couldn't take, because it
// is a capital or its owner hit this week's loss cap; logged once per guild and cell.
export type MarchEvent =
  | { round: number; kind: "capital"; guild: string; cell: number }
  // src: the guild's cell the move came from (its capital for an expedition), for drawing arrows
  | { round: number; kind: "claim" | "capture"; guild: string; cell: number; from: string | null; far: boolean; src: number }
  | { round: number; kind: "hold"; guild: string; cell: number; from: string; reason: "capital" | "cap" };

// Claims per week by tier 1..9, before the multiplier
const CLAIMS = [0, 1, 1, 1, 2, 2, 2, 3, 3, 4];
export const marchesFor = (tier: number) => CLAIMS[tier];
// Sized so the map fills in two to three weeks whatever the number of guilds
const FILL_WEEKS_FACTOR = 5.25;

export function claimMultiplier(cells: number, rankedGuilds: number) {
  return Math.max(1, Math.round(cells / (FILL_WEEKS_FACTOR * Math.max(1, rankedGuilds))));
}

export function runTerritory(map: MapCells, weeks: TerritoryGuild[][]): TerritoryWeek[] {
  const n = map.cells;
  const dist = (a: number, b: number) => Math.hypot(map.centre[a][0] - map.centre[b][0], map.centre[a][1] - map.centre[b][1]);
  const owner: (string | null)[] = Array(n).fill(null);
  const capitals = new Map<string, number>();
  const result: TerritoryWeek[] = [];

  for (const rows of weeks) {
    // A guild that can't be found leaves its land empty
    for (const g of rows) {
      if (g.status !== "not-found") continue;
      for (let i = 0; i < n; i++) if (owner[i] === g.id) owner[i] = null;
      capitals.delete(g.id);
    }
    // Ties on tier and registration time go by guild id, so the order never depends on how rows were read
    const ranked = rows.filter((g) => g.status === "ranked")
      .sort((a, b) => b.tier - a.tier || a.registeredAt - b.registeredAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const tier = new Map(rows.map((g) => [g.id, g.status === "ranked" ? g.tier : 0]));
    const events: MarchEvent[] = [];

    // First time ranked this season: a capital far from every other capital
    for (const g of ranked) {
      if (capitals.has(g.id)) continue;
      const taken = [...capitals.values()];
      let best = -1;
      let bestScore = -Infinity;
      for (let i = 0; i < n; i++) {
        if (owner[i]) continue;
        // The first capital goes to a coastal cell (fewest neighbours), later ones as far out as they can
        const score = taken.length ? Math.min(...taken.map((c) => dist(i, c))) : -(map.neighbours[i].length + map.centre[i][0] / 1e4);
        if (score > bestScore) { bestScore = score; best = i; }
      }
      if (best < 0) continue;
      capitals.set(g.id, best);
      owner[best] = g.id;
      events.push({ round: 0, kind: "capital", guild: g.id, cell: best });
    }

    const multiplier = claimMultiplier(n, ranked.length);
    const left = new Map(ranked.map((g) => [g.id, CLAIMS[g.tier] * multiplier]));
    const held = new Map<string, number>();
    for (const o of owner) if (o) held.set(o, (held.get(o) ?? 0) + 1);
    const lost = new Map<string, number>();
    // At most half of what a guild held before the march can be taken in one week
    const canLose = (id: string) => (lost.get(id) ?? 0) < Math.floor((held.get(id) ?? 0) / 2);
    const capitalCells = new Set(capitals.values());
    const owned = new Map<string, Set<number>>();
    owner.forEach((o, i) => { if (o) (owned.get(o) ?? owned.set(o, new Set()).get(o)!).add(i); });
    let claimed = 0;
    let captured = 0;
    let expeditions = 0;
    const heldOff = new Set<string>();
    let round = 0;

    // Strongest first, one claim each per round, until everyone is out of claims or targets
    for (let moved = true; moved; ) {
      moved = false;
      round++;
      for (const g of ranked) {
        if (!left.get(g.id)) continue;
        const home = capitals.get(g.id)!;
        const mine = owned.get(g.id) ?? owned.set(g.id, new Set()).get(g.id)!;
        const takeable = (i: number) => !capitalCells.has(i) && owner[i] !== g.id
          && (owner[i] === null || (tier.get(owner[i]!)! < g.tier && canLose(owner[i]!)));
        let target = -1;
        let src = home;
        let rank = Infinity;
        // Neighbouring land first: empty cells nearest home, then the weakest guild's cells
        for (const c of mine) for (const i of map.neighbours[c]) {
          if (!takeable(i)) {
            // A weaker guild's border cell that held: a capital, or its owner already lost the week's limit
            const o = owner[i];
            if (o && o !== g.id && tier.get(o)! < g.tier && !heldOff.has(`${g.id}:${i}`)) {
              heldOff.add(`${g.id}:${i}`);
              events.push({ round, kind: "hold", guild: g.id, cell: i, from: o, reason: capitalCells.has(i) ? "capital" : "cap" });
            }
            continue;
          }
          const r = (owner[i] === null ? 0 : (tier.get(owner[i]!)! + 1) * 1e6) + dist(i, home);
          if (r < rank) { rank = r; target = i; src = c; }
        }
        // Boxed in: an expedition anywhere on the map, same preference
        const far = target < 0;
        if (far) {
          for (let i = 0; i < n; i++) {
            if (!takeable(i)) continue;
            const r = (owner[i] === null ? 0 : (tier.get(owner[i]!)! + 1) * 1e6) + dist(i, home);
            if (r < rank) { rank = r; target = i; }
          }
          if (target < 0) { left.set(g.id, 0); continue; }
          expeditions++;
        }
        const prev = owner[target];
        events.push({ round, kind: prev ? "capture" : "claim", guild: g.id, cell: target, from: prev, far, src: far ? home : src });
        if (prev) {
          captured++;
          lost.set(prev, (lost.get(prev) ?? 0) + 1);
          owned.get(prev)?.delete(target);
        } else claimed++;
        owner[target] = g.id;
        mine.add(target);
        left.set(g.id, left.get(g.id)! - 1);
        moved = true;
      }
    }

    const lords: Record<number, string> = {};
    const perRegion = new Map<number, Map<string, number>>();
    const regionSize = new Map<number, number>();
    owner.forEach((o, i) => {
      const r = map.region[i];
      regionSize.set(r, (regionSize.get(r) ?? 0) + 1);
      if (!o) return;
      const m = perRegion.get(r) ?? perRegion.set(r, new Map()).get(r)!;
      m.set(o, (m.get(o) ?? 0) + 1);
    });
    for (const [r, m] of perRegion) for (const [id, c] of m) if (c * 2 > regionSize.get(r)!) lords[r] = id;

    result.push({ owner: [...owner], capitals: Object.fromEntries(capitals), multiplier, claimed, captured, expeditions, lords, events });
  }
  return result;
}

// R-31 forecast: the open week's guilds as if it closed now, tiers from today's league ranks with
// the same formula as a real close (R-20). ids limits it to one map's guilds.
export function provisionalWeek(table: WeekTable, ids: Set<string>): TerritoryGuild[] {
  return table.guilds.filter((g) => ids.has(g.id)).map((g) => ({
    id: g.id,
    status: g.status,
    tier: g.status === "ranked" && g.league && g.rank ? tierFor(g.rank, table.ranked[g.league].length) : 0,
    registeredAt: g.registeredAt,
  }));
}
