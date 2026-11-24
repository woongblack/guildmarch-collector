// Population page data: every current member of a tracked guild, grouped by region and ruleset.
// Totals only, no names. Characters under 10 have no public profile, so they count in the level
// bands (the roster gives their level) but not in honor or logins.
import type { PopulationGroup } from "../lib/site-data.ts";
import type { Sql } from "./db.ts";
import { DAY } from "./time.ts";

export async function populationStats(sql: Sql, at: Date): Promise<PopulationGroup[]> {
  const rows = await sql`
    with m as (
      select distinct on (c.id) c.id, c.level, c.last_login_at, g.id as guild_id, g.region, g.ruleset, g.faction
      from guild_member gm join guild g on g.id = gm.guild_id join character c on c.id = gm.character_id
      where gm.left_at is null and g.status = 'tracked' and g.ruleset is not null and g.faction is not null
      order by c.id, gm.joined_seen_at desc),
    honor as (
      select distinct on (character_id) character_id, honorable_kills
      from character_snapshot where http_status = 200 and honorable_kills is not null
      order by character_id, fetched_at desc)
    select m.region, m.ruleset,
      count(distinct m.guild_id)::int as guilds,
      count(*)::int as characters,
      count(*) filter (where coalesce(m.level, 0) < 10)::int as l0,
      count(*) filter (where m.level between 10 and 19)::int as l1,
      count(*) filter (where m.level between 20 and 29)::int as l2,
      count(*) filter (where m.level between 30 and 39)::int as l3,
      count(*) filter (where m.level between 40 and 49)::int as l4,
      count(*) filter (where m.level between 50 and 59)::int as l5,
      count(*) filter (where m.level >= 60)::int as l6,
      percentile_cont(0.5) within group (order by m.level) as level_median,
      count(*) filter (where m.faction = 'horde')::int as horde,
      count(h.honorable_kills)::int as honor_read,
      percentile_cont(0.5) within group (order by h.honorable_kills) as honor_median,
      count(*) filter (where h.honorable_kills >= 100)::int as honor100,
      coalesce(max(h.honorable_kills), 0)::int as honor_max,
      count(m.last_login_at)::int as login_read,
      count(*) filter (where m.last_login_at > ${new Date(at.getTime() - 2 * DAY)})::int as active2,
      count(*) filter (where m.last_login_at > ${new Date(at.getTime() - 7 * DAY)})::int as active7
    from m left join honor h on h.character_id = m.id
    group by m.region, m.ruleset
    order by m.region, m.ruleset`;
  return rows.map((r) => ({
    region: r.region,
    ruleset: r.ruleset,
    guilds: r.guilds,
    characters: r.characters,
    levels: [r.l0, r.l1, r.l2, r.l3, r.l4, r.l5, r.l6],
    levelMedian: Math.round(Number(r.level_median ?? 0)),
    horde: r.horde,
    honorRead: r.honor_read,
    honorMedian: Math.round(Number(r.honor_median ?? 0)),
    honor100: r.honor100,
    honorMax: r.honor_max,
    loginRead: r.login_read,
    active2: r.active2,
    active7: r.active7,
  }));
}
