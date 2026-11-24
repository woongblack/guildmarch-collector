// Territory view types shared by the server pages and the map in the browser (R-21, R-30, R-31).
// No server imports here, so client components can use the values too.
import type { Faction, Region, Ruleset } from "./site-data.ts";

// Territory map (R-21): the stored maps of the current season, per ruleset. The browser gets
// guild indexes per cell, not guild ids.
export type TerritoryGuildInfo = { id: string; name: string; faction: Faction; color: string };
export type TerritoryWeekView = {
  week: number;
  // Index into guilds per cell, -1 for unclaimed
  owner: number[];
  capitals: number[];
  cells: number[];
  lords: number[];
  // Guild index per region for the region's lord, -1 when nobody holds more than half
  regionLords: number[];
  tiers: number[];
  multiplier: number;
  claimed: number;
  captured: number;
  // The march as flat groups of six numbers (see packEvents); empty when there is no log
  events: number[];
};
// A region about to change hands if the week closed now (R-31 shown as a siege): the attacker taking
// the most of it from one defender. lord: the attacker would become the region's lord.
export type Siege = { region: number; attacker: number; defender: number; cells: number; lord: boolean };

// forecast: the open week as if it closed at the last update (R-31), on top of the last closed week
export type TerritoryMap = {
  ruleset: Ruleset;
  region: Region;
  linked: boolean;
  guilds: TerritoryGuildInfo[];
  weeks: TerritoryWeekView[];
  forecast: TerritoryWeekView | null;
  asOf: number | null;
  sieges: Siege[];
  // When the forecast week closes (ms), for the countdown
  closesAt: number | null;
};

// "2d 5h" style countdown parts to a close; null once it has passed
export function untilClose(closesAt: number | null, now: number) {
  if (closesAt === null || closesAt <= now) return null;
  const m = Math.floor((closesAt - now) / 60000);
  return { d: Math.floor(m / 1440), h: Math.floor((m % 1440) / 60), m: m % 60 };
}

// Event kinds in the packed log, shared with the browser
export const EV = { capital: 0, claim: 1, capture: 2, farClaim: 3, farCapture: 4, holdCapital: 5, holdCap: 6 } as const;
