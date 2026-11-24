// Data reports: one-off studies from public game data, published on the site (the owner doesn't
// post on forums). Each report reads its totals from web/survey at build time, so the numbers on
// the page are the survey's own; the words around them live here in three languages.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Lang } from "./i18n.ts";
import { guideInsights } from "./insights-guides.ts";

export type SurveyTotals = {
  surveyedAt: string;
  listed: number;
  found: number;
  guildSize: { rosterMedian: number; rosterBuckets: Record<string, number>; active7Median: number; activeShareMedian: number };
  factions: Record<"horde" | "alliance", { guilds: number; roster: number; active7: number }>;
  rulesets: Record<"pvp" | "normal", { guilds: number; activeHonorMedian: number; activeHonorP90: number; activeWithHonor: number }>;
  members: {
    total: number;
    levels: Record<string, number>;
    at60: number;
    levelMedian: number;
    active7: number;
    active3: number;
    achievementsMedian: number;
    achievementsP90: number;
  };
};

// A small table inside a report section; cells are already formatted for the language
export type InsightTable = { head: string[]; rows: string[][] };

export type Insight = {
  slug: string;
  date: string;
  // Survey totals for the charts; guides written from the site's own data carry their numbers in the text
  file?: string;
  text: Record<Lang, { title: string; lead: string; description: string; method: string[]; sections: { h: string; p: string[]; chart?: "levels" | "factions" | "sizes"; table?: InsightTable }[]; close: string[] }>;
};

export const insights: Insight[] = [
  {
    slug: "guild-survey-2026-11",
    date: "2026-11-15",
    file: "out-2026-11-15.json",
    text: {
      ko: {
        title: "포에버 출시 11일차, 모집 중인 길드 30곳 · 3,180명 데이터로 본 현황",
        lead: "첫 주차를 앞두고 지금 사람을 모으고 있는 포에버 길드들이 어떤 모습인지 블리자드 공개 데이터로 들여다봤습니다.",
        description: "WoW 포에버 길드 30곳, 캐릭터 3,180명의 공개 데이터 조사: 길드 크기, 최근 7일 접속 비율, 레벨 분포, 진영별 인원, PvP 서버 명예 킬 참여율.",
        method: [
          "대상: 인벤 길드 홍보 게시판에서 \"포에버\"로 검색한 모집 글 4쪽 분량에 나온 길드 34곳 중, 블리자드 API로 찾을 수 있었던 30곳(대부분 한국, 북미 일부).",
          "범위: 30개 길드 명단에 있는 캐릭터 3,180명. 기준 시각은 2026년 11월 15일(토) 밤 11시(한국 시간).",
          "블리자드가 공개하는 레벨, 업적, 명예 킬, 마지막 접속 시각만 썼습니다. 길드와 캐릭터 이름은 싣지 않고 접속 시각은 \"최근 7일 안에 접속했는지\" 세는 데만 썼습니다.",
          "지금 한창 사람을 모으는 길드라 포에버 전체 평균보다 활발한 쪽으로 치우쳐 있을 수 있습니다.",
        ],
        sections: [
          { h: "길드 크기: 생각보다 큽니다", chart: "sizes", p: ["명단 인원 중앙값은 54명입니다. 30곳 중 9곳이 출시 11일 만에 100명을 넘었고, 30명 미만은 7곳뿐입니다."] },
          { h: "길드원 10명 중 9명이 일주일 안에 접속", p: ["명단의 88%가 최근 7일 안에, 83%가 최근 3일 안에 접속했습니다. 길드별로 보면 활동 비율 중앙값이 91%입니다.", "10레벨 미만 캐릭터는 프로필이 공개되지 않아 \"접속 안 함\"으로 셌기 때문에 실제 활동 비율은 조금 더 높습니다."] },
          { h: "레벨: 20대가 가장 많고, 60은 아직 10명", chart: "levels", p: ["레벨 중앙값은 26입니다. 20~29레벨이 31%로 가장 많고, 40레벨 이상은 13%입니다. 60레벨에 도달한 캐릭터는 3,180명 중 10명(0.3%)입니다."] },
          { h: "진영: 이 표본에서는 호드 길드가 더 큽니다", chart: "factions", p: ["길드 수는 호드와 얼라이언스가 15곳씩 같은데 명단 인원은 호드가 2,030명, 얼라이언스가 1,150명으로 호드가 1.8배입니다. 길드당 평균으로는 135명과 77명입니다.", "모집 글을 올린 길드 기준이라 서버 전체의 진영 비율과는 다를 수 있습니다."] },
          { h: "PvP 서버와 일반 서버", p: ["PvP 서버 길드(21곳)는 최근 7일 접속한 길드원의 57%가 명예 킬을 1번 이상 기록했고 상위 10%는 18킬 이상입니다. 일반 서버 길드(5곳)는 10%만 명예 킬이 있습니다.", "아직 레벨 구간이라 PvP 서버도 명예 킬 중앙값은 1킬입니다. 본격적인 필드 쟁은 이제부터로 보입니다."] },
          { h: "업적은 아직 조용합니다", p: ["캐릭터당 달성한 업적은 중앙값 2개, 상위 10%가 6개 이상입니다."] },
        ],
        close: [
          "정리하면, 모집 중인 길드는 이미 크고 길드원 대부분이 매일같이 접속하며 레벨은 20~30대에 몰려 있습니다. 이 표본에서는 호드 길드 명단이 얼라이언스의 1.8배였습니다.",
          "Guild March는 같은 공개 데이터로 등록 길드의 주간 점수를 매일 계산합니다. 첫 주차가 끝나면 등록 길드 전체를 대상으로 같은 숫자를 다시 보여 드리겠습니다.",
        ],
      },
      en: {
        title: "Day 11 of WoW Forever: 30 recruiting guilds and 3,180 characters in numbers",
        lead: "Before week one, a look at the Forever guilds now recruiting, through Blizzard's public data.",
        description: "A public-data study of 30 WoW Forever guilds and 3,180 characters: guild size, 7-day activity, level spread, faction size and PvP-server honor kills.",
        method: [
          "Sample: 34 guilds named in recruiting posts on Inven's guild board (a Korean forum) when searching \"Forever\", four pages deep; 30 of them could be found through Blizzard's API (mostly Korea, a few in the Americas).",
          "Scope: the 3,180 characters on those 30 rosters, as of 11 PM Korea time on Saturday, November 15, 2026.",
          "Only public data was used: level, achievements, honor kills and last login. No guild or character names are given, and login times were used only to count who played in the last 7 days.",
          "These are guilds busy recruiting, so they may be more active than Forever as a whole.",
        ],
        sections: [
          { h: "Guild size: bigger than you'd think", chart: "sizes", p: ["The median roster is 54. Nine of the 30 guilds passed 100 members in 11 days; only seven have fewer than 30."] },
          { h: "Nine in ten members played this week", p: ["88% of roster members logged in within the last 7 days, 83% within 3 days. By guild, the median active share is 91%.", "Characters under level 10 have no public profile and were counted as not playing, so real activity is a little higher."] },
          { h: "Levels: most are in their 20s, ten have reached 60", chart: "levels", p: ["The median level is 26. Levels 20 to 29 are the largest group at 31%, and 13% are level 40 or higher. Ten of the 3,180 characters (0.3%) have reached 60."] },
          { h: "Factions: Horde guilds are larger in this sample", chart: "factions", p: ["There are 15 guilds on each side, but Horde rosters hold 2,030 characters against 1,150 for the Alliance: 1.8 times as many, or 135 against 77 per guild.", "These are recruiting guilds only, so the realm-wide split may differ."] },
          { h: "PvP realms and normal realms", p: ["On PvP realms (21 guilds), 57% of the members active this week have at least one honor kill, and the top 10% have 18 or more. On normal realms (5 guilds), only 10% do.", "Everyone is still leveling, so even on PvP realms the median is one kill. World PvP seems to be just starting."] },
          { h: "Achievements are still quiet", p: ["The median character has 2 achievements; the top 10% have 6 or more."] },
        ],
        close: [
          "In short: recruiting guilds are already large, most members play almost daily, and levels cluster in the 20s and 30s. In this sample, Horde rosters were 1.8 times the Alliance's.",
          "Guild March scores registered guilds every day from the same public data. After week one closes, we'll show these numbers again for every registered guild.",
        ],
      },
      "zh-tw": {
        title: "Forever 開服第 11 天：從 30 個招募中公會、3,180 名角色看現況",
        lead: "第一週開始前，我們用 Blizzard 公開資料看看目前正在招募的 Forever 公會是什麼樣子。",
        description: "WoW Forever 30 個公會、3,180 名角色的公開資料調查：公會規模、近 7 天上線比例、等級分布、陣營人數與 PvP 伺服器榮譽擊殺參與率。",
        method: [
          "對象：在韓國論壇 Inven 公會宣傳板搜尋「Forever」的招募文（4 頁）中出現的 34 個公會，其中能用 Blizzard API 找到的 30 個（多為韓國，少數美洲）。",
          "範圍：這 30 個公會名單上的 3,180 名角色，時間為 2026 年 11 月 15 日（六）晚上 11 點（韓國時間）。",
          "只使用 Blizzard 公開的等級、成就、榮譽擊殺與最後登入時間。不刊登公會與角色名稱，登入時間只用來計算「近 7 天內是否上線」。",
          "這些是正在積極招募的公會，可能比 Forever 整體更活躍。",
        ],
        sections: [
          { h: "公會規模：比想像中大", chart: "sizes", p: ["名單人數中位數為 54 人。30 個公會中有 9 個在開服 11 天內就超過 100 人，不到 30 人的只有 7 個。"] },
          { h: "十個成員中有九個本週有上線", p: ["名單上 88% 的角色在近 7 天內上線，83% 在近 3 天內上線。以公會來看，活躍比例中位數為 91%。", "10 級以下角色沒有公開資料，被算作未上線，因此實際活躍比例會再高一些。"] },
          { h: "等級：20 多級最多，60 級目前 10 人", chart: "levels", p: ["等級中位數為 26。20～29 級最多，佔 31%，40 級以上佔 13%。3,180 名角色中有 10 名（0.3%）達到 60 級。"] },
          { h: "陣營：在這個樣本中部落公會較大", chart: "factions", p: ["部落與聯盟各有 15 個公會，但名單人數部落 2,030 人、聯盟 1,150 人，部落是 1.8 倍；平均每個公會為 135 人與 77 人。", "這只是正在招募的公會，伺服器整體的陣營比例可能不同。"] },
          { h: "PvP 伺服器與一般伺服器", p: ["PvP 伺服器公會（21 個）中，本週有上線的成員有 57% 至少有 1 次榮譽擊殺，前 10% 在 18 次以上。一般伺服器公會（5 個）只有 10%。", "大家都還在練等，PvP 伺服器的中位數也只有 1 次。野外 PvP 看來才剛開始。"] },
          { h: "成就還很安靜", p: ["每個角色達成的成就中位數為 2 個，前 10% 為 6 個以上。"] },
        ],
        close: [
          "總結：正在招募的公會已經很大，大多數成員幾乎每天上線，等級集中在 20～30 多級。在這個樣本中，部落公會名單是聯盟的 1.8 倍。",
          "Guild March 每天用同樣的公開資料為已登錄公會計分。第一週結算後，我們會以所有登錄公會再整理一次這些數字。",
        ],
      },
    },
  },
  ...guideInsights,
];

export const insightBySlug = (slug: string) => insights.find((x) => x.slug === slug) ?? null;

export function surveyTotals(file: string): SurveyTotals {
  return JSON.parse(readFileSync(path.join(process.cwd(), "survey", file), "utf8")) as SurveyTotals;
}
