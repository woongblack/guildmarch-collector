// What the site shows. Real standings come from data/site.json, written by the daily export
// (pipeline/export.ts), once any region has a scored week. Until then the mock season fills the
// rank, map and faction pages for Korea only, labelled as an example. Guilds registered before
// week one still get real finder rows and guild pages, waiting for their first week.
// Server-side only (reads files at build time); client components import types from here.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  leagues,
  type Badge,
  type Change,
  type GuildWeek,
  type League,
  type Parts,
  type WeekTable,
} from "./league.ts";
import { AFFILIATION, GUILDS, mockSeason } from "./mock-season.ts";
import mapCells from "./map-cells.json";
import type { Faction, Region, RegionData, Ruleset, SiteData, SiteGuild, TerritoryRecord } from "./site-data.ts";
import { provisionalWeek, runTerritory, type MapCells, type MarchEvent, type TerritoryGuild, type TerritoryWeek } from "./territory.ts";

export type { Badge, Change, Faction, League, Parts, Region, Ruleset };
export { leagues };

export const regions: Region[] = ["kr", "tw", "us", "eu"];
export const rulesets: Ruleset[] = ["pvp", "normal"];
export const factions: Faction[] = ["horde", "alliance"];
export type Status = GuildWeek["status"];

const emptyRegion = (): RegionData => ({ tables: [], territory: { pvp: [], normal: [] } });

const asRecord = (w: TerritoryWeek, week: number): TerritoryRecord => ({
  week,
  owner: w.owner,
  capitals: w.capitals,
  lords: w.lords,
  multiplier: w.multiplier,
  claimed: w.claimed,
  captured: w.captured,
  events: w.events,
});

// The mock season as site data: Korea only, maps replayed from the closed weeks' tiers
function mockData(): SiteData {
  const tables = mockSeason();
  const closed = tables.filter((t) => t.closed);
  const open = tables.at(-1)?.closed === false ? tables.at(-1)! : null;
  const guilds: SiteGuild[] = GUILDS.map((g) => ({ id: g.id, name: g.name, region: "kr", ...AFFILIATION[g.id] }));
  const territory = {} as RegionData["territory"];
  const forecast: RegionData["forecast"] = {};
  for (const ruleset of rulesets) {
    const ids = new Set(guilds.filter((g) => g.ruleset === ruleset).map((g) => g.id));
    const weeks: TerritoryGuild[][] = closed.map((t) =>
      t.guilds.filter((g) => ids.has(g.id)).map((g) => ({ id: g.id, status: g.status, tier: g.tier ?? 0, registeredAt: g.registeredAt })));
    const run = runTerritory(mapCells as unknown as MapCells, weeks);
    territory[ruleset] = run.map((w, k) => asRecord(w, closed[k].week));
    if (open && run.length) forecast[ruleset] = asRecord(runTerritory(mapCells as unknown as MapCells, [...weeks, provisionalWeek(open, ids)]).at(-1)!, open.week);
  }
  // Made-up names for the mock members, steady per id, so the member lists read like a real guild
  const characters: NonNullable<SiteData["characters"]> = {};
  for (const t of tables.slice(-2)) for (const g of t.guilds) for (const m of g.members_detail) characters[m.id] ??= { name: mockName(m.id), level: null };
  return { lastRun: null, guilds, regions: { kr: { tables, territory, forecast }, tw: emptyRegion(), us: emptyRegion(), eu: emptyRegion() }, characters };
}

const MOCK_SYLLABLES = ["바람", "달빛", "검은", "새벽", "Ash", "Thorn", "Vale", "Kira", "모루", "Rune", "별빛", "Grim", "Lumi", "서리", "Dusk", "Bram"];
function mockName(id: string) {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `${MOCK_SYLLABLES[h % 16]}${MOCK_SYLLABLES[(h >>> 4) % 16]}`.slice(0, 12);
}

// ranks feeds the rank, map and faction pages; guilds feeds the finder and guild pages. They are
// the same data except before week one, when ranks is the mock season and guilds the real registrations.
type Loaded = { ranks: SiteData; guilds: SiteData; ranksSample: boolean; guildsSample: boolean };
let cache: Loaded | null = null;
function load(): Loaded {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "site.json");
  const real = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as SiteData) : null;
  if (real && regions.some((r) => real.regions[r]?.tables.length)) {
    return (cache = { ranks: real, guilds: real, ranksSample: false, guildsSample: false });
  }
  const mock = mockData();
  if (real?.guilds.length) return (cache = { ranks: mock, guilds: real, ranksSample: true, guildsSample: false });
  return (cache = { ranks: mock, guilds: mock, ranksSample: true, guildsSample: true });
}

// True while the rank, map and faction pages show the mock season; they then show "example" notes
export const isSample = () => load().ranksSample;
// True while the finder and guild pages show mock guilds too (no real registrations yet)
export const guildsSample = () => load().guildsSample;
// Start of the last collection run, for "updated at" notes; null on the mock season
export const lastRun = () => load().ranks.lastRun;
// The population page's groups from the real export; empty on mock data or before the export wrote them
export const population = () => (load().guildsSample ? [] : (load().guilds.population ?? []));
// Regions with something to show: Korea alone on the mock season, all four on real data
export const shownRegions = (): Region[] => (isSample() ? ["kr"] : regions);

const tablesOf = (src: SiteData, region: Region) => src.regions[region]?.tables ?? [];
const currentOf = (src: SiteData, region: Region) => tablesOf(src, region).at(-1) ?? null;
const lastClosedOf = (src: SiteData, region: Region) => [...tablesOf(src, region)].reverse().find((t) => t.closed) ?? null;
const guildIn = (src: SiteData, id: string) => src.guilds.find((g) => g.id === id) ?? null;

export type RankRow = {
  id: string;
  name: string;
  rank: number;
  active: number;
  parts: Parts;
  total: number;
  perMember: number;
  // null in week 1, when every guild is new
  change: Change | null;
  // Badges and tier from the last closed week, since the current week has none yet
  lastBadges: Badge[];
  lastTier: number | null;
  // Regions the guild ruled on the territory map when the last week closed
  lastLords: number;
};

export type Champion = { id: string; name: string; perMember: number; badges: Badge[]; tier: number | null };

export type RankView = {
  // 1-based; null before any week has closed
  championWeek: number | null;
  currentWeek: number;
  // The week the table shows: the current one, or the last closed one while nobody is ranked yet
  tableWeek: number;
  final: boolean;
  // The table is from the week's first update, when few members have logged in since the reset
  firstDay: boolean;
  table: Record<League, RankRow[]>;
  champions: Record<League, Champion | null>;
};

// null when the region has no scored week yet
export function rankView(region: Region): RankView | null {
  const { ranks } = load();
  const current = currentOf(ranks, region);
  if (!current) return null;
  const closed = lastClosedOf(ranks, region);
  // Right after the Thursday reset nobody has scored yet, so last week's final table stays up until someone does
  const final = !leagues.some((l) => current.ranked[l].length) && closed !== null && closed !== current;
  const now = final ? closed! : current;
  const lastBadges = (id: string) => (closed ? leagues.flatMap((l) => closed.ranked[l].find((r) => r.id === id)?.badges ?? []) : []);
  const lastTier = (id: string) => closed?.guilds.find((r) => r.id === id)?.tier ?? null;
  const table = Object.fromEntries(
    leagues.map((l) => [
      l,
      now.ranked[l].map((r) => ({
        id: r.id,
        name: r.name,
        rank: r.rank!,
        active: r.active,
        parts: r.parts,
        total: r.total,
        perMember: r.perMember,
        change: now.week === 0 && r.change?.kind === "new" ? null : r.change!,
        lastBadges: lastBadges(r.id),
        lastTier: lastTier(r.id),
        lastLords: lordCount(r.id),
      })),
    ]),
  ) as Record<League, RankRow[]>;
  const champions = Object.fromEntries(
    leagues.map((l) => {
      const top = closed?.ranked[l][0];
      return [l, top ? { id: top.id, name: top.name, perMember: top.perMember, badges: top.badges, tier: top.tier ?? null } : null];
    }),
  ) as Record<League, Champion | null>;
  const firstDay = !final && now.asOfDay === now.week * 7;
  return { championWeek: closed ? closed.week + 1 : null, currentWeek: current.week + 1, tableWeek: now.week + 1, final, firstDay, table, champions };
}

// Week numbers below are 1-based, the way the site shows them
export type WeekResult = {
  week: number;
  closed: boolean;
  status: Status;
  league: League | null;
  rank: number | null;
  members: number;
  active: number;
  // On the roster at week start but not scored: below level 10 or never readable
  excluded: number;
  parts: Parts;
  total: number;
  perMember: number;
  change: Change | null;
  badges: Badge[];
  tier: number | null;
};

export type GuildCard = {
  id: string;
  name: string;
  region: Region;
  ruleset: Ruleset;
  faction: Faction;
  now: WeekResult;
  // now is the week that just closed, because the new week has no scores yet (Thursday after the reset)
  final: boolean;
  // Tier and region lordships from the last closed week
  lastTier: number | null;
  lords: number;
};

export type GuildDetail = GuildCard & { weeks: WeekResult[] };

function result(table: WeekTable, id: string): WeekResult | null {
  const g = table.guilds.find((x) => x.id === id);
  if (!g) return null;
  return {
    week: table.week + 1,
    closed: table.closed,
    status: g.status,
    league: g.league,
    rank: g.rank ?? null,
    members: g.members,
    active: g.active,
    excluded: g.members - g.members_detail.length,
    parts: g.parts,
    total: g.total,
    perMember: g.perMember,
    change: g.change ?? null,
    badges: g.badges,
    tier: g.tier ?? null,
  };
}

// A guild registered after the last scoring run has no row yet; it waits for its first week
// members is the roster seen at registration or the last daily read
function waiting(week: number, members: number): WeekResult {
  const parts = { levels: 0, reached60: 0, achievements: 0, honor: 0 };
  return { week, closed: false, status: "pending", league: null, rank: null, members, active: 0, excluded: 0, parts, total: 0, perMember: 0, change: null, badges: [], tier: null };
}

function card(g: SiteGuild): GuildCard {
  const { guilds } = load();
  const now = currentOf(guilds, g.region);
  const current = (now && result(now, g.id)) ?? waiting(now ? now.week + 1 : 1, g.roster ?? 0);
  const closed = lastClosedOf(guilds, g.region);
  const last = closed && closed !== now ? result(closed, g.id) : null;
  // Right after the Thursday reset nobody has scored yet, so the week that just closed stands in
  const final = !current.closed && current.active === 0 && last !== null;
  return {
    ...g,
    now: final ? last! : current,
    final,
    lastTier: lastClosedOf(guilds, g.region)?.guilds.find((x) => x.id === g.id)?.tier ?? null,
    lords: lordCount(g.id),
  };
}

export const guildIds = () => load().guilds.guilds.map((g) => ({ region: g.region, id: g.id }));

// Built once per build: every guild page reads the cards for its neighbours
let cards: GuildCard[] | null = null;
export function guildCards(): GuildCard[] {
  return (cards ??= load().guilds.guilds.map(card));
}

// Search engines get a guild page once it has a scored week. Mock guilds and guilds still waiting
// for their first week would be thin or made-up pages, so they stay out of the index and sitemap.
export function guildIndexable(id: string) {
  return !guildsSample() && (guildDetail(id)?.weeks.some((w) => w.status !== "pending") ?? false);
}

export function guildDetail(id: string): GuildDetail | null {
  const g = guildIn(load().guilds, id);
  if (!g) return null;
  const weeks = tablesOf(load().guilds, g.region).map((t) => result(t, id)).filter((w): w is WeekResult => w !== null);
  return { ...card(g), weeks };
}

export type FactionRow = {
  ruleset: Ruleset;
  faction: Faction;
  guilds: number;
  rankedGuilds: number;
  active: number;
  levels: number;
  perMember: number;
};

export type FactionWeek = { week: number; closed: boolean; rows: FactionRow[] };

// Registered guilds only, so this is never a population count
export function factionWeek(table: WeekTable): FactionWeek {
  const rows = rulesets.flatMap((ruleset) =>
    factions.map((faction) => {
      const gs = table.guilds.filter((g) => {
        const info = guildIn(load().ranks, g.id);
        return info?.ruleset === ruleset && info.faction === faction;
      });
      const active = gs.reduce((s, g) => s + g.active, 0);
      const total = gs.reduce((s, g) => s + g.total, 0);
      return {
        ruleset,
        faction,
        guilds: gs.length,
        rankedGuilds: gs.filter((g) => g.status === "ranked").length,
        active,
        levels: gs.reduce((s, g) => s + g.parts.levels + g.parts.reached60, 0),
        perMember: active ? total / active : 0,
      };
    }),
  );
  return { week: table.week + 1, closed: table.closed, rows };
}

// The week in progress and the last closed one; null when the region has no scored week
export function factionView(region: Region) {
  const { ranks } = load();
  const now = currentOf(ranks, region);
  if (!now) return null;
  const last = lastClosedOf(ranks, region);
  return { now: factionWeek(now), last: last ? factionWeek(last) : null };
}

// Territory map (R-21): the stored maps of the current season, per ruleset. The browser gets
// guild indexes per cell, not guild ids. Types and event kinds live in territory-view.ts.
export { EV, type TerritoryGuildInfo, type TerritoryMap, type TerritoryWeekView } from "./territory-view.ts";
import { EV, type Siege, type TerritoryGuildInfo, type TerritoryMap, type TerritoryWeekView } from "./territory-view.ts";
import { FIRST_WEEK } from "../server/types.ts";
import { chronicle, forecastFor, guildsOf, regionsOf } from "./chronicle.ts";

// [round, kind, guild index, cell, other guild index or -1, source cell or -1] per event, guilds as
// indexes into the map's guild list; events of guilds not on the list (opted out) are dropped
function packEvents(events: MarchEvent[] | undefined, index: (id: string | null) => number): number[] {
  const out: number[] = [];
  for (const e of events ?? []) {
    const g = index(e.guild);
    if (g < 0) continue;
    if (e.kind === "capital") out.push(e.round, EV.capital, g, e.cell, -1, -1);
    else if (e.kind === "hold") out.push(e.round, e.reason === "capital" ? EV.holdCapital : EV.holdCap, g, e.cell, index(e.from), -1);
    else {
      const kind = e.kind === "capture" ? (e.far ? EV.farCapture : EV.capture) : e.far ? EV.farClaim : EV.claim;
      out.push(e.round, kind, g, e.cell, index(e.from), e.src);
    }
  }
  return out;
}

// Evenly spread hues, bright enough to read over the painted map
const guildColor = (i: number) => `hsl(${Math.round((i * 137.508) % 360)} 78% 58%)`;

const territoryCache = new Map<Region, TerritoryMap[]>();
// Maps with at least one closed week; empty before the first week closes
export function territoryView(region: Region): TerritoryMap[] {
  const hit = territoryCache.get(region);
  if (hit) return hit;
  const { ranks, guilds } = load();
  const { territory } = ranks.regions[region] ?? emptyRegion();
  const tables = tablesOf(ranks, region);
  const maps = rulesets.flatMap((ruleset) => {
    const records = territory[ruleset];
    if (!records.length) return [];
    const mapGuilds = ranks.guilds
      .filter((g) => g.region === region && g.ruleset === ruleset)
      .map((g, i) => ({ id: g.id, name: g.name, faction: g.faction, color: guildColor(i) }));
    const ids = mapGuilds.map((g) => g.id);
    const regionCount = (mapCells as unknown as MapCells).regions;
    const index = (id: string | null) => (id ? ids.indexOf(id) : -1);
    const view = (w: TerritoryRecord, tier: (id: string) => number): TerritoryWeekView => ({
      week: w.week + 1,
      owner: w.owner.map(index),
      capitals: ids.map((id) => w.capitals[id] ?? -1),
      cells: ids.map((id) => w.owner.filter((o) => o === id).length),
      lords: ids.map((id) => Object.values(w.lords).filter((l) => l === id).length),
      regionLords: Array.from({ length: regionCount }, (_, r) => index(w.lords[r] ?? null)),
      tiers: ids.map(tier),
      multiplier: w.multiplier,
      claimed: w.claimed,
      captured: w.captured,
      events: packEvents(w.events, index),
    });
    const ahead = ranks.regions[region]?.forecast?.[ruleset];
    const open = ahead ? tables.find((t) => t.week === ahead.week && !t.closed) : undefined;
    const provisional = open ? new Map(provisionalWeek(open, new Set(ids)).map((g) => [g.id, g.tier])) : null;
    return [{
      ruleset,
      region,
      // Before week one the map is the mock season, whose guilds have no pages to link to
      linked: ranks === guilds,
      guilds: mapGuilds,
      weeks: records.map((w) => {
        const table = tables.find((t) => t.week === w.week);
        return view(w, (id) => table?.guilds.find((g) => g.id === id)?.tier ?? 0);
      }),
      forecast: ahead && provisional ? view(ahead, (id) => provisional.get(id) ?? 0) : null,
      asOf: ranks.lastRun,
      sieges: [] as Siege[],
      closesAt: ahead ? FIRST_WEEK + (ahead.week + 1) * 7 * 86_400_000 : null,
    }];
  });
  for (const m of maps) if (m.forecast) m.sieges = siegesOf(m.forecast, m.weeks.at(-1) ?? null);
  territoryCache.set(region, maps);
  return maps;
}

// Regions the forecast would take: per region, the attacker taking most of it from one defender.
// A siege needs at least SIEGE_CELLS cells, or would hand the attacker the region's lordship.
const SIEGE_CELLS = 3;
function siegesOf(forecast: TerritoryWeekView, last: TerritoryWeekView | null): Siege[] {
  const regionOf = (mapCells as unknown as MapCells).region;
  const groups = new Map<string, number>();
  const e = forecast.events;
  for (let i = 0; i < e.length; i += 6) {
    if (e[i + 1] !== EV.capture && e[i + 1] !== EV.farCapture) continue;
    const key = `${regionOf[e[i + 3]]}:${e[i + 2]}:${e[i + 4]}`;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  const best = new Map<number, Siege>();
  for (const [key, cells] of groups) {
    const [region, attacker, defender] = key.split(":").map(Number);
    if (defender < 0 || (best.get(region)?.cells ?? 0) >= cells) continue;
    best.set(region, { region, attacker, defender, cells, lord: forecast.regionLords[region] === attacker && last?.regionLords[region] !== attacker });
  }
  return [...best.values()].filter((s) => s.cells >= SIEGE_CELLS || s.lord).sort((a, b) => Number(b.lord) - Number(a.lord) || b.cells - a.cells);
}

// A guild's map colour, the field of its banner; the same index rule as territoryView
export function guildColorOf(id: string) {
  for (const src of [load().ranks, load().guilds]) {
    const g = guildIn(src, id);
    if (!g) continue;
    const i = src.guilds.filter((x) => x.region === g.region && x.ruleset === g.ruleset).findIndex((x) => x.id === id);
    return guildColor(i);
  }
  return guildColor(0);
}

// Region index per cell, for drawing region borders in the browser
export const mapRegions = () => (mapCells as unknown as MapCells).region;
// Cell centres in map pixels, rounded, for the war arrows and shields (R-30)
export const mapCentres = () => (mapCells as unknown as MapCells).centre.map(([x, y]) => [Math.round(x), Math.round(y)] as [number, number]);

// Cells and ruled regions a guild held when the last week closed, for the guild page
export function guildTerritory(id: string): { ruleset: Ruleset; cells: number; lords: number; regions: number[] } | null {
  const g = guildIn(load().ranks, id) ?? guildIn(load().guilds, id);
  if (!g) return null;
  for (const m of territoryView(g.region)) {
    const i = m.guilds.findIndex((x) => x.id === id);
    if (i < 0) continue;
    const last = m.weeks[m.weeks.length - 1];
    const ruled = last ? last.regionLords.flatMap((x, r) => (x === i ? [r] : [])) : [];
    return { ruleset: m.ruleset, cells: last?.cells[i] ?? 0, lords: ruled.length, regions: ruled };
  }
  return null;
}

const lordCount = (id: string) => guildTerritory(id)?.lords ?? 0;

// Where each region's name sits on the map: the region's cell nearest its middle, so the label
// lands inside the region even when the region bends around a bay
let labels: [number, number][] | null = null;
export function regionLabels(): [number, number][] {
  if (labels) return labels;
  const m = mapCells as unknown as MapCells;
  labels = Array.from({ length: m.regions }, (_, r) => {
    const cells = m.region.flatMap((x, i) => (x === r ? [i] : []));
    const weight = cells.reduce((s, i) => s + m.size[i], 0);
    const mx = cells.reduce((s, i) => s + m.centre[i][0] * m.size[i], 0) / weight;
    const my = cells.reduce((s, i) => s + m.centre[i][1] * m.size[i], 0) / weight;
    const best = cells.reduce((a, b) =>
      Math.hypot(m.centre[b][0] - mx, m.centre[b][1] - my) < Math.hypot(m.centre[a][0] - mx, m.centre[a][1] - my) ? b : a);
    return m.centre[best];
  });
  return labels;
}

// Cells held by each faction's registered guilds when a week closed (R-21 rewards), null for weeks not closed
export function factionTerritory(region: Region, week: number): Record<Ruleset, Record<Faction, number>> | null {
  const maps = territoryView(region);
  if (!maps.length) return null;
  const out = { pvp: { horde: 0, alliance: 0 }, normal: { horde: 0, alliance: 0 } } as Record<Ruleset, Record<Faction, number>>;
  for (const m of maps) {
    const w = m.weeks.find((x) => x.week === week);
    if (!w) return null;
    m.guilds.forEach((g, i) => (out[m.ruleset][g.faction] += w.cells[i]));
  }
  return out;
}

// R-24: one region and ruleset on its own page. Leagues span both rulesets of a region, so this is
// the region's table without the other ruleset's guilds, and league ranks keep their gaps.
export type BoardRow = RankRow & { league: League; faction: Faction };
export type BoardView = {
  view: RankView;
  rows: BoardRow[];
  // Faction comparison for the week the table shows, with map land once that week has closed
  faction: FactionWeek | null;
  land: Record<Faction, number> | null;
  // Region lords on this ruleset's map when the last week closed, most regions first
  lords: { id: string; name: string; regions: number[] }[];
  linked: boolean;
};

export function boardView(region: Region, ruleset: Ruleset): BoardView | null {
  const view = rankView(region);
  if (!view) return null;
  const { ranks, guilds } = load();
  const rows = leagues.flatMap((league) =>
    view.table[league].flatMap((r) => {
      const g = guildIn(ranks, r.id);
      return g?.ruleset === ruleset ? [{ ...r, league, faction: g.faction }] : [];
    }));
  const fv = factionView(region);
  const faction = fv ? (view.final ? fv.last : fv.now) : null;
  const map = territoryView(region).find((m) => m.ruleset === ruleset);
  const last = map?.weeks.at(-1);
  const lords = map && last
    ? map.guilds
      .map((g, i) => ({ id: g.id, name: g.name, regions: last.regionLords.flatMap((x, r) => (x === i ? [r] : [])) }))
      .filter((l) => l.regions.length)
      .sort((a, b) => b.regions.length - a.regions.length)
    : [];
  const land = faction?.closed ? factionTerritory(region, faction.week)?.[ruleset] ?? null : null;
  return { view, rows, faction, land, lords, linked: ranks === guilds };
}

// One page per region and ruleset, such as /ranks/kr-pvp/
export const boards = () => regions.flatMap((region) => rulesets.map((ruleset) => ({ region, ruleset, slug: `${region}-${ruleset}` })));

// Search engines get a board once real guilds are ranked on it
export const boardIndexable = (region: Region, ruleset: Ruleset) => !isSample() && (boardView(region, ruleset)?.rows.length ?? 0) > 0;

// Closed weeks, 1-based, across every region with data
// A region's table for a closed week (1-based), for the weekly report (R-35)
export function closedTable(region: Region, week: number): WeekTable | null {
  return tablesOf(load().ranks, region).find((t) => t.closed && t.week + 1 === week) ?? null;
}

// R-14: a guild's members in the week its page shows (the current week, or the one that just closed
// on Thursday morning), most points first. Levels are the latest read; login times never leave the DB.
export type MemberRow = { id: string; name: string; level: number | null; active: boolean; parts: Parts; total: number; capped: string[] };
export function guildMembers(id: string): MemberRow[] {
  const src = load().guilds;
  const g = guildIn(src, id);
  if (!g) return [];
  const tables = tablesOf(src, g.region);
  // The week the guild page shows: on the reset day that is the week just closed, not the new
  // week where nobody has scored yet
  const shown = guildCards().find((c) => c.id === id)?.now.week;
  const rows = [...tables].reverse().filter((t) => shown === undefined || t.week + 1 <= shown);
  const row = rows.map((t) => t.guilds.find((x) => x.id === id)).find((x) => x && x.members_detail.length);
  if (!row) return [];
  const names = src.characters ?? {};
  return row.members_detail
    .map((m) => ({
      id: m.id,
      name: names[m.id]?.name ?? "",
      level: names[m.id]?.level ?? null,
      active: m.active,
      parts: m.parts,
      total: m.parts.levels + m.parts.reached60 + m.parts.achievements + m.parts.honor,
      capped: m.capped,
    }))
    .filter((m) => m.name)
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

// The guild page's "About" section: the roster by level next to everyone on the same region and
// ruleset, where this week's points came from, and the size of its league
const bandOf = (level: number) => Math.min(6, Math.floor(level / 10));
export type GuildProfile = {
  // Scored members with a known level, per level band 10-19 ... 60 (6 bands)
  leveled: number;
  bands: number[];
  median: number | null;
  // The same bands for all characters of level 10 and up in this region and ruleset, as shares
  peer: number[] | null;
  topPart: keyof Parts | null;
  top: { name: string; total: number } | null;
  // Ranked guilds in this guild's league that week
  of: number | null;
};
export function guildProfile(id: string): GuildProfile | null {
  const g = guildDetail(id);
  if (!g) return null;
  const members = guildMembers(id);
  const levels = members.map((m) => m.level).filter((l): l is number => l !== null && l >= 10).sort((a, b) => a - b);
  const bands = [0, 0, 0, 0, 0, 0];
  for (const l of levels) bands[bandOf(l) - 1]++;
  const median = levels.length ? levels[Math.floor((levels.length - 1) / 2)] : null;
  const pop = population().find((p) => p.region === g.region && p.ruleset === g.ruleset);
  const over10 = pop ? pop.characters - pop.levels[0] : 0;
  const peer = pop && over10 > 0 ? pop.levels.slice(1).map((n) => n / over10) : null;
  const parts = g.now.parts;
  const topPart = g.now.total > 0 ? (Object.keys(parts) as (keyof Parts)[]).reduce((a, b) => (parts[b] > parts[a] ? b : a)) : null;
  const top = members[0] && members[0].total > 0 ? { name: members[0].name, total: members[0].total } : null;
  const table = tablesOf(load().guilds, g.region).find((t) => t.week + 1 === g.now.week);
  const of = g.now.league && table ? table.ranked[g.now.league].length : null;
  return { leveled: levels.length, bands, median, peer, topPart, top, of };
}

// Guilds to visit next from a guild page: the ones just above and below it in its league, or for a
// guild that isn't ranked, the closest in size on the same region, ruleset and faction
export function guildNeighbours(id: string, n = 4): { league: League | null; rows: GuildCard[] } {
  const g = guildCards().find((c) => c.id === id);
  if (!g) return { league: null, rows: [] };
  // Leagues rank a whole region, both rulesets together
  const peers = guildCards().filter((c) => c.id !== id && c.region === g.region);
  const league = g.now.status === "ranked" ? g.now.league : null;
  if (league && g.now.rank) {
    const table = peers.filter((c) => c.now.status === "ranked" && c.now.league === league && c.now.week === g.now.week)
      .sort((a, b) => a.now.rank! - b.now.rank!);
    const at = table.findIndex((c) => c.now.rank! >= g.now.rank!);
    const pos = at < 0 ? table.length : at;
    const start = Math.max(0, Math.min(pos - n / 2, table.length - n));
    return { league, rows: table.slice(start, start + n) };
  }
  const size = g.now.members;
  const rows = peers.filter((c) => c.ruleset === g.ruleset && c.faction === g.faction)
    .sort((a, b) => Math.abs(a.now.members - size) - Math.abs(b.now.members - size) || a.name.localeCompare(b.name))
    .slice(0, n);
  return { league: null, rows };
}

// Character search (roadmap 7): every listed member of a region, with the guild they score for
export function characterIndex(region: Region): { n: string; c: string; g: string; l: number | null }[] {
  const src = load().guilds;
  return src.guilds.filter((g) => g.region === region).flatMap((g) => guildMembers(g.id).map((m) => ({ n: m.name, c: m.id, g: g.id, l: m.level })));
}

export function closedWeeks(): number[] {
  const { ranks } = load();
  const weeks = new Set(shownRegions().flatMap((r) => tablesOf(ranks, r).filter((t) => t.closed).map((t) => t.week + 1)));
  return [...weeks].sort((a, b) => a - b);
}

export type ArchiveRow = { id: string; name: string; league: League; rank: number; active: number; perMember: number; tier: number | null; badges: Badge[]; ruleset: Ruleset; faction: Faction };
export type ArchiveMap = { ruleset: Ruleset; multiplier: number; claimed: number; captured: number; lords: number };

// One region's final table for a closed week (1-based), with that week's march on each map
export function weekArchive(region: Region, week: number): { rows: ArchiveRow[]; maps: ArchiveMap[]; linked: boolean } | null {
  const { ranks, guilds } = load();
  const table = tablesOf(ranks, region).find((t) => t.closed && t.week + 1 === week);
  if (!table) return null;
  const rows = leagues.flatMap((league) =>
    table.ranked[league].map((r) => {
      const g = guildIn(ranks, r.id);
      return {
        id: r.id,
        name: r.name,
        league,
        rank: r.rank!,
        active: r.active,
        perMember: r.perMember,
        tier: r.tier ?? null,
        badges: r.badges,
        ruleset: g?.ruleset ?? "pvp",
        faction: g?.faction ?? "horde",
      };
    }));
  const maps = territoryView(region).flatMap((m) => {
    const w = m.weeks.find((x) => x.week === week);
    return w ? [{ ruleset: m.ruleset, multiplier: w.multiplier, claimed: w.claimed, captured: w.captured, lords: w.regionLords.filter((x) => x >= 0).length }] : [];
  });
  return { rows, maps, linked: ranks === guilds };
}

// Guilds that ended the last closed week with a tier or badge, across regions, for the tier and
// badge pages. Empty on the mock season, so made-up guilds never sit on these indexed pages.
export type HolderRow = ArchiveRow & { region: Region };
function lastClosedRows(pick: (r: ArchiveRow) => boolean): { week: number | null; rows: HolderRow[]; linked: boolean } {
  if (isSample()) return { week: null, rows: [], linked: false };
  const { ranks, guilds } = load();
  const week = closedWeeks().at(-1) ?? null;
  if (week === null) return { week, rows: [], linked: ranks === guilds };
  const rows = shownRegions().flatMap((region) => (weekArchive(region, week)?.rows ?? []).filter(pick).map((r) => ({ ...r, region })));
  return { week, rows, linked: ranks === guilds };
}
export const tierHolders = (tier: number) => lastClosedRows((r) => r.tier === tier);
export const badgeHolders = (badge: Badge) => lastClosedRows((r) => r.badges.includes(badge));

// Registered guilds of one region, ruleset and faction, ranked first, for /ranks/kr-pvp/horde/ and the like.
// Real registrations show here before week one too, waiting for their first week.
const statusOrder: Status[] = ["ranked", "too-few-active", "pending", "not-found"];
export function sideGuilds(region: Region, ruleset: Ruleset, faction: Faction): GuildCard[] {
  return guildCards()
    .filter((c) => c.region === region && c.ruleset === ruleset && c.faction === faction)
    .sort((a, b) =>
      statusOrder.indexOf(a.now.status) - statusOrder.indexOf(b.now.status)
      || (a.now.league && b.now.league ? leagues.indexOf(a.now.league) - leagues.indexOf(b.now.league) : 0)
      || (a.now.rank ?? 0) - (b.now.rank ?? 0));
}

// Indexed once at least three real guilds are listed, so search engines never get a near-empty list
export const sideIndexable = (region: Region, ruleset: Ruleset, faction: Faction) =>
  !guildsSample() && sideGuilds(region, ruleset, faction).length >= 3;

// Territory region pages: one terrain region on one map. size and neighbours come from the fixed
// map; the rest from the stored weeks of this season.
const regionCells = (place: number) => (mapCells as unknown as MapCells).region.filter((r) => r === place).length;
export function placeNeighbours(place: number): number[] {
  const m = mapCells as unknown as MapCells;
  const out = new Set<number>();
  m.region.forEach((r, i) => {
    if (r !== place) return;
    for (const n of m.neighbours[i]) if (m.region[n] !== place) out.add(m.region[n]);
  });
  return [...out].sort((a, b) => a - b);
}

export type PlaceView = {
  cells: number;
  // Week shown and its lord, null before the first week closes
  week: number | null;
  lord: TerritoryGuildInfo | null;
  holdings: (TerritoryGuildInfo & { cells: number })[];
  unclaimed: number;
  history: { week: number; lord: TerritoryGuildInfo | null }[];
  linked: boolean;
};

export function placeView(region: Region, ruleset: Ruleset, place: number): PlaceView {
  const cells = regionCells(place);
  const map = territoryView(region).find((m) => m.ruleset === ruleset);
  const last = map?.weeks.at(-1);
  if (!map || !last) return { cells, week: null, lord: null, holdings: [], unclaimed: cells, history: [], linked: false };
  const inPlace = (mapCells as unknown as MapCells).region.flatMap((r, i) => (r === place ? [i] : []));
  const counts = new Map<number, number>();
  for (const i of inPlace) if (last.owner[i] >= 0) counts.set(last.owner[i], (counts.get(last.owner[i]) ?? 0) + 1);
  const holdings = [...counts].map(([g, n]) => ({ ...map.guilds[g], cells: n })).sort((a, b) => b.cells - a.cells);
  const lordOf = (w: TerritoryWeekView) => (w.regionLords[place] >= 0 ? map.guilds[w.regionLords[place]] : null);
  return {
    cells,
    week: last.week,
    lord: lordOf(last),
    holdings,
    unclaimed: cells - holdings.reduce((s, h) => s + h.cells, 0),
    history: map.weeks.map((w) => ({ week: w.week, lord: lordOf(w) })),
    linked: map.linked,
  };
}

// Indexed only while the region has a lord, so empty regions stay out of search
export const placeIndexable = (region: Region, ruleset: Ruleset, place: number) => !isSample() && placeView(region, ruleset, place).lord !== null;

// R-30/R-31 on the guild page: its lines in the last close's chronicle, and what the forecast does to it
export function guildWar(id: string) {
  const g = guildIn(load().ranks, id) ?? guildIn(load().guilds, id);
  if (!g) return null;
  const m = territoryView(g.region).find((x) => x.guilds.some((y) => y.id === id));
  if (!m || !m.weeks.length) return null;
  const i = m.guilds.findIndex((y) => y.id === id);
  const last = m.weeks.at(-1)!;
  const items = chronicle(last, m.weeks.at(-2) ?? null, mapRegions()).filter((x) => guildsOf(x).includes(i));
  const ahead = m.forecast ? forecastFor(m.forecast, i) : null;
  const siegeLine = (s: Siege) => ({ region: s.region, attacker: m.guilds[s.attacker], defender: m.guilds[s.defender], cells: s.cells, lord: s.lord });
  return {
    sieges: {
      attacking: m.sieges.filter((s) => s.attacker === i).map(siegeLine),
      defending: m.sieges.filter((s) => s.defender === i).map(siegeLine),
    },
    closesAt: m.closesAt,
    color: m.guilds[i].color,
    week: last.week,
    items,
    names: m.guilds.map((y) => y.name),
    forecast: ahead && m.forecast ? { ...ahead, week: m.forecast.week, threat: ahead.threat >= 0 ? m.guilds[ahead.threat].name : null } : null,
    asOf: m.asOf,
    ruleset: m.ruleset,
  };
}

// R-30 on a territory region page: the last close's lines about this region, and the forecast's
export function placeWar(region: Region, ruleset: Ruleset, place: number) {
  const m = territoryView(region).find((x) => x.ruleset === ruleset);
  if (!m || !m.weeks.length) return null;
  const about = (week: TerritoryWeekView, prev: TerritoryWeekView | null) =>
    chronicle(week, prev, mapRegions()).filter((x) => regionsOf(x).includes(place));
  const s = m.sieges.find((x) => x.region === place);
  return {
    siege: s ? { attacker: m.guilds[s.attacker], defender: m.guilds[s.defender], cells: s.cells, lord: s.lord } : null,
    closesAt: m.closesAt,
    week: m.weeks.at(-1)!.week,
    items: about(m.weeks.at(-1)!, m.weeks.at(-2) ?? null),
    forecast: m.forecast ? { week: m.forecast.week, items: about(m.forecast, m.weeks.at(-1)!) } : null,
    names: m.guilds.map((y) => y.name),
  };
}
