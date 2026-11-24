// A made-up four-week season for testing the scoring rules and the site. Deterministic: the same
// seed always produces the same characters, play sessions and API failures. Never real players.
import { runSeason, type CharacterSnapshot, type DailyGuildView, type TrackedGuild } from "./league.ts";

const DAY = 86_400_000;
// Week one starts Thursday, November 19, 08:00 Korea time
export const SEASON_START = Date.UTC(2026, 10, 18, 23, 0);
// "Now" for the mock: Monday of week four, 08:00 Korea time
export const NOW_DAY = 25;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Persona = { hours: number; loginRate: number; pvp: number };
const PERSONAS = {
  casual: { hours: 1.5, loginRate: 0.55, pvp: 0.1 },
  regular: { hours: 3, loginRate: 0.75, pvp: 0.2 },
  hardcore: { hours: 6, loginRate: 0.95, pvp: 0.3 },
  pvper: { hours: 4, loginRate: 0.85, pvp: 1.4 },
  dormant: { hours: 1, loginRate: 0.02, pvp: 0 },
  // A fresh alt played hard to farm the easy early levels
  alt: { hours: 3, loginRate: 0.95, pvp: 0 },
} satisfies Record<string, Persona>;
type PersonaName = keyof typeof PERSONAS;

type Char = {
  id: string;
  level: number;
  achievements: number[];
  honorableKills: number;
  lastLogin: number;
  persona: PersonaName;
};

// Rough leveling speed in levels per hour played; slower toward 60
function levelRate(level: number) {
  if (level < 20) return 1.6;
  if (level < 30) return 0.9;
  if (level < 40) return 0.55;
  if (level < 50) return 0.38;
  if (level < 60) return 0.25;
  return 0;
}

function playDay(c: Char, dayStart: number, r: () => number) {
  const p = PERSONAS[c.persona];
  if (r() >= p.loginRate) return;
  const hours = p.hours * (0.5 + r());
  for (let h = 0; h < hours; h += 0.5) {
    const t = dayStart + (h / 24) * DAY;
    const before = Math.floor(c.level);
    c.level = Math.min(60, c.level + levelRate(c.level) * 0.5);
    const after = Math.floor(c.level);
    // Assumes level milestone achievements (10, 20, ... 60) exist in Forever, as in the original game
    for (let l = before + 1; l <= after; l++) if (l % 10 === 0) c.achievements.push(t);
    if (r() < (c.level >= 40 ? 0.06 : 0.03)) c.achievements.push(t);
    if (c.level >= 20) c.honorableKills += Math.round(p.pvp * 12 * r());
  }
  c.lastLogin = dayStart + Math.min(hours, 23) * 3_600_000;
}

function snapshot(c: Char): CharacterSnapshot {
  return { level: Math.floor(c.level), achievements: [...c.achievements], honorableKills: c.honorableKills, lastLogin: c.lastLogin };
}

type Mix = Partial<Record<PersonaName, number>>;
type Event =
  | { type: "join"; day: number; count: number; persona: PersonaName; level: [number, number] }
  | { type: "leave"; day: number; count: number }
  | { type: "persona"; day: number; share: number; persona: PersonaName }
  | { type: "apiErrors"; day: number; rate: number }
  | { type: "disband"; day: number };

export type GuildSpec = {
  id: string;
  name: string;
  size: number;
  level: [number, number];
  mix: Mix;
  registeredDay?: number;
  seed: number;
  events?: Event[];
  // Which scenario this guild exists to test
  scenario: string;
};

export const GUILDS: GuildSpec[] = [
  { id: "late-supper", name: "늦은 저녁 모임", size: 10, level: [24, 38], mix: { hardcore: 4, regular: 5, dormant: 1 }, seed: 11, scenario: "평범한 소규모 상위권 길드" },
  { id: "ember-oath", name: "Ember Oath", size: 15, level: [28, 40], mix: { hardcore: 6, regular: 8, dormant: 1 }, seed: 12, scenario: "3주 연속 상위권 배지" },
  { id: "silver-inn", name: "은빛 여관", size: 7, level: [20, 34], mix: { regular: 6, dormant: 1 }, seed: 13, events: [{ type: "leave", day: 13, count: 3 }], scenario: "3명이 나가 활동 인원이 5명 밑으로 떨어지면 순위 제외" },
  { id: "third-watch", name: "Third Watch", size: 17, level: [22, 36], mix: { regular: 12, casual: 4, dormant: 1 }, seed: 14, events: [{ type: "join", day: 9, count: 7, persona: "regular", level: [18, 30] }], scenario: "주중 영입은 다음 주부터, 인원이 늘어 소→중 리그 이동" },
  { id: "alt-farm", name: "부캐 농장", size: 8, level: [30, 42], mix: { regular: 8 }, seed: 15, events: [{ type: "join", day: 7, count: 10, persona: "alt", level: [1, 1] }], scenario: "주 시작 직전에 1레벨 부캐 10개를 영입해 쉬운 저레벨 구간 점수를 쓸어 담는 경우" },
  { id: "twin-a", name: "쌍둥이 숲", size: 6, level: [26, 26], mix: { regular: 6 }, seed: 16, registeredDay: -5, scenario: "동점 처리 (같은 시드, 먼저 등록)" },
  { id: "twin-b", name: "Twin Pines", size: 6, level: [26, 26], mix: { regular: 6 }, seed: 16, registeredDay: -2, scenario: "동점 처리 (같은 시드, 나중 등록)" },
  { id: "north-patrol", name: "북부 순찰대", size: 33, level: [25, 40], mix: { hardcore: 10, regular: 18, casual: 3, dormant: 2 }, seed: 21, scenario: "평범한 중규모 상위권 길드" },
  { id: "hollow-crown", name: "Hollow Crown", size: 46, level: [24, 38], mix: { regular: 30, casual: 12, dormant: 4 }, seed: 22, scenario: "구성원 한 명이 순위 제외를 요청" },
  { id: "tuesday", name: "화요일 모임", size: 25, level: [18, 30], mix: { casual: 15, regular: 8, dormant: 2 }, seed: 23, events: [{ type: "persona", day: 14, share: 0.7, persona: "hardcore" }], scenario: "길드 행사로 3주차에 급상승" },
  { id: "long-road", name: "Long Road", size: 38, level: [44, 54], mix: { hardcore: 20, regular: 16, dormant: 2 }, seed: 24, scenario: "대부분 60 도달 후 레벨 점수가 멈추는 경우" },
  { id: "ash-banner", name: "잿빛 깃발", size: 27, level: [20, 32], mix: { regular: 20, casual: 5, dormant: 2 }, registeredDay: 3, seed: 25, scenario: "1주차 도중 등록 → 2주차부터 집계, 첫 순위 배지" },
  { id: "blood-arena", name: "피의 투기장", size: 26, level: [30, 45], mix: { pvper: 24, dormant: 2 }, seed: 26, scenario: "명예 킬 상한에 모두 걸리는 PvP 길드" },
  { id: "continental", name: "대륙 횡단 연합", size: 120, level: [20, 40], mix: { hardcore: 25, regular: 60, casual: 30, dormant: 5 }, seed: 31, scenario: "평범한 대규모 상위권 길드" },
  { id: "ironhold", name: "Ironhold Company", size: 72, level: [22, 38], mix: { hardcore: 15, regular: 40, casual: 14, dormant: 3 }, seed: 32, scenario: "대규모 2위권" },
  { id: "first-fire", name: "첫 번째 모닥불", size: 150, level: [18, 36], mix: { regular: 70, casual: 70, dormant: 10 }, seed: 33, events: [{ type: "apiErrors", day: 21, rate: 0.15 }], scenario: "3주차 마감 조회에서 캐릭터 15% 실패" },
  { id: "sable", name: "Sable Company", size: 58, level: [24, 36], mix: { regular: 40, casual: 15, dormant: 3 }, seed: 34, events: [{ type: "leave", day: 13, count: 9 }], scenario: "구성원이 빠져 대→중 리그 이동" },
  { id: "white-night", name: "백야단", size: 88, level: [22, 38], mix: { regular: 55, casual: 28, dormant: 5 }, seed: 35, events: [{ type: "disband", day: 22 }], scenario: "4주차에 길드 해체(조회 404)" },
];

// Every mock guild is on a Korean realm; ruleset and faction feed the guild and faction pages
export const AFFILIATION: Record<string, { ruleset: "pvp" | "normal"; faction: "horde" | "alliance" }> = {
  "late-supper": { ruleset: "pvp", faction: "horde" },
  "ember-oath": { ruleset: "normal", faction: "alliance" },
  "silver-inn": { ruleset: "normal", faction: "alliance" },
  "third-watch": { ruleset: "pvp", faction: "alliance" },
  "alt-farm": { ruleset: "pvp", faction: "horde" },
  "twin-a": { ruleset: "normal", faction: "horde" },
  "twin-b": { ruleset: "normal", faction: "alliance" },
  "north-patrol": { ruleset: "pvp", faction: "alliance" },
  "hollow-crown": { ruleset: "normal", faction: "horde" },
  tuesday: { ruleset: "normal", faction: "alliance" },
  "long-road": { ruleset: "pvp", faction: "horde" },
  "ash-banner": { ruleset: "pvp", faction: "horde" },
  "blood-arena": { ruleset: "pvp", faction: "horde" },
  continental: { ruleset: "normal", faction: "alliance" },
  ironhold: { ruleset: "pvp", faction: "alliance" },
  "first-fire": { ruleset: "normal", faction: "horde" },
  sable: { ruleset: "pvp", faction: "alliance" },
  "white-night": { ruleset: "normal", faction: "horde" },
};

// Requests to hide a character or a guild, with the day they arrive
export const OPT_OUTS = {
  characters: [{ guild: "hollow-crown", index: 3, day: 10 }],
  guilds: [] as { guild: string; day: number }[],
};

function pick(mix: Mix, r: () => number): PersonaName {
  const entries = Object.entries(mix) as [PersonaName, number][];
  let x = r() * entries.reduce((s, [, w]) => s + w, 0);
  for (const [name, w] of entries) if ((x -= w) < 0) return name;
  return entries[0][0];
}

function makeChar(id: string, persona: PersonaName, level: [number, number], r: () => number): Char {
  const lv = level[0] + Math.floor(r() * (level[1] - level[0] + 1));
  // Achievements earned before the season; only the count matters
  const old = Array.from({ length: Math.floor(lv / 10) + Math.floor(r() * 4) }, () => SEASON_START - 5 * DAY);
  return { id, level: lv, achievements: old, honorableKills: lv >= 20 ? Math.floor(r() * 300) : 0, lastLogin: SEASON_START - 2 * DAY, persona };
}

export function buildGuild(spec: GuildSpec, days = 28): TrackedGuild {
  const r = rng(spec.seed);
  const chars: Char[] = [];
  let roster: string[] = [];
  for (let i = 0; i < spec.size; i++) {
    const c = makeChar(`${spec.id}#${i}`, pick(spec.mix, r), spec.level, r);
    chars.push(c);
    roster.push(c.id);
  }
  const registered = spec.registeredDay ?? -3;
  const views: (DailyGuildView | undefined)[] = [];
  let disbanded = false;
  const events = spec.events ?? [];

  for (let day = 0; day <= days; day++) {
    const dayStart = SEASON_START + day * DAY;
    for (const e of events.filter((ev) => ev.day === day)) {
      if (e.type === "join") {
        for (let i = 0; i < e.count; i++) {
          const c = makeChar(`${spec.id}#${chars.length}`, e.persona, e.level, r);
          c.lastLogin = dayStart;
          chars.push(c);
          roster.push(c.id);
        }
      } else if (e.type === "leave") {
        roster = roster.slice(0, roster.length - e.count);
      } else if (e.type === "persona") {
        for (const c of chars) if (r() < e.share) c.persona = e.persona;
      } else if (e.type === "disband") {
        disbanded = true;
      }
    }
    // The collector runs at 08:00 each day, after the previous day's play, once the guild is registered
    const failures = events.find((ev) => ev.type === "apiErrors" && ev.day === day);
    const errorRate = failures?.type === "apiErrors" ? failures.rate : 0;
    if (day >= registered) {
      const characters: Record<string, CharacterSnapshot | null> = {};
      for (const c of chars) characters[c.id] = r() < errorRate ? null : snapshot(c);
      views[day] = { roster: disbanded ? null : [...roster], characters };
    }
    for (const c of chars) playDay(c, dayStart, r);
  }
  return { id: spec.id, name: spec.name, registeredAt: SEASON_START + registered * DAY, views };
}

export function optedOut(charId: string, day: number) {
  return OPT_OUTS.characters.some((o) => charId === `${o.guild}#${o.index}` && o.day <= day);
}

export function guildOptedOut(guildId: string, day: number) {
  return OPT_OUTS.guilds.some((o) => o.guild === guildId && o.day <= day);
}

export function mockSeason(nowDay = NOW_DAY) {
  const guilds = GUILDS.map((s) => buildGuild(s));
  return runSeason(guilds, SEASON_START, nowDay, optedOut, guildOptedOut);
}
