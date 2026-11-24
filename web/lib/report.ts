// The weekly report (R-35): one region's closed week told as a story, built from the same data as
// the rank pages, plus the owner's notes from content/reports when there are any. Pages without
// notes stay out of search, so the site never indexes reports that are only the table again.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { chronicle, type ChronicleItem } from "./chronicle.ts";
import { closedTable, closedWeeks, factionWeek, mapRegions, shownRegions, territoryView, type FactionRow, type Region } from "./data.ts";
import type { Lang } from "./i18n.ts";
import { leagues, type League } from "./league.ts";

export type ReportGuild = { id: string; name: string; perMember: number; rank: number; league: League; tier: number | null };
export type ReportMap = {
  ruleset: string;
  items: ChronicleItem[];
  names: string[];
  lords: number;
  claimed: number;
  captured: number;
};

export type Report = {
  week: number;
  region: Region;
  totals: { guilds: number; ranked: number; active: number; levels: number; achievements: number; honor: number };
  podium: Record<League, ReportGuild[]>;
  climbers: (ReportGuild & { up: number })[];
  newcomers: ReportGuild[];
  topTiers: ReportGuild[];
  factions: FactionRow[];
  maps: ReportMap[];
};

const NOTES = path.join(process.cwd(), "content", "reports");

// The owner's notes for a report in one language: paragraphs split on blank lines
export function reportNotes(week: number, region: Region, lang: Lang): string[] {
  const file = path.join(NOTES, `${week}-${region}.${lang}.md`);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
}

export function weekReport(region: Region, week: number): Report | null {
  const table = closedTable(region, week);
  if (!table) return null;
  const ranked = leagues.flatMap((l) => table.ranked[l]);
  const row = (g: (typeof ranked)[number]): ReportGuild => ({ id: g.id, name: g.name, perMember: g.perMember, rank: g.rank!, league: g.league!, tier: g.tier ?? null });

  const maps = territoryView(region).flatMap((m) => {
    const i = m.weeks.findIndex((x) => x.week === week);
    if (i < 0) return [];
    const w = m.weeks[i];
    return [{
      ruleset: m.ruleset,
      items: chronicle(w, m.weeks[i - 1] ?? null, mapRegions()),
      names: m.guilds.map((g) => g.name),
      lords: w.regionLords.filter((x) => x >= 0).length,
      claimed: w.claimed,
      captured: w.captured,
    }];
  });

  return {
    week,
    region,
    totals: {
      guilds: table.guilds.length,
      ranked: ranked.length,
      active: table.guilds.reduce((s, g) => s + g.active, 0),
      levels: table.guilds.reduce((s, g) => s + g.parts.levels + g.parts.reached60, 0),
      achievements: table.guilds.reduce((s, g) => s + g.parts.achievements, 0),
      honor: table.guilds.reduce((s, g) => s + g.parts.honor, 0),
    },
    podium: Object.fromEntries(leagues.map((l) => [l, table.ranked[l].slice(0, 3).map(row)])) as Record<League, ReportGuild[]>,
    climbers: ranked
      .flatMap((g) => (g.change?.kind === "delta" && g.change.n > 0 ? [{ ...row(g), up: g.change.n }] : []))
      .sort((a, b) => b.up - a.up || a.rank - b.rank)
      .slice(0, 3),
    // In week 1 every ranked guild is new, so the list would only repeat the top of the small league
    newcomers: table.week === 0 ? [] : ranked.filter((g) => g.change?.kind === "new").map(row).slice(0, 5),
    topTiers: ranked.filter((g) => (g.tier ?? 0) >= 8).map(row).sort((a, b) => (b.tier ?? 0) - (a.tier ?? 0) || b.perMember - a.perMember),
    factions: factionWeek(table).rows.filter((r) => r.guilds > 0),
    maps,
  };
}

// Every report there is: each closed week in each region with a table for it
export function reportList(): { week: number; region: Region }[] {
  return closedWeeks().flatMap((week) => shownRegions().flatMap((region) => (closedTable(region, week) ? [{ week, region }] : [])));
}
