// Rebuilds the engine's week tables from guild_week rows, for rank history while scoring and for
// the site export. Closed weeks are read back exactly as they were frozen.
import { leagues, type Badge, type GuildWeek, type League, type WeekTable } from "../lib/league.ts";
import type { Region } from "../server/types.ts";
import type { Sql } from "./db.ts";

const fromDb = { ranked: "ranked", too_few_active: "too-few-active", not_found: "not-found", pending: "pending" } as const;
export const toDb = { ranked: "ranked", "too-few-active": "too_few_active", "not-found": "not_found", pending: "pending" } as const;

export async function loadTables(sql: Sql, region: Region, nowDay: number): Promise<WeekTable[]> {
  const weeks = await sql`select id, number, status from week where region = ${region} order by number`;
  if (!weeks.length) return [];
  const ids = weeks.map((w) => w.id);
  const rows = await sql`
    select gw.*, g.name, g.registered_at from guild_week gw join guild g on g.id = gw.guild_id
    where gw.week_id = any(${ids}::bigint[])`;
  const badges = await sql`select week_id, guild_id, badge from guild_week_badge where week_id = any(${ids}::bigint[])`;
  const members = await sql`
    select week_id, guild_id, character_id, active, levels, reached60, achievements, honor, carried, level_capped, honor_capped
    from week_member where week_id = any(${ids}::bigint[]) and eligible`;
  const key = (w: unknown, g: unknown) => `${w}:${g}`;
  const badgeMap = new Map<string, Badge[]>();
  for (const b of badges) (badgeMap.get(key(b.week_id, b.guild_id)) ?? badgeMap.set(key(b.week_id, b.guild_id), []).get(key(b.week_id, b.guild_id))!).push(b.badge);
  const memberMap = new Map<string, GuildWeek["members_detail"]>();
  for (const m of members) {
    const list = memberMap.get(key(m.week_id, m.guild_id)) ?? memberMap.set(key(m.week_id, m.guild_id), []).get(key(m.week_id, m.guild_id))!;
    list.push({
      id: String(m.character_id),
      active: m.active,
      parts: { levels: m.levels, reached60: m.reached60, achievements: m.achievements, honor: m.honor },
      carried: m.carried,
      capped: [...(m.level_capped ? ["levels"] : []), ...(m.honor_capped ? ["honor"] : [])],
    });
  }

  return weeks.map((w) => {
    const closed = w.status === "closed";
    const week = w.number - 1;
    const guilds: GuildWeek[] = rows.filter((r) => r.week_id === w.id).map((r) => {
      const parts = { levels: r.levels, reached60: r.reached60, achievements: r.achievements, honor: r.honor };
      const change = r.change === "delta" ? { kind: "delta" as const, n: r.change_n }
        : r.change === "moved" ? { kind: "moved" as const, from: r.moved_from as League }
        : r.change ? { kind: r.change as "new" | "back" } : undefined;
      return {
        id: String(r.guild_id),
        name: r.name,
        registeredAt: r.registered_at.getTime(),
        members: r.members,
        active: r.active,
        parts,
        total: r.total,
        perMember: r.active ? r.total / r.active : 0,
        league: r.league,
        status: fromDb[r.status as keyof typeof fromDb],
        members_detail: memberMap.get(key(w.id, r.guild_id)) ?? [],
        rank: r.rank ?? undefined,
        change,
        badges: badgeMap.get(key(w.id, r.guild_id)) ?? [],
        tier: r.tier ?? undefined,
      };
    });
    const ranked = Object.fromEntries(leagues.map((l) => [
      l,
      guilds.filter((g) => g.league === l && g.status === "ranked").sort((a, b) => a.rank! - b.rank! || a.registeredAt - b.registeredAt),
    ])) as Record<League, GuildWeek[]>;
    return { week, closed, asOfDay: closed ? (week + 1) * 7 : nowDay, guilds, ranked };
  });
}
