// Shapes shared by the Cloudflare Functions and the site forms

export const REGIONS = ["kr", "tw", "us", "eu"] as const;
export type Region = (typeof REGIONS)[number];
export const RULESETS = ["pvp", "normal"] as const;
export type Ruleset = (typeof RULESETS)[number];
export const FACTIONS = ["horde", "alliance"] as const;
export type Faction = (typeof FACTIONS)[number];

export type RegisterResult =
  | { result: "added"; name: string; members: number | null; faction: Faction; factionFromGame: boolean; countsFrom: number }
  | { result: "exists"; name: string; countsFrom: number }
  | { result: "opted_out" | "not_found" | "invalid" | "forbidden" | "error" };

export type OptOutResult = { result: "received" | "invalid" | "forbidden" | "error" };

export type DiscordResult = { result: "added" | "exists" | "invalid" | "bad_webhook" | "limit" | "not_found" | "forbidden" | "error" };

// Week one starts Thursday, November 19, 2026, 08:00 Korea time; weeks follow every 7 days
export const FIRST_WEEK = Date.UTC(2026, 10, 18, 23, 0);
const WEEK = 7 * 86_400_000;

// A guild is scored from the first week that starts after it registers (tentative rule 1)
export function countsFrom(now: number): number {
  if (now < FIRST_WEEK) return FIRST_WEEK;
  return FIRST_WEEK + (Math.floor((now - FIRST_WEEK) / WEEK) + 1) * WEEK;
}
