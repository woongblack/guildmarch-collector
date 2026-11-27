// Numbers for the answers people search for most (faction ratio, player count), from the last
// update's population counts, so the first lines answer with the current figures. The rest of each
// answer is in lib/answers-extra.ts. Null before there's real data, and the page then shows the
// text alone.
import { lastRun, population, type Region } from "@/lib/data";
import { locales, t, type Lang } from "@/lib/i18n";
import { POP_MIN } from "@/lib/population-link";
import type { PopulationGroup } from "@/lib/site-data";

export const liveSlugs = new Set(["horde-alliance-ratio", "player-count"]);

type Live = { summary: string; section: { h: string; p: string[] }; asOf: string };

// Same rounding as the population page: one decimal under 10%, whole numbers above
const pct = (n: number, of: number) => {
  const p = of ? (n / of) * 100 : 0;
  return `${p < 10 ? p.toFixed(1) : Math.round(p)}%`;
};
const sum = (gs: PopulationGroup[], f: (g: PopulationGroup) => number) => gs.reduce((n, g) => n + f(g), 0);

export function liveAnswer(slug: string, lang: Lang): Live | null {
  const run = lastRun();
  const all = population();
  if (!liveSlugs.has(slug) || !run || !all.length) return null;
  const dict = t(lang);
  const p = dict.population;
  const num = (n: number) => n.toLocaleString(locales[lang].intl);
  const date = new Intl.DateTimeFormat(locales[lang].intl, { year: "numeric", month: "long", day: "numeric", timeZone: locales[lang].zone }).format(new Date(run));
  const asOf = new Date(run).toISOString();

  if (slug === "horde-alliance-ratio") {
    // Groups too small for their own page swing with one guild, so they're left out here too
    const groups = all.filter((g) => g.characters >= POP_MIN).sort((a, b) => b.horde / b.characters - a.horde / a.characters);
    if (!groups.length) return null;
    const n = sum(groups, (g) => g.characters);
    const horde = sum(groups, (g) => g.horde);
    const where = (g: PopulationGroup) => p.boardWhere(p.regionNames[g.region], dict.join.rulesets[g.ruleset]);
    const H = pct(horde, n), A = pct(n - horde, n);
    const hi = groups[0], lo = groups.at(-1)!;
    const spread = groups.length > 1;
    const rows = groups.map((g) => ({ where: where(g), h: pct(g.horde, g.characters), a: pct(g.characters - g.horde, g.characters), n: num(g.characters) }));
    const text = {
      ko: {
        summary: `${date} 기준 Guild March 등록 길드 캐릭터 ${num(n)}명 가운데 호드 길드가 ${H}, 얼라이언스 길드가 ${A}입니다.${spread ? ` 호드 비율이 가장 높은 곳은 ${where(hi)}(${pct(hi.horde, hi.characters)}), 가장 낮은 곳은 ${where(lo)}(${pct(lo.horde, lo.characters)})입니다.` : ""} 서버 전체가 아니라 등록 길드 표본이라 실제 비율과 다를 수 있습니다.`,
        h: "지역·서버별 호드와 얼라이언스 비율은?",
        row: (r: (typeof rows)[number]) => `${r.where}: 호드 ${r.h}, 얼라이언스 ${r.a} (캐릭터 ${r.n}명)`,
      },
      en: {
        summary: `As of ${date}, ${H} of the ${num(n)} characters in guilds registered on Guild March are in Horde guilds and ${A} in Alliance guilds.${spread ? ` The Horde share is highest on ${where(hi)} (${pct(hi.horde, hi.characters)}) and lowest on ${where(lo)} (${pct(lo.horde, lo.characters)}).` : ""} It's a sample of registered guilds, not whole realms, so the real ratio can differ.`,
        h: "What is the Horde vs Alliance ratio in each region and realm type?",
        row: (r: (typeof rows)[number]) => `${r.where}: Horde ${r.h}, Alliance ${r.a} (${r.n} characters)`,
      },
      "zh-tw": {
        summary: `截至 ${date}，Guild March 已登記公會的 ${num(n)} 名角色中，部落公會佔 ${H}，聯盟公會佔 ${A}。${spread ? `部落比例最高的是${where(hi)}（${pct(hi.horde, hi.characters)}），最低的是${where(lo)}（${pct(lo.horde, lo.characters)}）。` : ""}這是已登記公會的樣本，不是整個伺服器，實際比例可能不同。`,
        h: "各地區與伺服器的部落與聯盟比例是多少？",
        row: (r: (typeof rows)[number]) => `${r.where}：部落 ${r.h}，聯盟 ${r.a}（角色 ${r.n} 名）`,
      },
    }[lang];
    return { summary: text.summary, section: { h: text.h, p: rows.map(text.row) }, asOf };
  }

  // player-count: every group counts toward the totals, small ones included
  const n = sum(all, (g) => g.characters);
  const guilds = sum(all, (g) => g.guilds);
  const at60 = sum(all, (g) => g.levels[6]);
  const regions = [...new Set(all.map((g) => g.region))]
    .map((region: Region) => {
      const gs = all.filter((g) => g.region === region);
      return { name: p.regionNames[region], n: sum(gs, (g) => g.characters), g: sum(gs, (g) => g.guilds), at60: pct(sum(gs, (g) => g.levels[6]), sum(gs, (g) => g.characters)) };
    })
    .sort((a, b) => b.n - a.n);
  type Row = (typeof regions)[number];
  const text = {
    ko: {
      summary: `블리자드는 WoW 포에버의 서버별 인구수를 공개하지 않아 정확한 전체 인구수는 알 수 없습니다. Guild March가 ${date}에 센 등록 길드 ${num(guilds)}곳의 캐릭터는 ${num(n)}명이고, 그중 60레벨은 ${num(at60)}명입니다. 길드가 없는 캐릭터와 등록하지 않은 길드는 빠지므로 전체 인구의 일부입니다.`,
      h: "지역별로는 몇 명인가요?",
      row: (r: Row) => `${r.name}: 캐릭터 ${num(r.n)}명(길드 ${num(r.g)}곳), 60레벨 ${r.at60}`,
    },
    en: {
      summary: `Blizzard doesn't publish population numbers for WoW: Forever realms, so the exact total isn't known. On ${date}, Guild March counted ${num(n)} characters in ${num(guilds)} registered guilds, ${num(at60)} of them at level 60. Characters without a guild and guilds that aren't registered are left out, so this is part of the population.`,
      h: "How many characters are there in each region?",
      row: (r: Row) => `${r.name}: ${num(r.n)} characters in ${num(r.g)} guilds, ${r.at60} at level 60`,
    },
    "zh-tw": {
      summary: `暴雪沒有公布 WoW: Forever 各伺服器的人口數，所以無法得知確切的總人數。Guild March 在 ${date} 統計的 ${num(guilds)} 個已登記公會共有 ${num(n)} 名角色，其中 60 級 ${num(at60)} 名。沒有公會的角色與未登記的公會不計入，所以這只是人口的一部分。`,
      h: "各地區有多少角色？",
      row: (r: Row) => `${r.name}：角色 ${num(r.n)} 名（公會 ${num(r.g)} 個），60 級 ${r.at60}`,
    },
  }[lang];
  return { summary: text.summary, section: { h: text.h, p: regions.map(text.row) }, asOf };
}
