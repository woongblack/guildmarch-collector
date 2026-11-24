// Daily scoring (DB_Design.md step 3): rebuilds each guild's daily views from the DB, runs the same
// engine the site's mock season uses, and writes week_member, guild_week and badges. A week that
// has ended is closed once (tiers, badges) and its territory march is stored; closed weeks are
// never rewritten.
import { readFileSync } from "node:fs";
import { rankWeek, scoreGuild, type CharacterSnapshot, type DailyGuildView, type TrackedGuild } from "../lib/league.ts";
import { runTerritory, type MapCells, type TerritoryGuild } from "../lib/territory.ts";
import { REGIONS, RULESETS, type Region, type Ruleset } from "../server/types.ts";
import type { Sql } from "./db.ts";
import { loadTables, toDb } from "./tables.ts";
import { EPOCH, MAP_VERSION, SEASON_WEEKS, dayOf, weekStart } from "./time.ts";

export const map: MapCells = JSON.parse(readFileSync(new URL("../lib/map-cells.json", import.meta.url), "utf8"));

type Run = { id: number; at: Date };

// The last finished run of each day from day 0 on
async function runsByDay(sql: Sql, region: Region) {
  const runs = await sql`select id, started_at from collection_run
    where region = ${region} and finished_at is not null order by started_at`;
  const byDay = new Map<number, Run>();
  for (const r of runs) {
    const d = dayOf(r.started_at.getTime());
    if (d >= 0) byDay.set(d, { id: r.id, at: r.started_at });
  }
  return byDay;
}

// Daily views for every guild over days [from, to]: the roster as of each run, and each member's
// snapshot from that run (null when the profile call didn't return 200)
async function trackedGuilds(sql: Sql, region: Region, byDay: Map<number, Run>, from: number, to: number): Promise<TrackedGuild[]> {
  const guilds = await sql`select id, name, registered_at from guild where region = ${region} and status <> 'opted_out' order by id`;
  const days = [...byDay].filter(([d]) => d >= from && d <= to);
  const runIds = days.map(([, r]) => r.id);
  const guildIds = guilds.map((g) => g.id);
  const reads = await sql`select run_id, guild_id, http_status from roster_read where run_id = any(${runIds}::bigint[])`;
  const members = await sql`select guild_id, character_id, joined_seen_at, left_at from guild_member
    where guild_id = any(${guildIds}::bigint[])`;
  const snaps = await sql`select run_id, character_id, http_status, level, honorable_kills, last_login_at
    from character_snapshot where run_id = any(${runIds}::bigint[])`;
  const charIds = [...new Set(members.map((m) => m.character_id))];
  const done = await sql`select character_id, completed_at from character_achievement where character_id = any(${charIds}::bigint[])`;

  const achievements = new Map<string, number[]>();
  for (const a of done) (achievements.get(String(a.character_id)) ?? achievements.set(String(a.character_id), []).get(String(a.character_id))!).push(a.completed_at.getTime());
  const snapOf = new Map(snaps.map((s) => [`${s.run_id}:${s.character_id}`, s]));
  const readOf = new Map(reads.map((r) => [`${r.run_id}:${r.guild_id}`, r.http_status]));

  return guilds.map((g) => {
    const views: (DailyGuildView | undefined)[] = [];
    const mine = members.filter((m) => m.guild_id === g.id);
    for (const [d, run] of days) {
      const t = run.at.getTime();
      if (readOf.get(`${run.id}:${g.id}`) === 404) {
        views[d] = { roster: null, characters: {} };
        continue;
      }
      const roster = mine
        .filter((m) => m.joined_seen_at.getTime() <= t && (!m.left_at || m.left_at.getTime() > t))
        .map((m) => String(m.character_id));
      const characters: Record<string, CharacterSnapshot | null> = {};
      for (const id of roster) {
        const s = snapOf.get(`${run.id}:${id}`);
        characters[id] = s && s.http_status === 200 && s.level != null
          ? { level: s.level, achievements: achievements.get(id) ?? [], honorableKills: s.honorable_kills ?? 0, lastLogin: s.last_login_at?.getTime() ?? 0 }
          : null;
      }
      views[d] = { roster, characters };
    }
    return { id: String(g.id), name: g.name, registeredAt: g.registered_at.getTime(), views };
  });
}

async function scoreWeek(sql: Sql, region: Region, byDay: Map<number, Run>, weekId: number, week: number, asOfDay: number, closed: boolean) {
  // A week back is enough for the start-of-week fallback; older days are never looked at
  const guilds = await trackedGuilds(sql, region, byDay, Math.max(0, week * 7 - 7), asOfDay);
  const history = (await loadTables(sql, region, asOfDay)).filter((t) => t.closed && t.week < week);
  const rows = guilds.map((g) => scoreGuild(g, week, asOfDay, EPOCH, () => false));
  const table = rankWeek(rows, history, week, asOfDay, closed);

  await sql.begin(async (tx) => {
    // Deleting the week's rows also deletes their badges
    await tx`delete from guild_week where week_id = ${weekId}`;
    await tx`delete from week_member where week_id = ${weekId}`;
    if (table.guilds.length) {
      await tx`insert into guild_week ${tx(table.guilds.map((r) => ({
        week_id: weekId,
        guild_id: Number(r.id),
        status: toDb[r.status],
        members: r.members,
        active: r.active,
        levels: r.parts.levels,
        reached60: r.parts.reached60,
        achievements: r.parts.achievements,
        honor: r.parts.honor,
        league: r.league,
        rank: r.rank ?? null,
        change: r.change?.kind ?? null,
        change_n: r.change?.kind === "delta" ? r.change.n : null,
        moved_from: r.change?.kind === "moved" ? r.change.from : null,
        tier: r.tier ?? null,
      })))}`;
    }
    const detail = table.guilds.flatMap((r) => r.members_detail.map((m) => ({
      week_id: weekId,
      guild_id: Number(r.id),
      character_id: Number(m.id),
      eligible: true,
      active: m.active,
      levels: m.parts.levels,
      reached60: m.parts.reached60,
      achievements: m.parts.achievements,
      honor: m.parts.honor,
      carried: m.carried,
      level_capped: m.capped.includes("levels"),
      honor_capped: m.capped.includes("honor"),
    })));
    for (let i = 0; i < detail.length; i += 1000) await tx`insert into week_member ${tx(detail.slice(i, i + 1000))}`;
    const badges = table.guilds.flatMap((r) => r.badges.map((badge) => ({ week_id: weekId, guild_id: Number(r.id), badge })));
    if (badges.length) await tx`insert into guild_week_badge ${tx(badges)}`;
    if (closed) await tx`update week set status = 'closed', closed_at = now() where id = ${weekId}`;
  });
  const ranked = table.guilds.filter((r) => r.status === "ranked").length;
  console.log(`[${region}] week ${week + 1} ${closed ? "closed" : `day ${asOfDay - week * 7}`}: ${table.guilds.length} guilds, ${ranked} ranked`);
}

// The march input for one map: each closed week of the season up to week, as the engine takes it.
// The export rebuilds the march log from the same input (R-30), so it must stay the one source.
export async function seasonInput(sql: Sql, region: Region, ruleset: Ruleset, week: number): Promise<TerritoryGuild[][]> {
  const season = Math.floor(week / SEASON_WEEKS);
  const tables = (await loadTables(sql, region, (week + 1) * 7)).filter((t) => t.closed && t.week >= season * SEASON_WEEKS && t.week <= week);
  const guilds = await sql`select id, registered_at, opted_out_at from guild where region = ${region} and ruleset = ${ruleset}`;
  const mine = new Map(guilds.map((g) => [String(g.id), g]));
  return tables.map((t) => {
    const end = weekStart(t.week + 1);
    const rows = new Map<string, TerritoryGuild>(t.guilds.filter((g) => mine.has(g.id))
      .map((g) => [g.id, { id: g.id, status: g.status, tier: g.tier ?? 0, registeredAt: g.registeredAt }]));
    // An opted-out guild's land empties, like a guild that can't be found
    for (const g of guilds) {
      if (g.opted_out_at && g.opted_out_at.getTime() <= end) rows.set(String(g.id), { id: String(g.id), status: "not-found", tier: 0, registeredAt: g.registered_at.getTime() });
    }
    return [...rows.values()];
  });
}

// The season's map replayed from each closed week's tiers, stored once for the week just closed
async function marchTerritory(sql: Sql, region: Region, weekId: number, week: number) {
  const season = Math.floor(week / SEASON_WEEKS);
  for (const ruleset of RULESETS) {
    const last = runTerritory(map, await seasonInput(sql, region, ruleset, week)).at(-1);
    if (!last) continue;
    const owner = last.owner.map((o) => (o ? Number(o) : null));
    await sql`insert into territory_week (week_id, ruleset, season, map_version, owner, capitals, lords, multiplier, claimed, captured)
      values (${weekId}, ${ruleset}, ${season + 1}, ${MAP_VERSION}, ${owner as number[]}::bigint[], ${sql.json(last.capitals)},
              ${sql.json(last.lords)}, ${last.multiplier}, ${last.claimed}, ${last.captured})
      on conflict do nothing`;
  }
}

export async function compute(sql: Sql) {
  for (const region of REGIONS) {
    const byDay = await runsByDay(sql, region);
    if (!byDay.size) continue;
    const nowDay = Math.max(...byDay.keys());
    const current = Math.floor(nowDay / 7);
    for (let w = 0; w <= current; w++) {
      await sql`insert into week (region, number, starts_at, ends_at)
        values (${region}, ${w + 1}, ${new Date(weekStart(w))}, ${new Date(weekStart(w + 1))}) on conflict do nothing`;
    }
    const weeks = await sql`select id, number from week where region = ${region} and status = 'open' order by number`;
    for (const w of weeks) {
      const week = w.number - 1;
      if (week > current) continue;
      const closed = week < current;
      await scoreWeek(sql, region, byDay, w.id, week, closed ? (week + 1) * 7 : nowDay, closed);
    }
    // Separate from closing, so a march that failed last time is retried on the next run
    const unmarched = await sql`select id, number from week w where region = ${region} and status = 'closed'
      and not exists (select 1 from territory_week t where t.week_id = w.id) order by number`;
    for (const w of unmarched) await marchTerritory(sql, region, w.id, w.number - 1);
  }
}

