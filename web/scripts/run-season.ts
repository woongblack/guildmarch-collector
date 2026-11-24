// Runs the mock season and checks each scenario. Usage: node scripts/run-season.ts
import { RULES, leagues, scoreGuild, sumParts, type GuildWeek, type WeekTable } from "../lib/league.ts";
import { GUILDS, NOW_DAY, SEASON_START, buildGuild, guildOptedOut, mockSeason, optedOut } from "../lib/mock-season.ts";

const tables = mockSeason();
const names: Record<string, string> = { small: "소", medium: "중", large: "대" };
const row = (t: WeekTable, id: string) => t.guilds.find((g) => g.id === id);
const fmt = (g: GuildWeek) => {
  const c = g.change;
  const change = !c ? "" : c.kind === "new" ? "N" : c.kind === "back" ? "복귀" : c.kind === "moved" ? `${names[c.from]}→` : c.n > 0 ? `▲${c.n}` : c.n < 0 ? `▼${-c.n}` : "–";
  return `| ${g.rank} | ${g.name} | ${g.members} | ${g.active} | ${g.total} | ${g.perMember.toFixed(1)} | ${change} | ${g.badges.join(", ")} |`;
};

for (const t of tables) {
  console.log(`\n## ${t.week + 1}주차 ${t.closed ? "(마감)" : `(진행 중, ${t.asOfDay - t.week * 7}일째)`}`);
  for (const l of leagues) {
    console.log(`\n### ${names[l]} 리그\n\n| 순위 | 길드 | 구성원 | 활동 | 합계 | 인원당 | 변동 | 배지 |\n|---|---|---|---|---|---|---|---|`);
    t.ranked[l].forEach((g) => console.log(fmt(g)));
  }
  const out = t.guilds.filter((g) => g.status !== "ranked");
  if (out.length) console.log(`\n순위 밖: ${out.map((g) => `${g.name}(${g.status}, 활동 ${g.active})`).join(", ")}`);
}

const checks: [string, boolean, string][] = [];
const check = (name: string, ok: boolean, detail: string) => checks.push([name, ok, detail]);
const [w1, w2, w3, w4] = tables;

const tw2 = row(w2, "third-watch")!, tw3 = row(w3, "third-watch")!;
check("주중 영입은 그 주 제외", tw2.members === 17, `2주차 구성원 ${tw2.members}명 (9일차 영입 7명 제외)`);
check("영입 인원은 다음 주 반영", tw3.members === 24, `3주차 구성원 ${tw3.members}명, 활동 ${tw3.active}명, ${tw3.league} 리그`);

const silver = row(w3, "silver-inn")!;
check("활동 5명 미만은 순위 제외", silver.status === "too-few-active", `은빛 여관 3주차 활동 ${silver.active}명, ${silver.status}`);

const ta = row(w1, "twin-a")!, tb = row(w1, "twin-b")!;
check("동점이면 공동 순위", ta.perMember === tb.perMember && ta.rank === tb.rank, `쌍둥이 숲 ${ta.rank}위, Twin Pines ${tb.rank}위, 둘 다 ${ta.perMember.toFixed(1)}`);
const tie3 = w3.ranked.small;
const afterTie = tie3[tie3.findIndex((g) => g.id === "twin-b") + 1];
check("공동 순위 다음은 그 수만큼 건너뜀", !!afterTie && afterTie.rank === tie3.findIndex((g) => g.id === afterTie.id) + 1, `3주차 소 리그: ${tie3.map((g) => `${g.rank}위 ${g.name}`).join(", ")}`);

const ash1 = row(w1, "ash-banner")!, ash2 = row(w2, "ash-banner")!;
check("도중 등록은 다음 주차부터", ash1.status === "pending" && ash2.status === "ranked", `1주차 ${ash1.status}, 2주차 ${ash2.status}`);
check("첫 순위 배지", ash2.badges.includes("newcomer"), `2주차 배지: ${ash2.badges.join(", ")}`);

const hc1 = row(w1, "hollow-crown")!, hc2 = row(w2, "hollow-crown")!;
check("제외 요청한 캐릭터 빠짐", hc1.members === 46 && hc2.members === 45 && !hc2.members_detail.some((m) => m.id === "hollow-crown#3"), `1주차 ${hc1.members}명 → 2주차 ${hc2.members}명`);

const sable3 = row(w3, "sable")!;
check("인원이 줄면 아래 리그로 이동", sable3.league === "medium" && sable3.change?.kind === "moved", `3주차 활동 ${sable3.active}명, ${sable3.league} 리그, 변동 ${JSON.stringify(sable3.change)}`);

const wn4 = row(w4, "white-night")!;
const wn5 = scoreGuild(buildGuild(GUILDS.find((g) => g.id === "white-night")!, 29), 4, 29, SEASON_START, optedOut);
check("해체한 주는 순위 유지, 다음 주부터 제외", wn4.status === "ranked" && wn5.status === "not-found", `4주차 ${wn4.status}(22일차 해체), 5주차 ${wn5.status}`);

// Same guild without the failed calls, to measure what the failures cost
const ffSpec = GUILDS.find((g) => g.id === "first-fire")!;
const ffClean = scoreGuild(buildGuild({ ...ffSpec, events: [] }), 2, 21, SEASON_START, optedOut);
const ff3 = row(w3, "first-fire")!;
const carried = ff3.members_detail.filter((m) => m.carried).length;
check("조회 실패 시 직전 값으로 대체", carried > 0, `마감 조회 실패 ${carried}명, 점수 ${ff3.total} (실패 없을 때 ${ffClean.total}, 손실 ${ffClean.total - ff3.total})`);

const smallRises = tables.filter((t) => t.closed).flatMap((t) => leagues.flatMap((l) => t.ranked[l].filter((g) => g.badges.includes("climber") && g.change?.kind === "delta" && g.change.n < 2)));
check("1계단 상승은 급상승 배지 없음", smallRises.length === 0, `2계단 미만 급상승 배지 ${smallRises.length}건`);
const alt2 = row(w2, "alt-farm")!;
check("주 시작 때 10레벨 미만은 집계 제외", alt2.members === 18 && alt2.members_detail.length === 8, `부캐 농장 2주차 구성원 ${alt2.members}명 중 ${alt2.members_detail.length}명 집계 (1레벨 부캐 10개 제외)`);
const climbers = leagues.flatMap((l) => w3.ranked[l].filter((g) => g.badges.includes("climber")).map((g) => `${g.name}(${JSON.stringify(g.change)})`));
check("급상승 배지 지급", climbers.length > 0, `3주차: ${climbers.join(", ")}`);
const streaks = leagues.flatMap((l) => w3.ranked[l].filter((g) => g.badges.includes("streak")).map((g) => g.name));
check("3주 연속 상위권 배지 지급", streaks.length > 0, `3주차: ${streaks.join(", ") || "없음"}`);
const closedRanked = tables.filter((t) => t.closed).flatMap((t) => leagues.flatMap((l) => t.ranked[l]));
check("마감한 주의 순위 길드는 모두 등급", closedRanked.every((g) => g.tier! >= 1 && g.tier! <= 9), `등급 받은 길드 ${closedRanked.filter((g) => g.tier).length}/${closedRanked.length}`);
check("진행 중인 주와 순위 밖 길드는 등급 없음", w4.guilds.every((g) => g.tier === undefined) && tables.every((t) => t.guilds.every((g) => g.status === "ranked" || g.tier === undefined)), "4주차와 순위 밖 길드에 등급 없음");
check("공동 순위는 같은 등급", ta.tier === tb.tier, `1주차 쌍둥이 숲 ${ta.tier}, Twin Pines ${tb.tier}`);
const tierOrder = tables.filter((t) => t.closed).every((t) => leagues.every((l) => t.ranked[l].every((g, i, all) => i === 0 || all[i - 1].tier! >= g.tier!)));
const winners = tables.filter((t) => t.closed).flatMap((t) => leagues.flatMap((l) => t.ranked[l].filter((g) => g.rank === 1).map((g) => `${t.week + 1}주차 ${g.name} ${g.tier}(${t.ranked[l].length}곳)`)));
check("리그 1위는 최소 성주(8)", tables.filter((t) => t.closed).every((t) => leagues.every((l) => t.ranked[l].filter((g) => g.rank === 1).every((g) => g.tier! >= 8))), winners.join(", "));
check("순위가 낮으면 등급도 같거나 낮음", tierOrder, "마감한 모든 리그에서 순위 순서대로 등급이 내려감");

console.log("\n## 시나리오 확인\n\n| 결과 | 규칙 | 내용 |\n|---|---|---|");
for (const [name, ok, detail] of checks) console.log(`| ${ok ? "통과" : "실패"} | ${name} | ${detail} |`);

// Findings: numbers that test the scoring itself
console.log(`\n## 점수 관찰\n`);
const altLine = (t: WeekTable) => {
  const g = row(t, "alt-farm")!;
  const avg = (alt: boolean) => {
    const m = g.members_detail.filter((x) => (Number(x.id.split("#")[1]) >= 8) === alt);
    return m.length ? `${m.length}개 평균 ${(m.reduce((s, x) => s + sumParts(x.parts), 0) / m.length).toFixed(1)}점` : "0개";
  };
  return `${g.rank}위, 인원당 ${g.perMember.toFixed(1)}, 부캐 ${avg(true)}, 본캐 ${avg(false)}`;
};
const minLevel = RULES.minLevel;
RULES.minLevel = 0;
const noRule = mockSeason();
RULES.minLevel = minLevel;
console.log(`- 부캐 농장 2주차 (1레벨 부캐 10개를 주 시작 직전 영입): 10레벨 기준 없으면 ${altLine(noRule[1])} / 기준 적용 ${altLine(w2)}`);
console.log(`- 부캐 농장 3주차 (부캐가 25레벨 넘어 정상 집계): ${altLine(w3)}`);
const ba = row(w3, "blood-arena")!;
console.log(`- 피의 투기장 3주차: 명예 상한에 걸린 구성원 ${ba.members_detail.filter((m) => m.capped.includes("honor")).length}/${ba.members}명, 명예 점수 인원당 ${(ba.parts.honor / ba.active).toFixed(1)}`);
for (const t of tables) {
  const lr = row(t, "long-road")!;
  const at60 = lr.members_detail.length;
  console.log(`- Long Road ${t.week + 1}주차: 레벨 점수 인원당 ${((lr.parts.levels + lr.parts.reached60) / lr.active).toFixed(1)}, 업적 인원당 ${(lr.parts.achievements / lr.active).toFixed(1)}, 인원당 합계 ${lr.perMember.toFixed(1)} (구성원 ${at60})`);
}
const all = tables.slice(0, 3).flatMap((t) => t.guilds.filter((g) => g.status === "ranked"));
const share = (k: "levels" | "reached60" | "achievements" | "honor") => Math.round((all.reduce((s, g) => s + g.parts[k], 0) / all.reduce((s, g) => s + g.total, 0)) * 100);
console.log(`- 1~3주차 전체 점수 비중: 레벨 ${share("levels")}%, 60 달성 ${share("reached60")}%, 업적 ${share("achievements")}%, 명예 ${share("honor")}%`);
const chars = GUILDS.reduce((s, g) => s + g.size, 0);
console.log(`- 하루 조회: 길드 ${GUILDS.length}개, 캐릭터 약 ${chars}명 → 캐릭터당 3회(프로필, 업적, PvP)면 약 ${chars * 3 + GUILDS.length}회`);
console.log(`- 기준 시점: ${NOW_DAY}일차 (${new Date(SEASON_START + NOW_DAY * 86_400_000).toISOString()})`);
