// Weekly scoring, leagues and badges. Pure functions over daily snapshots, shaped like the
// Battle.net profile data: one roster per guild per day, one character profile per member per day.
// Rules marked "tentative" are not in Guild_League_Plan.md yet.

export type League = "small" | "medium" | "large";
export const leagues: League[] = ["small", "medium", "large"];

export type Badge =
  | "rank-1" | "rank-2" | "rank-3"
  | "streak" | "climber" | "newcomer"
  | "levels" | "achievements" | "honor";

export const RULES = {
  levelPoint: 1,
  levelCapPerChar: 20,
  reached60: 10,
  achievement: 5,
  honorPer10: 1,
  honorCapPerChar: 10,
  // Characters below this level when the week starts neither score nor count as active
  minLevel: 10,
  minActive: 5,
  climberMin: 2,
  mediumFrom: 20,
  largeFrom: 50,
  // Guild tiers (R-20, draft): share of the league above each tier's cut, lowest tier first
  tierCuts: [1.01, 0.85, 0.7, 0.58, 0.46, 0.34, 0.22, 0.12, 0.05],
  // A league winner gets at least Castellan (tier 8), however small the league (decided 2026-11-08)
  winnerFloor: 8 as number | null,
};

// Tier 1 (lowest) to 9 (highest); file names under public/images/tiers
export const tierSlugs = [
  "banner-bearer-1", "banner-bearer-2", "vanguard-1", "vanguard-2",
  "breaker-1", "breaker-2", "banner-captain", "castellan", "overlord",
] as const;

// Midpoint position in the league, so a winner of a small league doesn't land at the very top
export function tierFor(rank: number, guilds: number): number {
  const position = (rank - 0.5) / guilds;
  let tier = 1;
  RULES.tierCuts.forEach((cut, i) => { if (position < cut) tier = i + 1; });
  return rank === 1 && RULES.winnerFloor ? Math.max(tier, RULES.winnerFloor) : tier;
}

export type CharacterSnapshot = {
  level: number;
  // Completion times of every achievement the character has
  achievements: number[];
  honorableKills: number;
  lastLogin: number;
};

// What one daily collection run saw. null roster: guild not found. null character: that call failed.
export type DailyGuildView = {
  roster: string[] | null;
  characters: Record<string, CharacterSnapshot | null>;
};

export type TrackedGuild = {
  id: string;
  name: string;
  registeredAt: number;
  // views[day] for absolute day index from season start; missing before registration
  views: (DailyGuildView | undefined)[];
};

export type Parts = { levels: number; reached60: number; achievements: number; honor: number };

export type MemberResult = { id: string; active: boolean; parts: Parts; carried: boolean; capped: string[] };

export type Change =
  | { kind: "new" }
  | { kind: "back" }
  | { kind: "moved"; from: League }
  | { kind: "delta"; n: number };

export type GuildWeek = {
  id: string;
  name: string;
  registeredAt: number;
  members: number;
  active: number;
  parts: Parts;
  total: number;
  perMember: number;
  league: League | null;
  status: "ranked" | "too-few-active" | "not-found" | "pending";
  members_detail: MemberResult[];
  rank?: number;
  change?: Change;
  badges: Badge[];
  // Set when the week closes, for ranked guilds only
  tier?: number;
};

export type WeekTable = {
  week: number;
  closed: boolean;
  asOfDay: number;
  guilds: GuildWeek[];
  ranked: Record<League, GuildWeek[]>;
};

const DAY = 86_400_000;

export function leagueFor(active: number): League | null {
  if (active < RULES.minActive) return null;
  if (active < RULES.mediumFrom) return "small";
  if (active < RULES.largeFrom) return "medium";
  return "large";
}

// Latest snapshot at or before `day`; a failed call falls back to the last good one (tentative)
function latest(g: TrackedGuild, id: string, from: number, day: number) {
  for (let d = day; d >= from; d--) {
    const s = g.views[d]?.characters[id];
    if (s) return { snap: s, carried: d !== day };
  }
  return null;
}

function scoreMember(start: CharacterSnapshot, now: CharacterSnapshot, weekStart: number, asOf: number) {
  const capped: string[] = [];
  let levelGain = Math.max(0, now.level - start.level);
  if (levelGain > RULES.levelCapPerChar) { levelGain = RULES.levelCapPerChar; capped.push("levels"); }
  let honor = Math.floor(Math.max(0, now.honorableKills - start.honorableKills) / 10) * RULES.honorPer10;
  if (honor > RULES.honorCapPerChar) { honor = RULES.honorCapPerChar; capped.push("honor"); }
  // Achievements count by their own completion time, so a missed day loses nothing
  const earned = now.achievements.filter((t) => t >= weekStart && t < asOf).length;
  const parts: Parts = {
    levels: levelGain * RULES.levelPoint,
    reached60: start.level < 60 && now.level >= 60 ? RULES.reached60 : 0,
    achievements: earned * RULES.achievement,
    honor,
  };
  return { parts, capped };
}

export function sumParts(p: Parts) {
  return p.levels + p.reached60 + p.achievements + p.honor;
}

export function scoreGuild(
  g: TrackedGuild,
  week: number,
  asOfDay: number,
  seasonStart: number,
  optedOut: (charId: string, day: number) => boolean,
): GuildWeek {
  const startDay = week * 7;
  const weekStart = seasonStart + startDay * DAY;
  const base = { id: g.id, name: g.name, registeredAt: g.registeredAt, badges: [] as Badge[] };
  const empty: Parts = { levels: 0, reached60: 0, achievements: 0, honor: 0 };

  // A guild is scored from the first full week after it registers (tentative)
  if (g.registeredAt > weekStart) {
    return { ...base, members: 0, active: 0, parts: empty, total: 0, perMember: 0, league: null, status: "pending", members_detail: [] };
  }
  const startView = g.views[startDay];
  if (!startView?.roster) {
    return { ...base, members: 0, active: 0, parts: empty, total: 0, perMember: 0, league: null, status: "not-found", members_detail: [] };
  }

  // Only members on the roster when the week starts count, wherever they are later in the week
  const members = startView.roster.filter((id) => !optedOut(id, asOfDay));
  // members counts everyone on the roster; scored members are in detail
  const asOf = seasonStart + asOfDay * DAY;
  const detail: MemberResult[] = [];
  for (const id of members) {
    const start = latest(g, id, 0, startDay);
    const now = latest(g, id, startDay, asOfDay);
    if (!start || !now || start.snap.level < RULES.minLevel) continue;
    const { parts, capped } = scoreMember(start.snap, now.snap, weekStart, asOf);
    detail.push({ id, active: now.snap.lastLogin >= weekStart, parts, carried: now.carried, capped });
  }

  const parts = detail.reduce<Parts>(
    (acc, m) => ({
      levels: acc.levels + m.parts.levels,
      reached60: acc.reached60 + m.parts.reached60,
      achievements: acc.achievements + m.parts.achievements,
      honor: acc.honor + m.parts.honor,
    }),
    empty,
  );
  const active = detail.filter((m) => m.active).length;
  const total = sumParts(parts);
  const league = leagueFor(active);
  return {
    ...base,
    members: members.length,
    active,
    parts,
    total,
    perMember: active ? total / active : 0,
    league,
    status: league ? "ranked" : "too-few-active",
    members_detail: detail,
  };
}

// Guilds with the same score per member share a rank (1, 2, 2, 4); list order then follows registration
const scoreKey = (r: GuildWeek) => Math.round(r.perMember * 10);
function byStanding(a: GuildWeek, b: GuildWeek) {
  return scoreKey(b) - scoreKey(a) || a.registeredAt - b.registeredAt;
}

export function rankWeek(rows: GuildWeek[], history: WeekTable[], week: number, asOfDay: number, closed: boolean): WeekTable {
  const ranked = { small: [], medium: [], large: [] } as Record<League, GuildWeek[]>;
  for (const r of rows) if (r.league) ranked[r.league].push(r);
  const last = history[history.length - 1];
  const everRanked = new Set(history.flatMap((h) => leagues.flatMap((l) => h.ranked[l].map((r) => r.id))));

  for (const l of leagues) {
    ranked[l].sort(byStanding);
    ranked[l].forEach((r, i, all) => {
      r.rank = i > 0 && scoreKey(all[i - 1]) === scoreKey(r) ? all[i - 1].rank : i + 1;
      const prev = last && leagues.map((pl) => ({ pl, row: last.ranked[pl].find((p) => p.id === r.id) })).find((x) => x.row);
      if (!prev) r.change = everRanked.has(r.id) ? { kind: "back" } : { kind: "new" };
      else if (prev.pl !== l) r.change = { kind: "moved", from: prev.pl };
      else r.change = { kind: "delta", n: prev.row!.rank! - r.rank! };
    });
  }

  if (closed) {
    const topThree = (t: WeekTable | undefined, id: string) => !!t && leagues.some((l) => t.ranked[l].some((r) => r.id === id && r.rank! <= 3));
    for (const l of leagues) {
      const rowsL = ranked[l];
      if (!rowsL.length) continue;
      for (const r of rowsL) r.tier = tierFor(r.rank!, rowsL.length);
      for (const r of rowsL) if (r.rank! <= 3) r.badges.push(`rank-${r.rank}` as Badge);
      const h = history;
      for (const r of rowsL) {
        if (r.rank! <= 3 && topThree(h[h.length - 1], r.id) && topThree(h[h.length - 2], r.id)) r.badges.push("streak");
      }
      // Every guild tied for a best value gets the badge (tentative)
      const award = (badge: Badge, value: (r: GuildWeek) => number) => {
        const best = Math.max(...rowsL.map(value));
        if (best > 0) for (const r of rowsL) if (value(r) === best) r.badges.push(badge);
      };
      award("climber", (r) => (r.change?.kind === "delta" && r.change.n >= RULES.climberMin ? r.change.n : 0));
      // In the first week every guild is new, so the badge would mean nothing (tentative)
      if (history.length) for (const r of rowsL) if (r.change?.kind === "new") r.badges.push("newcomer");
      award("levels", (r) => (r.parts.levels + r.parts.reached60) / r.active);
      award("achievements", (r) => r.parts.achievements / r.active);
      award("honor", (r) => r.parts.honor / r.active);
    }
  }
  return { week, closed, asOfDay, guilds: rows, ranked };
}

export function runSeason(
  guilds: TrackedGuild[],
  seasonStart: number,
  nowDay: number,
  optedOut: (charId: string, day: number) => boolean,
  guildOptedOut: (guildId: string, day: number) => boolean,
) {
  const tables: WeekTable[] = [];
  for (let week = 0; week * 7 <= nowDay; week++) {
    const closed = (week + 1) * 7 <= nowDay;
    const asOfDay = closed ? (week + 1) * 7 : nowDay;
    const rows = guilds
      .filter((g) => !guildOptedOut(g.id, asOfDay))
      .map((g) => scoreGuild(g, week, asOfDay, seasonStart, optedOut));
    tables.push(rankWeek(rows, tables, week, asOfDay, closed));
  }
  return tables;
}
