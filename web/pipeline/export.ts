// Site export (DB_Design.md step 3): week tables, guilds and stored territory maps to data/site.json,
// which the static build reads. Opted-out guilds are left out, and their land shows as unclaimed.
import { mkdirSync, writeFileSync } from "node:fs";
import type { RegionData, SiteData, SiteGuild, TerritoryRecord } from "../lib/site-data.ts";
import { leagues } from "../lib/league.ts";
import { provisionalWeek, runTerritory, type MarchEvent } from "../lib/territory.ts";
import { map, seasonInput } from "./compute.ts";
import { REGIONS, RULESETS } from "../server/types.ts";
import type { Sql } from "./db.ts";
import { populationStats } from "./population.ts";
import { loadTables } from "./tables.ts";
import { SEASON_WEEKS, dayOf } from "./time.ts";

export const OUT = new URL("../data/site.json", import.meta.url);

export async function exportSite(sql: Sql) {
  const [last] = await sql`select max(started_at) as at from collection_run where finished_at is not null`;
  const lastRun: number | null = last?.at ? last.at.getTime() : null;
  const rows = await sql`select id, name, region, ruleset, faction, status, roster_size from guild order by id`;
  const hidden = new Set(rows.filter((g) => g.status === "opted_out").map((g) => String(g.id)));
  const guilds: SiteGuild[] = rows
    .filter((g) => !hidden.has(String(g.id)) && g.ruleset && g.faction)
    .map((g) => ({ id: String(g.id), name: g.name, region: g.region, ruleset: g.ruleset, faction: g.faction, roster: g.roster_size }));

  const regions = {} as SiteData["regions"];
  for (const region of REGIONS) {
    const [run] = await sql`select max(started_at) as at from collection_run where region = ${region} and finished_at is not null`;
    const nowDay = run?.at ? dayOf(run.at.getTime()) : 0;
    const tables = (await loadTables(sql, region, nowDay)).map((t) => ({
      ...t,
      guilds: t.guilds.filter((g) => !hidden.has(g.id)),
      ranked: Object.fromEntries(leagues.map((l) => [l, t.ranked[l].filter((g) => !hidden.has(g.id))])) as typeof t.ranked,
    }));

    // Only the latest season's maps are shown; older seasons stay in the DB as records
    const maps = await sql`
      select w.number, tw.ruleset, tw.season, tw.owner, tw.capitals, tw.lords, tw.multiplier, tw.claimed, tw.captured
      from territory_week tw join week w on w.id = tw.week_id
      where w.region = ${region} order by w.number`;
    const season = Math.max(0, ...maps.map((m) => m.season));
    const territory = Object.fromEntries(RULESETS.map((r) => [r, [] as TerritoryRecord[]])) as RegionData["territory"];
    const forecast: RegionData["forecast"] = {};
    // bigint[] comes back from Postgres as strings, with empty cells as "NULL"
    const cellOwner = (o: unknown) => (o == null || o === "NULL" ? null : String(o));
    const shown = (id: unknown) => cellOwner(id) !== null && !hidden.has(String(id));
    // Opted-out guilds drop out of the log too; land they took shows as taken from nobody
    const visible = (events: MarchEvent[]) => events.filter((e) => shown(e.guild)).map((e) =>
      e.kind === "hold" ? (shown(e.from) ? e : null) : e.kind === "capital" ? e : { ...e, from: shown(e.from) ? e.from : null }).filter((e) => e !== null);
    const lastClosed = Math.max(-1, ...tables.filter((t) => t.closed).map((t) => t.week));
    // No forecast on the reset day: nobody has scored in the new week, so the march would be empty
    const open = tables.find((t) => !t.closed && t.week === lastClosed + 1 && t.guilds.some((g) => g.status === "ranked"));
    const logs = new Map<string, ReturnType<typeof runTerritory>>();
    for (const ruleset of RULESETS) {
      if (lastClosed < 0) continue;
      const input = await seasonInput(sql, region, ruleset, lastClosed);
      logs.set(ruleset, runTerritory(map, input));
      // R-31: the open week's march as if it closed now; a new season starts from an empty map
      if (open) {
        const ids = new Set(rows.filter((g) => g.region === region && g.ruleset === ruleset && !hidden.has(String(g.id))).map((g) => String(g.id)));
        const base = Math.floor(open.week / SEASON_WEEKS) === Math.floor(lastClosed / SEASON_WEEKS) ? input : [];
        const ahead = runTerritory(map, [...base, provisionalWeek(open, ids)]).at(-1)!;
        forecast[ruleset] = {
          week: open.week,
          owner: ahead.owner.map((o) => (shown(o) ? o : null)),
          capitals: Object.fromEntries(Object.entries(ahead.capitals).filter(([id]) => shown(id))),
          lords: Object.fromEntries(Object.entries(ahead.lords).filter(([, id]) => shown(id))),
          multiplier: ahead.multiplier,
          claimed: ahead.claimed,
          captured: ahead.captured,
          events: visible(ahead.events),
        };
      }
    }
    for (const m of maps) {
      if (m.season !== season) continue;
      // The rebuilt week must match the stored map cell for cell, or the log is left out
      const run = logs.get(m.ruleset);
      // Stored seasons count from 1, weeks from 1; the rebuilt run starts at the season's first week
      const k = m.number - 1 - (season - 1) * SEASON_WEEKS;
      const rebuilt = run?.[k];
      const same = rebuilt && rebuilt.owner.every((o, i) => (o ?? null) === cellOwner(m.owner[i]));
      territory[m.ruleset as keyof typeof territory].push({
        week: m.number - 1,
        owner: m.owner.map((o: number | null) => (shown(o) ? String(o) : null)),
        capitals: Object.fromEntries(Object.entries(m.capitals as Record<string, number>).filter(([id]) => shown(id))),
        lords: Object.fromEntries(Object.entries(m.lords as Record<string, string>).filter(([, id]) => shown(id))),
        multiplier: m.multiplier,
        claimed: m.claimed,
        captured: m.captured,
        ...(same ? { events: visible(rebuilt.events) } : {}),
      });
      if (rebuilt && !same) console.log(`[${region}] week ${m.number} ${m.ruleset}: rebuilt map differs from the stored one, no march log`);
    }
    regions[region] = { tables, territory, forecast };
  }

  // R-14: names for the members of the current and last closed week, the ones the guild pages list
  const memberIds = [...new Set(REGIONS.flatMap((r) => regions[r].tables.slice(-2).flatMap((t) => t.guilds.flatMap((g) => g.members_detail.map((m) => m.id)))))];
  const chars = memberIds.length ? await sql`select id, name, level from character where id = any(${memberIds}::bigint[])` : [];
  const characters = Object.fromEntries(chars.map((c) => [String(c.id), { name: c.name as string, level: (c.level as number | null) ?? null }]));

  // The population page counts members as of the last run, so "logged in within 7 days" means the same on every build
  const population = await populationStats(sql, new Date(lastRun ?? Date.now()));

  const data: SiteData = { lastRun, guilds, regions, characters, population };
  mkdirSync(new URL(".", OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data));
  const weeks = REGIONS.map((r) => `${r} ${regions[r].tables.length}`).join(", ");
  console.log(`export: ${guilds.length} guilds; weeks ${weeks}; population ${population.reduce((n, g) => n + g.characters, 0)} characters`);
}
