// What the daily export (pipeline/export.ts) writes to data/site.json and the site reads at build
// time. The mock season fills the same shape when there is no real data yet.
import type { WeekTable } from "./league.ts";
import type { MarchEvent } from "./territory.ts";

export type Region = "kr" | "tw" | "us" | "eu";
export type Ruleset = "pvp" | "normal";
export type Faction = "horde" | "alliance";

// roster: members on the last roster read, shown while the guild waits for its first week
export type SiteGuild = { id: string; name: string; region: Region; ruleset: Ruleset; faction: Faction; roster?: number | null };

// The territory map as stored when a week closed; guild ids per cell, null for unclaimed
export type TerritoryRecord = {
  week: number;
  owner: (string | null)[];
  capitals: Record<string, number>;
  lords: Record<number, string>;
  multiplier: number;
  claimed: number;
  captured: number;
  // The march turn by turn (R-30); missing when it couldn't be rebuilt exactly
  events?: MarchEvent[];
};

export type RegionData = {
  // Week 0 first; the last table is the week in progress
  tables: WeekTable[];
  // Closed weeks of the current season, per ruleset
  territory: Record<Ruleset, TerritoryRecord[]>;
  // R-31: the open week's march as if it closed at the last update; week is the open week
  forecast?: Partial<Record<Ruleset, TerritoryRecord>>;
};

// One region and ruleset of the population page: current members of registered guilds, counted at
// the last update. Counts, not shares, so the page can round them in each language
export type PopulationGroup = {
  region: Region;
  ruleset: Ruleset;
  guilds: number;
  characters: number;
  // Members per level band: under 10, 10-19, 20-29, 30-39, 40-49, 50-59, 60
  levels: number[];
  levelMedian: number;
  // Members of Horde guilds; the rest are in Alliance guilds
  horde: number;
  // Characters with an honor count on record, and how many of them passed 100
  honorRead: number;
  honorMedian: number;
  honor100: number;
  honorMax: number;
  // Characters with a known last login (level 10 and up), and how many logged in within 2 and 7 days
  loginRead: number;
  active2: number;
  active7: number;
};

export type SiteData = {
  // Start of the last collection run, null before the first one
  lastRun: number | null;
  guilds: SiteGuild[];
  // Names and current levels of the characters in the week tables' member lists (R-14). Public game
  // data; opted-out characters are deleted before export, so they are never here.
  characters?: Record<string, { name: string; level: number | null }>;
  regions: Record<Region, RegionData>;
  // The population page; missing before the first export that wrote it
  population?: PopulationGroup[];
};
