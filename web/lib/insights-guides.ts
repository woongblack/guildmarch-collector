// Long guides (R-37) written from the site's own data, listed with the data reports. Each one explains
// a scoring rule as lib/league.ts codes it and backs it with numbers read from the DB on the date given.
// The numbers are a snapshot: when a guide is refreshed, change its date, numbers and method together.
import type { Insight } from "./insights.ts";

// Week 1 points, ranked guilds, read at the 2026-11-20 08:00 KST update
const W1 = { guilds: 433, levels: "33%", achievements: "55%", reached60: "3.8%", honor: "8.3%", honorPvp: "12.1%" };

export const guideInsights: Insight[] = [
  {
    slug: "leveling-pace-2026-11",
    date: "2026-11-20",
    text: {
      ko: {
        title: "포에버 레벨업 속도: 길드원 3만 4천 명은 3일 동안 몇 레벨 올렸나",
        lead: "같은 캐릭터를 11월 17일과 20일 아침에 두 번 읽어, 레벨대별로 실제로 몇 레벨이 올랐는지 셌습니다. 레벨 점수가 주간 순위에서 어떻게 쌓이는지도 함께 정리합니다.",
        description: "WoW 포에버 길드원 캐릭터 3만 4천 명의 3일간 레벨 상승을 레벨대별로 측정했습니다. 한국과 미주 비교, 레벨 점수 상한(주 20레벨)과 60레벨 보너스가 실제로 어떻게 작동하는지 정리합니다.",
        method: [
          "대상: Guild March에 등록된 길드의 길드원 중, 11월 17일 08:00과 11월 20일 08:00(한국 시간) 두 번 모두 공개 프로필을 읽을 수 있었고 처음 읽을 때 10~59레벨이던 캐릭터. 한국 4,084명, 미주 30,205명.",
          "3일 동안 오른 레벨 수를 처음 레벨 기준 10레벨 단위로 묶었습니다. 처음부터 60인 캐릭터는 더 오를 수 없어 뺐습니다.",
          "같은 사람이 여러 캐릭터를 키우는 경우 캐릭터마다 따로 셌습니다. 길드에 속한 캐릭터만 대상이라 포에버 전체 평균보다 활발한 쪽으로 치우쳐 있을 수 있습니다.",
        ],
        sections: [
          { h: "한눈에 보기", p: [
            "레벨이 높은 캐릭터일수록 3일 동안 더 많이 올렸습니다. 50레벨대는 중앙값 4~5레벨을 올렸고 98%가 1레벨 이상 올랐습니다. 반대로 10레벨대는 절반 넘게 3일 동안 한 레벨도 오르지 않았습니다.",
            "게임에서 높은 레벨이 더 빨리 오른다는 뜻은 아닙니다. 가장 많이 플레이하는 사람이 이미 높은 레벨에 가 있고, 10레벨대에는 잠시 세워 둔 부캐릭터가 많이 섞여 있기 때문으로 보입니다.",
          ], table: {
            head: ["시작 레벨", "한국 중앙값", "한국 오른 비율", "미주 중앙값", "미주 오른 비율"],
            rows: [
              ["10~19", "0", "41%", "0", "36%"],
              ["20~29", "2", "67%", "1", "65%"],
              ["30~39", "3", "88%", "3", "85%"],
              ["40~49", "4", "95%", "4", "94%"],
              ["50~59", "5", "98%", "4", "98%"],
            ],
          } },
          { h: "한국과 미주", p: [
            "두 지역의 모양은 거의 같습니다. 한국이 레벨대마다 평균 0.1~0.4레벨 더 올렸는데, 50레벨대 평균이 한국 4.4레벨, 미주 4.1레벨입니다.",
            "상위 10%로 보면 50레벨대가 3일에 7레벨, 40레벨대가 6레벨입니다. 이 속도면 일주일에 14~16레벨입니다.",
          ] },
          { h: "레벨 점수는 어떻게 쌓이나", p: [
            "Guild March는 주가 시작될 때와 지금의 레벨을 비교해 1레벨에 1점을 줍니다. 한 캐릭터가 한 주에 얻는 레벨 점수는 20점까지입니다.",
            "위 속도로 보면 이 상한에 닿는 캐릭터는 드뭅니다. 가장 빠른 10%도 일주일에 14~16레벨이라, 상한은 일부 몰아서 올리는 캐릭터에게만 걸립니다.",
            "60레벨에 닿으면 캐릭터당 한 번 10점을 따로 받습니다. 50레벨대 후반 캐릭터는 그 주에 레벨 점수와 60 보너스를 함께 받을 수 있어, 한 주에 30점 가까이 낼 수 있는 유일한 구간입니다.",
            `1주차 첫날 아침 기준으로 순위에 오른 길드 ${W1.guilds}곳의 점수 중 레벨이 ${W1.levels}, 60 달성이 ${W1.reached60}였습니다.`,
          ] },
          { h: "길드장이 알아 둘 것: 부캐릭터와 활동 인원", p: [
            "순위는 총점을 활동 인원으로 나눈 값으로 매깁니다. 활동 인원은 주가 시작될 때 명단에 있던 10레벨 이상 구성원 중 그 주에 한 번이라도 접속한 캐릭터입니다.",
            "그래서 접속하지 않고 세워 둔 부캐릭터는 순위에 아무 영향이 없습니다. 반대로 우편만 확인하려고 잠깐 접속한 부캐릭터는 활동 인원에 들어가는데 점수는 거의 내지 않아 인원당 점수를 낮춥니다.",
            "10레벨 미만 캐릭터는 프로필이 공개되지 않아 점수에도 활동 인원에도 들어가지 않습니다.",
          ] },
          { h: "60레벨은 얼마나 되나", p: [
            "11월 19일 기준 등록 길드 캐릭터 중 60레벨은 미주 3.4%, 한국 1.8%, 유럽 4.2%입니다. 레벨 중앙값은 지역과 서버에 따라 24~31입니다.",
            "60레벨 캐릭터는 레벨 점수를 더 낼 수 없어서, 그 뒤로는 업적과 명예 킬이 점수의 전부가 됩니다.",
          ] },
        ],
        close: [
          "정리하면, 많이 플레이하는 캐릭터는 3일에 4~5레벨, 상위 10%는 6~7레벨을 올리고 있습니다. 주 20레벨 상한에 걸리는 캐릭터는 드뭅니다.",
          "레벨 구간이 끝나 가면 점수의 무게는 업적과 명예 킬로 옮겨 갑니다. 같은 데이터는 인구 페이지에서 매일 갱신됩니다.",
        ],
      },
      en: {
        title: "WoW Forever leveling pace: how many levels 34,000 guild characters gained in three days",
        lead: "We read the same characters on the mornings of November 17 and 20 and counted how many levels each level band actually gained, then lined that up with how level points add up in the weekly ranks.",
        description: "Three-day level gains for 34,000 WoW Forever guild characters by level band, Korea against the Americas, and how the 20-level weekly cap and the level-60 bonus work out in practice.",
        method: [
          "Sample: members of guilds registered on Guild March whose public profile could be read at both 08:00 Korea time on November 17 and on November 20 (Nov 16 and 19, 23:00 UTC), and who were level 10 to 59 at the first read. 4,084 characters in Korea and 30,205 in the Americas.",
          "Levels gained over the three days, grouped by starting level in bands of ten. Characters already at 60 can't gain more and are left out.",
          "Alts count as separate characters. Only guild members are included, so the sample may be more active than Forever as a whole.",
        ],
        sections: [
          { h: "At a glance", p: [
            "The higher the character, the more levels it gained. Characters in their 50s gained a median of 4 to 5 levels and 98% gained at least one. More than half the characters in the 10s didn't gain any.",
            "That doesn't mean high levels go faster in the game. The people who play the most are already high, and the 10s are full of parked alts.",
          ], table: {
            head: ["Starting level", "Korea median", "Korea gained any", "Americas median", "Americas gained any"],
            rows: [
              ["10–19", "0", "41%", "0", "36%"],
              ["20–29", "2", "67%", "1", "65%"],
              ["30–39", "3", "88%", "3", "85%"],
              ["40–49", "4", "95%", "4", "94%"],
              ["50–59", "5", "98%", "4", "98%"],
            ],
          } },
          { h: "Korea and the Americas", p: [
            "The two regions look almost the same. Korea gained 0.1 to 0.4 levels more on average in each band; in the 50s the average was 4.4 in Korea and 4.1 in the Americas.",
            "The top 10% gained 7 levels in three days in the 50s and 6 in the 40s. At that pace a character gains 14 to 16 levels a week.",
          ] },
          { h: "How level points add up", p: [
            "Guild March compares each character's level at the start of the week with its level now and gives 1 point per level, up to 20 points per character a week.",
            "At the pace above, few characters reach that cap. Even the fastest 10% gain 14 to 16 levels a week, so the cap only bites for characters pushed hard in a short stretch.",
            "Reaching 60 earns a separate 10 points, once per character. A character in the high 50s can collect level points and the 60 bonus in the same week, the only stretch where one character can bring in close to 30 points.",
            `On the first morning of week 1, levels were ${W1.levels} of the points of the ${W1.guilds} ranked guilds, and reaching 60 was ${W1.reached60}.`,
          ] },
          { h: "For guild leaders: alts and active members", p: [
            "Ranks use total points divided by active members. Active members are the level 10+ members on the roster when the week starts who log in at least once that week.",
            "So an alt parked and never logged in has no effect. An alt logged in just to check the mail counts as active but scores almost nothing, and pulls the per-member average down.",
            "Characters under level 10 have no public profile, so they neither score nor count as active.",
          ] },
          { h: "How many are at 60", p: [
            "As of November 19, 3.4% of guild characters in the Americas are 60, 1.8% in Korea and 4.2% in Europe. The median level is between 24 and 31 depending on region and realm type.",
            "A level-60 character can't earn level points anymore, so from then on achievements and honorable kills are all it scores.",
          ] },
        ],
        close: [
          "In short, characters who play a lot gain 4 to 5 levels in three days and the top 10% gain 6 or 7. Few run into the 20-level weekly cap.",
          "As the leveling stretch ends, the weight of the score shifts to achievements and honorable kills. The same data updates daily on the population page.",
        ],
      },
      "zh-tw": {
        title: "Forever 練等速度：3 萬 4 千名公會角色三天內升了幾級",
        lead: "我們在 11 月 17 日與 20 日早上讀取同一批角色，按等級區間計算實際升了幾級，並整理等級分數在每週排名中如何累積。",
        description: "WoW Forever 3 萬 4 千名公會角色三天內的等級成長（按等級區間），韓國與美洲比較，以及每週 20 級上限與 60 級加分的實際作用。",
        method: [
          "對象：在 Guild March 登錄的公會成員中，11 月 17 日與 11 月 20 日 08:00（韓國時間，台灣 07:00）兩次都能讀到公開資料，且第一次讀取時為 10～59 級的角色。韓國 4,084 名，美洲 30,205 名。",
          "以第一次讀取時的等級每 10 級分組，計算三天內升了幾級。一開始就是 60 級的角色無法再升，不列入。",
          "同一人的多個角色分開計算。只包含公會成員，可能比 Forever 整體更活躍。",
        ],
        sections: [
          { h: "重點整理", p: [
            "等級越高的角色，三天內升得越多。50 多級的角色中位數升了 4～5 級，98% 至少升了 1 級。10 多級的角色有一半以上三天內沒有升級。",
            "這不代表遊戲裡高等級升得比較快。玩得最多的人已經在高等級，而 10 多級裡混了很多暫時放著的分身。",
          ], table: {
            head: ["起始等級", "韓國中位數", "韓國有升級比例", "美洲中位數", "美洲有升級比例"],
            rows: [
              ["10～19", "0", "41%", "0", "36%"],
              ["20～29", "2", "67%", "1", "65%"],
              ["30～39", "3", "88%", "3", "85%"],
              ["40～49", "4", "95%", "4", "94%"],
              ["50～59", "5", "98%", "4", "98%"],
            ],
          } },
          { h: "韓國與美洲", p: [
            "兩個地區的形狀幾乎一樣。韓國每個區間平均多升 0.1～0.4 級；50 多級的平均是韓國 4.4 級、美洲 4.1 級。",
            "前 10% 在 50 多級三天升 7 級，40 多級升 6 級。照這個速度，一週約升 14～16 級。",
          ] },
          { h: "等級分數如何累積", p: [
            "Guild March 比較每個角色在週開始時與現在的等級，每升 1 級得 1 分，每個角色每週最多 20 分。",
            "以上面的速度來看，碰到上限的角色很少。最快的 10% 一週也只升 14～16 級，上限只會影響短時間內衝等的角色。",
            "達到 60 級時，每個角色另外得一次 10 分。50 多級後段的角色可以在同一週拿到等級分數和 60 級加分，是單一角色一週能拿到接近 30 分的唯一區間。",
            `第 1 週第一天早上，已上榜的 ${W1.guilds} 個公會的分數中，等級佔 ${W1.levels}，達到 60 級佔 ${W1.reached60}。`,
          ] },
          { h: "會長須知：分身與活躍人數", p: [
            "排名以總分除以活躍人數計算。活躍人數是週開始時在名單上、10 級以上，且該週至少登入一次的成員。",
            "因此一直沒登入的分身對排名沒有影響。只是登入收信的分身會被算進活躍人數，卻幾乎不得分，會拉低平均分數。",
            "10 級以下的角色沒有公開資料，不計分也不算活躍人數。",
          ] },
          { h: "60 級有多少人", p: [
            "截至 11 月 19 日，已登錄公會的角色中 60 級在美洲佔 3.4%、韓國 1.8%、歐洲 4.2%。等級中位數依地區與伺服器在 24～31 級之間。",
            "60 級角色無法再拿等級分數，之後的分數就全靠成就與榮譽擊殺。",
          ] },
        ],
        close: [
          "總結：玩得多的角色三天升 4～5 級，前 10% 升 6～7 級，很少有人碰到每週 20 級的上限。",
          "練等階段結束後，分數的重心會移到成就與榮譽擊殺。同樣的資料每天在人口頁面更新。",
        ],
      },
    },
  },
  {
    slug: "honor-kills-2026-11",
    date: "2026-11-20",
    text: {
      ko: {
        title: "포에버 명예 킬: PvP 서버와 일반 서버에서 3일 동안 실제로 얼마나 쌓였나",
        lead: "길드원 3만 5천 명의 명예 킬을 11월 17일과 20일에 읽어 비교했습니다. 서버 종류와 지역에 따라 차이가 크고, 주간 점수의 명예 상한이 누구에게 걸리는지도 보입니다.",
        description: "WoW 포에버 길드원 3만 5천 명의 3일간 명예 킬 증가를 PvP·일반 서버, 한국·미주로 나눠 측정했습니다. 명예 킬 10회당 1점, 캐릭터당 주 10점 상한이 실제로 어떻게 걸리는지 정리합니다.",
        method: [
          "대상: 등록 길드의 길드원 중 11월 17일 08:00과 11월 20일 08:00(한국 시간)에 모두 공개 프로필을 읽을 수 있었던 캐릭터. 한국 PvP 3,289명, 한국 일반 833명, 미주 PvP 14,949명, 미주 일반 16,031명.",
          "명예 킬은 블리자드 공개 프로필의 누적 명예 킬 수입니다. 두 번 읽은 값의 차이를 3일간 증가로 봤습니다.",
          "서버 종류는 캐릭터가 속한 길드의 서버로 정했습니다. 어떤 전투에서 명예 킬을 얻었는지는 공개 데이터로 알 수 없습니다.",
        ],
        sections: [
          { h: "한눈에 보기", p: [
            "미주 PvP 서버는 절반이 넘는 53%가 3일 동안 명예 킬을 1회 이상 늘렸고, 한국 PvP 서버는 30%였습니다. 일반 서버는 한국 1%, 미주 7%로 거의 없습니다.",
            "분포는 아주 한쪽으로 쏠려 있습니다. 미주 PvP 서버의 중앙값은 3일에 1킬이지만 상위 1%는 610킬 이상, 가장 많은 캐릭터는 3,663킬을 늘렸습니다.",
          ], table: {
            head: ["서버", "3일간 1킬 이상", "상위 10%", "상위 1%", "최다", "누적 중앙값"],
            rows: [
              ["한국 PvP", "30%", "4", "24", "67", "2"],
              ["한국 일반", "1%", "0", "1", "2", "0"],
              ["미주 PvP", "53%", "28", "610", "3,663", "16"],
              ["미주 일반", "7%", "0", "111", "2,242", "0"],
            ],
          } },
          { h: "한국 PvP 서버는 아직 조용합니다", p: [
            "한국 PvP 서버는 진영 비율이 호드 70%로 가장 기울어 있는데도, 3일에 100킬을 넘긴 캐릭터가 한 명도 없었습니다. 가장 많이 늘린 캐릭터가 67킬입니다.",
            "한국은 레벨 중앙값이 미주와 같은 29인데 60레벨 비율은 2.0%로 미주 PvP(4.8%)의 절반 이하입니다. 만렙 구간에서 생기는 전투가 아직 적은 것으로 보입니다.",
          ] },
          { h: "60레벨이 되면 달라집니다", p: [
            "미주 PvP 서버의 60레벨 캐릭터 1,017명만 보면 3일 증가 중앙값이 9킬이고, 4명 중 1명(24.5%)이 3일에 100킬을 넘겼습니다. 같은 서버 전체로는 100킬 이상이 4.7%뿐입니다.",
            "미주 일반 서버도 60레벨 캐릭터 501명 중 10.6%가 3일에 100킬을 넘겼습니다. 일반 서버에서도 일부는 명예 킬을 꾸준히 쌓고 있습니다.",
          ] },
          { h: "명예 점수는 어떻게 쌓이나", p: [
            "Guild March는 주가 시작될 때와 지금의 누적 명예 킬을 비교해 10킬마다 1점을 줍니다. 한 캐릭터가 한 주에 얻는 명예 점수는 10점, 곧 100킬까지입니다.",
            "위 숫자로 보면 미주 PvP의 60레벨 캐릭터 넷 중 하나는 3일 만에 그 주 상한에 닿습니다. 상한 덕분에 한 사람이 길드 점수를 혼자 끌어올리지는 못하고, 대신 여러 길드원이 조금씩 쌓는 쪽이 유리합니다.",
            `1주차 첫날 아침 기준으로 순위에 오른 길드 ${W1.guilds}곳의 점수 중 명예가 ${W1.honor}, PvP 서버 길드만 보면 ${W1.honorPvp}였습니다. 아직은 업적과 레벨이 점수 대부분을 차지합니다.`,
          ] },
          { h: "확인할 때 주의할 점", p: [
            "명예 킬은 캐릭터가 로그아웃한 뒤에 공개 프로필에 반영됩니다. 오래 접속해 있는 날에는 그날 갱신에 빠지고 다음 날 한꺼번에 들어갑니다.",
            "점수는 매일 08:00(한국 시간)에 한 번 다시 계산합니다.",
          ] },
        ],
        close: [
          "정리하면, 명예 킬은 미주 PvP 서버의 60레벨 캐릭터에게 몰려 있고 한국 PvP 서버는 아직 조용합니다. 캐릭터당 주 100킬 상한 때문에 길드 점수에서는 한 명보다 여러 명이 중요합니다.",
          "레벨 구간이 끝나는 캐릭터가 늘면 이 숫자는 빠르게 바뀔 것입니다. 진영과 명예 킬 현황은 인구 페이지에서 매일 볼 수 있습니다.",
        ],
      },
      en: {
        title: "WoW Forever honorable kills: how many PvP and Normal realm characters actually got in three days",
        lead: "We compared the honorable kills of 35,000 guild characters on November 17 and 20. Realm type and region make a big difference, and the numbers show who actually hits the weekly honor cap.",
        description: "Three-day honorable kill gains for 35,000 WoW Forever guild characters, split by PvP and Normal realms and by Korea and the Americas, and how the 1 point per 10 kills rule and its 10-point weekly cap play out.",
        method: [
          "Sample: members of registered guilds whose public profile could be read at both 08:00 Korea time on November 17 and November 20 (Nov 16 and 19, 23:00 UTC). Korea PvP 3,289, Korea Normal 833, Americas PvP 14,949, Americas Normal 16,031.",
          "Honorable kills are the lifetime count on the public Blizzard profile. The difference between the two reads is the three-day gain.",
          "Realm type comes from the character's guild. Public data doesn't say where the kills came from.",
        ],
        sections: [
          { h: "At a glance", p: [
            "On Americas PvP realms, 53% of characters added at least one kill in three days; on Korean PvP realms, 30%. Normal realms barely register: 1% in Korea and 7% in the Americas.",
            "The spread is very lopsided. The median on Americas PvP is one kill in three days, but the top 1% added 610 or more and the top character added 3,663.",
          ], table: {
            head: ["Realms", "1+ kill in 3 days", "Top 10%", "Top 1%", "Most", "Lifetime median"],
            rows: [
              ["Korea PvP", "30%", "4", "24", "67", "2"],
              ["Korea Normal", "1%", "0", "1", "2", "0"],
              ["Americas PvP", "53%", "28", "610", "3,663", "16"],
              ["Americas Normal", "7%", "0", "111", "2,242", "0"],
            ],
          } },
          { h: "Korean PvP realms are still quiet", p: [
            "Korean PvP realms lean the hardest toward Horde, at 70%, yet not one character there passed 100 kills in three days. The most anyone added was 67.",
            "The median level in Korea is 29, the same as Americas PvP, but only 2.0% are 60, under half the 4.8% on Americas PvP. There just isn't much max-level fighting yet.",
          ] },
          { h: "It changes at 60", p: [
            "Looking only at the 1,017 level-60 characters on Americas PvP realms, the median three-day gain is 9 kills and one in four (24.5%) passed 100. Across all characters on those realms it's 4.7%.",
            "On Americas Normal realms, 10.6% of the 501 level-60 characters also passed 100 kills in three days. Some players build honor steadily there too.",
          ] },
          { h: "How honor points add up", p: [
            "Guild March compares lifetime honorable kills at the start of the week with now and gives 1 point per 10 kills, up to 10 points (100 kills) per character a week.",
            "By the numbers above, one in four level-60 characters on Americas PvP hits that cap within three days. The cap stops one player from carrying a guild, so several members adding a little each counts for more.",
            `On the first morning of week 1, honor was ${W1.honor} of the points of the ${W1.guilds} ranked guilds, and ${W1.honorPvp} for PvP realm guilds. Achievements and levels still make up most of the score.`,
          ] },
          { h: "When checking your numbers", p: [
            "Honorable kills reach the public profile after the character logs out. On a long session they miss that day's update and arrive the next day all at once.",
            "Scores are worked out again once a day at 08:00 Korea time (23:00 UTC).",
          ] },
        ],
        close: [
          "In short, honorable kills are concentrated in level-60 characters on Americas PvP realms, and Korean PvP realms are still quiet. With a 100-kill weekly cap per character, many members count for more than one.",
          "As more characters finish leveling these numbers will move fast. Faction and honor numbers update daily on the population page.",
        ],
      },
      "zh-tw": {
        title: "Forever 榮譽擊殺：PvP 與一般伺服器的角色三天內實際累積了多少",
        lead: "我們比較了 3 萬 5 千名公會角色在 11 月 17 日與 20 日的榮譽擊殺。伺服器類型與地區差異很大，也能看出每週榮譽上限實際影響到誰。",
        description: "WoW Forever 3 萬 5 千名公會角色三天內的榮譽擊殺增加，按 PvP／一般伺服器與韓國／美洲區分，以及每 10 次擊殺 1 分、每週上限 10 分的實際作用。",
        method: [
          "對象：已登錄公會的成員中，11 月 17 日與 11 月 20 日 08:00（韓國時間，台灣 07:00）兩次都能讀到公開資料的角色。韓國 PvP 3,289 名、韓國一般 833 名、美洲 PvP 14,949 名、美洲一般 16,031 名。",
          "榮譽擊殺是 Blizzard 公開資料上的累計次數，兩次讀取的差值即為三天的增加。",
          "伺服器類型以角色所屬公會的伺服器為準。公開資料無法得知擊殺來自哪種戰鬥。",
        ],
        sections: [
          { h: "重點整理", p: [
            "美洲 PvP 伺服器有 53% 的角色三天內至少增加 1 次擊殺，韓國 PvP 伺服器為 30%。一般伺服器幾乎沒有：韓國 1%、美洲 7%。",
            "分布非常集中。美洲 PvP 的中位數是三天 1 次，但前 1% 增加了 610 次以上，最多的角色增加了 3,663 次。",
          ], table: {
            head: ["伺服器", "三天內 1 次以上", "前 10%", "前 1%", "最多", "累計中位數"],
            rows: [
              ["韓國 PvP", "30%", "4", "24", "67", "2"],
              ["韓國一般", "1%", "0", "1", "2", "0"],
              ["美洲 PvP", "53%", "28", "610", "3,663", "16"],
              ["美洲一般", "7%", "0", "111", "2,242", "0"],
            ],
          } },
          { h: "韓國 PvP 伺服器還很安靜", p: [
            "韓國 PvP 伺服器部落佔 70%，陣營最不平衡，但沒有任何角色三天內超過 100 次擊殺，最多的是 67 次。",
            "韓國的等級中位數是 29，與美洲 PvP 相同，但 60 級只有 2.0%，不到美洲 PvP（4.8%）的一半。滿等階段的戰鬥還不多。",
          ] },
          { h: "到了 60 級就不同", p: [
            "只看美洲 PvP 伺服器的 1,017 名 60 級角色，三天增加的中位數是 9 次，四人中就有一人（24.5%）超過 100 次。整個伺服器只有 4.7%。",
            "美洲一般伺服器的 501 名 60 級角色中，也有 10.6% 三天內超過 100 次。一般伺服器上也有人持續累積榮譽。",
          ] },
          { h: "榮譽分數如何累積", p: [
            "Guild March 比較週開始時與現在的累計榮譽擊殺，每 10 次得 1 分，每個角色每週最多 10 分（100 次）。",
            "照上面的數字，美洲 PvP 的 60 級角色每四人就有一人在三天內碰到上限。上限讓一個人無法獨自撐起公會，多位成員各累積一點更有利。",
            `第 1 週第一天早上，已上榜的 ${W1.guilds} 個公會的分數中榮譽佔 ${W1.honor}，PvP 伺服器公會為 ${W1.honorPvp}。目前大部分分數仍來自成就與等級。`,
          ] },
          { h: "查看數字時要注意", p: [
            "榮譽擊殺會在角色登出後才反映到公開資料。長時間在線的那天會錯過當天更新，隔天一次補上。",
            "分數每天 07:00（台灣時間）重新計算一次。",
          ] },
        ],
        close: [
          "總結：榮譽擊殺集中在美洲 PvP 伺服器的 60 級角色，韓國 PvP 伺服器還很安靜。每個角色每週上限 100 次，所以公會分數上多人比一人重要。",
          "練等結束的角色變多後，這些數字會很快改變。陣營與榮譽擊殺現況每天在人口頁面更新。",
        ],
      },
    },
  },
  {
    slug: "achievements-2026-11",
    date: "2026-11-20",
    text: {
      ko: {
        title: "포에버 업적: 레벨대별로 몇 개나 따고, 길드 점수에서 얼마나 차지하나",
        lead: "등록 길드 캐릭터 3만 9천 명의 업적 수를 레벨대별로 셌습니다. 1주차 첫날 길드 점수의 절반 넘게가 업적에서 나왔습니다.",
        description: "WoW 포에버 길드 캐릭터 3만 9천 명의 업적 수를 레벨대별로 정리하고, 업적 5점·상한 없음·완료 시각 기준 집계라는 Guild March 점수 규칙이 주간 순위에 어떻게 작동하는지 설명합니다.",
        method: [
          "대상: 11월 20일 08:00(한국 시간) 갱신에서 공개 프로필을 읽은 등록 길드 캐릭터. 한국 5,715명, 미주 33,761명(60레벨 1,598명 포함).",
          "업적 수는 블리자드 공개 프로필의 달성 업적 목록에서 셌습니다. 공개 데이터에 업적 이름은 쓰지 않았습니다.",
          "\"주 첫 24시간\"은 1주차가 시작된 11월 19일 08:00부터 11월 20일 08:00 사이에 완료한 업적 수의 캐릭터당 평균입니다.",
        ],
        sections: [
          { h: "한눈에 보기", p: [
            "업적 수는 레벨을 따라 늘어납니다. 20레벨대 캐릭터는 중앙값 2개, 50레벨대는 8~9개, 60레벨은 12~13개입니다. 한국과 미주의 차이는 거의 없습니다.",
            "주 첫 24시간 동안 50레벨대와 60레벨 캐릭터는 평균 0.5~0.9개를 땄고, 20~30레벨대는 0.2개 안팎이었습니다.",
          ], table: {
            head: ["레벨", "한국 중앙값", "한국 상위 10%", "미주 중앙값", "미주 상위 10%", "주 첫 24시간 평균 (한국/미주)"],
            rows: [
              ["10~19", "1", "7", "1", "8", "0.07 / 0.10"],
              ["20~29", "2", "5", "2", "6", "0.14 / 0.18"],
              ["30~39", "3", "6", "4", "7", "0.16 / 0.19"],
              ["40~49", "5", "9", "6", "10", "0.37 / 0.40"],
              ["50~59", "8", "13", "9", "14", "0.51 / 0.50"],
              ["60", "12", "17", "13", "18", "0.87 / 0.80"],
            ],
          } },
          { h: "업적 점수는 어떻게 세나", p: [
            "업적 하나에 5점이고, 레벨·명예와 달리 상한이 없습니다. 업적 하나가 레벨 5개와 같습니다.",
            "업적은 완료한 시각으로 셉니다. 그날 갱신 때 캐릭터를 읽지 못해도, 다음에 읽을 때 그 주 안에 완료한 업적이면 그대로 점수가 됩니다. 반대로 주가 시작되기 전에 딴 업적은 다음 주로 넘어가지 않습니다.",
            `1주차 첫날 아침 기준으로 순위에 오른 길드 ${W1.guilds}곳의 점수 중 업적이 ${W1.achievements}였습니다. 레벨(${W1.levels})보다 많습니다.`,
          ] },
          { h: "왜 업적이 점수의 절반을 넘나", p: [
            "레벨은 캐릭터당 주 20점에서 멈추고 60이 되면 더 오르지 않습니다. 명예는 주 10점이 상한입니다. 업적만 끝이 없어서, 높은 레벨의 열심인 캐릭터일수록 점수에서 업적의 비중이 커집니다.",
            "60레벨 캐릭터가 하루 평균 0.8~0.9개를 딴다면 일주일에 약 6개, 30점입니다. 같은 캐릭터가 명예로 낼 수 있는 최대치(10점)의 세 배입니다.",
          ] },
          { h: "길드장이 알아 둘 것", p: [
            "업적은 레벨 구간이 끝난 길드원도 계속 점수를 내는 방법입니다. 60레벨 길드원이 많아질수록 길드 순위는 업적 쪽에서 갈립니다.",
            "점수 비중은 실제 1~2주차 마감 데이터를 보고 다시 검토합니다. 던전·레이드 기록은 레이드가 열리는 12월 9일 뒤에 넣을 예정이고, 그때 비중도 함께 조정합니다.",
          ] },
        ],
        close: [
          "정리하면, 업적은 레벨을 따라 늘고 60레벨이 되어도 멈추지 않는 유일한 점수입니다. 1주차 첫날에도 길드 점수의 절반 넘게를 차지했습니다.",
          "점수 규칙 전체는 규칙 페이지에, 길드별 점수 구성은 각 길드 페이지에 있습니다.",
        ],
      },
      en: {
        title: "WoW Forever achievements: how many each level band has, and how much of a guild's score they make",
        lead: "We counted achievements for 39,000 registered guild characters by level band. On the first day of week 1, more than half of all guild points came from achievements.",
        description: "Achievement counts for 39,000 WoW Forever guild characters by level band, and how Guild March's achievement rule (5 points each, no cap, counted by completion time) plays out in the weekly ranks.",
        method: [
          "Sample: registered guild characters whose public profile was read at the 08:00 Korea time update on November 20 (Nov 19, 23:00 UTC). 5,715 in Korea and 33,761 in the Americas, 1,598 of them at level 60.",
          "Achievements were counted from the completed list on the public Blizzard profile. Achievement names aren't used.",
          "\"First 24 hours\" is the average number of achievements per character completed between the start of week 1 (08:00 Korea time, November 19) and 08:00 on November 20.",
        ],
        sections: [
          { h: "At a glance", p: [
            "Achievement counts climb with level: a median of 2 in the 20s, 8 to 9 in the 50s and 12 to 13 at 60. Korea and the Americas are almost the same.",
            "In the first 24 hours of the week, characters in their 50s and at 60 earned 0.5 to 0.9 on average; those in their 20s and 30s about 0.2.",
          ], table: {
            head: ["Level", "Korea median", "Korea top 10%", "Americas median", "Americas top 10%", "First 24 h avg (KR/AM)"],
            rows: [
              ["10–19", "1", "7", "1", "8", "0.07 / 0.10"],
              ["20–29", "2", "5", "2", "6", "0.14 / 0.18"],
              ["30–39", "3", "6", "4", "7", "0.16 / 0.19"],
              ["40–49", "5", "9", "6", "10", "0.37 / 0.40"],
              ["50–59", "8", "13", "9", "14", "0.51 / 0.50"],
              ["60", "12", "17", "13", "18", "0.87 / 0.80"],
            ],
          } },
          { h: "How achievement points are counted", p: [
            "Each achievement is 5 points, and unlike levels and honor there's no cap. One achievement is worth five levels.",
            "Achievements count by the time they were completed. If a character can't be read on one day's update, anything it completed that week still counts the next time it's read. Achievements earned before the week started don't carry over.",
            `On the first morning of week 1, achievements were ${W1.achievements} of the points of the ${W1.guilds} ranked guilds, more than levels at ${W1.levels}.`,
          ] },
          { h: "Why achievements make up over half", p: [
            "Levels stop at 20 points per character a week and stop altogether at 60. Honor is capped at 10 points a week. Only achievements have no ceiling, so the higher and keener the character, the bigger their share.",
            "A level-60 character earning 0.8 to 0.9 a day comes to about 6 a week, or 30 points: three times the most the same character could get from honor.",
          ] },
          { h: "For guild leaders", p: [
            "Achievements are how members who have finished leveling keep scoring. The more level-60 members a guild has, the more its rank comes down to achievements.",
            "The weights will be reviewed against real week 1 and 2 results. Dungeon and raid progress is planned for after raids open on December 9, and the weights will be adjusted with it.",
          ] },
        ],
        close: [
          "In short, achievements grow with level and are the one score that doesn't stop at 60. Even on the first day of week 1 they were more than half of all guild points.",
          "The full scoring rules are on the rules page, and each guild's breakdown is on its guild page.",
        ],
      },
      "zh-tw": {
        title: "Forever 成就：各等級區間有幾個，佔公會分數多少",
        lead: "我們按等級區間計算了 3 萬 9 千名已登錄公會角色的成就數。第 1 週第一天，公會分數有一半以上來自成就。",
        description: "WoW Forever 3 萬 9 千名公會角色按等級區間的成就數，以及 Guild March 成就規則（每個 5 分、無上限、以完成時間計算）在每週排名中的實際作用。",
        method: [
          "對象：11 月 20 日 08:00（韓國時間，台灣 07:00）更新時讀到公開資料的已登錄公會角色。韓國 5,715 名、美洲 33,761 名（其中 60 級 1,598 名）。",
          "成就數取自 Blizzard 公開資料的已完成清單，不使用成就名稱。",
          "「本週前 24 小時」是第 1 週開始（11 月 19 日 08:00 韓國時間）到 11 月 20 日 08:00 之間完成的成就數，每個角色的平均。",
        ],
        sections: [
          { h: "重點整理", p: [
            "成就數隨等級增加：20 多級中位數 2 個，50 多級 8～9 個，60 級 12～13 個。韓國與美洲幾乎相同。",
            "本週前 24 小時，50 多級與 60 級角色平均拿了 0.5～0.9 個，20～30 多級約 0.2 個。",
          ], table: {
            head: ["等級", "韓國中位數", "韓國前 10%", "美洲中位數", "美洲前 10%", "前 24 小時平均（韓／美）"],
            rows: [
              ["10～19", "1", "7", "1", "8", "0.07 / 0.10"],
              ["20～29", "2", "5", "2", "6", "0.14 / 0.18"],
              ["30～39", "3", "6", "4", "7", "0.16 / 0.19"],
              ["40～49", "5", "9", "6", "10", "0.37 / 0.40"],
              ["50～59", "8", "13", "9", "14", "0.51 / 0.50"],
              ["60", "12", "17", "13", "18", "0.87 / 0.80"],
            ],
          } },
          { h: "成就分數怎麼算", p: [
            "每個成就 5 分，和等級、榮譽不同，沒有上限。一個成就等於 5 個等級。",
            "成就以完成時間計算。某天更新時讀不到角色也沒關係，下次讀到時，該週內完成的成就照樣計分。週開始前拿到的成就不會算到下一週。",
            `第 1 週第一天早上，已上榜的 ${W1.guilds} 個公會的分數中成就佔 ${W1.achievements}，比等級（${W1.levels}）還多。`,
          ] },
          { h: "為什麼成就超過一半", p: [
            "等級每個角色每週最多 20 分，到 60 級就停止；榮譽每週上限 10 分。只有成就沒有上限，等級越高、越認真的角色，成就的比重就越大。",
            "60 級角色每天平均拿 0.8～0.9 個，一週約 6 個，也就是 30 分，是同一角色靠榮譽最多能拿的三倍。",
          ] },
          { h: "會長須知", p: [
            "成就是練完等的成員繼續得分的方法。60 級成員越多，公會排名就越取決於成就。",
            "分數比重會依實際第 1～2 週結算資料重新檢討。地城與團隊副本紀錄預計在 12 月 9 日團隊副本開放後加入，屆時一併調整比重。",
          ] },
        ],
        close: [
          "總結：成就隨等級增加，是到了 60 級也不會停止的唯一分數。第 1 週第一天就佔了公會分數一半以上。",
          "完整計分規則在規則頁面，各公會的分數組成在各公會頁面。",
        ],
      },
    },
  },
  {
    slug: "guild-size-and-leagues-2026-11",
    date: "2026-11-20",
    text: {
      ko: {
        title: "길드 크기와 순위: 1주차 433개 길드로 본 소·중·대 리그",
        lead: "작은 길드도 큰 길드와 겨룰 수 있을까요? 1주차 첫날 순위에 오른 길드 433곳을 리그별로 나눠, 인원과 활동 비율, 인원당 점수를 비교했습니다.",
        description: "WoW 포에버 1주차 순위에 오른 길드 433곳을 소·중·대 리그로 나눠 명단 인원, 활동 인원, 활동 비율, 인원당 점수를 비교하고, 작은 길드가 순위에서 불리하지 않은 이유를 설명합니다.",
        method: [
          "대상: 11월 20일 08:00(한국 시간) 갱신 기준으로 1주차 순위에 오른 길드 433곳(한국·미주·유럽, 대만은 아직 없음).",
          "명단 인원은 주가 시작될 때 길드 명단에 있던 캐릭터 수, 활동 인원은 그중 10레벨 이상이고 그 주에 접속한 캐릭터 수입니다.",
          "1주차가 시작되고 하루가 지난 시점의 값입니다. 주가 끝날 때의 최종 순위와는 다를 수 있습니다.",
        ],
        sections: [
          { h: "한눈에 보기", p: [
            "리그는 활동 인원으로 나눕니다. 5~19명이 소 리그, 20~49명이 중 리그, 50명 이상이 대 리그입니다. 433곳 중 대 리그가 194곳으로 가장 많습니다.",
            "인원당 점수 중앙값은 소 리그 2.71, 중 리그 3.02, 대 리그 3.14로 큰 차이가 없습니다. 1위 점수는 오히려 중 리그(11.40)와 소 리그(8.06)가 대 리그(5.37)보다 높습니다.",
          ], table: {
            head: ["리그", "길드", "명단 중앙값", "활동 중앙값", "활동 비율", "인원당 점수 중앙값", "리그 1위"],
            rows: [
              ["소 (5~19명)", "83", "25", "13", "50%", "2.71", "8.06"],
              ["중 (20~49명)", "156", "59", "34", "60%", "3.02", "11.40"],
              ["대 (50명 이상)", "194", "138", "84", "61%", "3.14", "5.37"],
            ],
          } },
          { h: "왜 인원당 점수인가", p: [
            "총점으로 줄을 세우면 길드원이 많은 길드가 늘 위에 섭니다. Guild March는 총점을 활동 인원으로 나눠, 길드원 한 명 한 명이 그 주에 얼마나 했는지를 겨룹니다.",
            "큰 길드는 열심인 길드원과 가볍게 하는 길드원이 섞여 평균이 중간으로 모입니다. 작은 길드는 몇 명만 열심이어도 평균이 크게 오르내립니다. 그래서 리그 1위 점수가 작은 리그에서 더 높게 나옵니다.",
          ] },
          { h: "활동 비율: 명단의 절반에서 3분의 2", p: [
            "주가 시작될 때 명단에 있던 캐릭터 중 하루 안에 접속한 비율은 중 리그와 대 리그가 약 60%, 소 리그가 50%였습니다. 10레벨 미만 캐릭터와 부캐릭터가 명단에 함께 있기 때문입니다.",
            "활동 비율 자체는 점수가 아닙니다. 접속하지 않은 길드원은 분모에 들어가지 않아 인원당 점수를 깎지 않습니다.",
          ] },
          { h: "인원당 점수를 올리는 것과 내리는 것", p: [
            "올리는 것: 업적(하나에 5점, 상한 없음), 레벨(1레벨 1점, 캐릭터당 주 20점까지), 60레벨 달성(한 번 10점), 명예 킬(10킬 1점, 캐릭터당 주 10점까지).",
            "내리는 것: 접속은 했지만 점수를 거의 내지 않는 캐릭터. 잠깐 접속한 부캐릭터가 대표적입니다.",
            "주중에 들어온 길드원은 그 주에는 점수에도 활동 인원에도 들어가지 않고, 다음 주부터 셉니다. 모집이 그 주 순위를 흔들지 않습니다.",
          ] },
          { h: "리그는 매주 다시 정합니다", p: [
            "리그는 그 주의 활동 인원으로 정하기 때문에, 길드가 커지거나 줄면 다음 주에 다른 리그로 옮길 수 있습니다. 활동 인원이 5명 미만이면 그 주 순위에 오르지 않습니다.",
            "같은 지역의 PvP 서버와 일반 서버 길드는 같은 리그에서 겨룹니다. 영토 지도만 서버 종류마다 따로입니다.",
          ] },
        ],
        close: [
          "정리하면, 인원당 점수의 중앙값은 리그와 상관없이 3점 안팎이고 1위 점수는 작은 리그가 더 높습니다. 작은 길드도 순위에서 불리하지 않습니다.",
          "지역별 순위와 리그 1위는 순위 페이지에서 매일 갱신됩니다.",
        ],
      },
      en: {
        title: "Guild size and ranks: small, medium and large leagues across 433 guilds in week 1",
        lead: "Can a small guild compete with a big one? We split the 433 guilds ranked on the first day of week 1 by league and compared roster size, activity and points per active member.",
        description: "The 433 WoW Forever guilds ranked in week 1, split into small, medium and large leagues: roster size, active members, activity share and points per active member, and why small guilds aren't at a disadvantage.",
        method: [
          "Sample: the 433 guilds ranked in week 1 as of the 08:00 Korea time update on November 20 (Nov 19, 23:00 UTC), in Korea, the Americas and Europe (none in Taiwan yet).",
          "Roster is the characters on the guild roster when the week started; active members are those at level 10+ who logged in that week.",
          "These numbers are from one day into week 1 and may differ from the final standings.",
        ],
        sections: [
          { h: "At a glance", p: [
            "Leagues go by active members: 5 to 19 is small, 20 to 49 medium, 50 or more large. Large is the biggest league, with 194 of the 433 guilds.",
            "The median points per active member is 2.71 in small, 3.02 in medium and 3.14 in large: not much apart. The league leaders actually score higher in medium (11.40) and small (8.06) than in large (5.37).",
          ], table: {
            head: ["League", "Guilds", "Median roster", "Median active", "Active share", "Median per member", "League leader"],
            rows: [
              ["Small (5–19)", "83", "25", "13", "50%", "2.71", "8.06"],
              ["Medium (20–49)", "156", "59", "34", "60%", "3.02", "11.40"],
              ["Large (50+)", "194", "138", "84", "61%", "3.14", "5.37"],
            ],
          } },
          { h: "Why points per member", p: [
            "Ranking by total points would always put the guilds with the most members on top. Guild March divides by active members, so guilds compete on how much each member did that week.",
            "A big guild mixes keen and casual members, and its average settles toward the middle. In a small guild a few keen members move the average a lot, which is why league leaders score higher in the smaller leagues.",
          ] },
          { h: "Activity: half to two thirds of the roster", p: [
            "Of the characters on the roster at the start of the week, about 60% in medium and large guilds and 50% in small ones logged in within a day. Rosters also hold characters under 10 and alts.",
            "The activity share isn't scored. Members who don't log in aren't in the divisor, so they don't pull the average down.",
          ] },
          { h: "What raises and lowers points per member", p: [
            "Raises it: achievements (5 points each, no cap), levels (1 per level, up to 20 per character a week), reaching 60 (10 points once) and honorable kills (1 per 10 kills, up to 10 per character a week).",
            "Lowers it: characters who log in but score almost nothing, such as an alt logged in for a minute.",
            "Members who join mid-week count neither as points nor as active members that week; they count from the next. Recruiting doesn't shake up the current week.",
          ] },
          { h: "Leagues are set every week", p: [
            "The league comes from that week's active members, so a guild that grows or shrinks can move league the next week. Fewer than 5 active members means no rank that week.",
            "PvP and Normal realm guilds of the same region share the leagues. Only the territory maps are split by realm type.",
          ] },
        ],
        close: [
          "In short, the median points per member is around 3 in every league and the leaders score higher in the smaller ones. Small guilds aren't at a disadvantage.",
          "Region ranks and league leaders update daily on the ranks pages.",
        ],
      },
      "zh-tw": {
        title: "公會規模與排名：第 1 週 433 個公會的小、中、大聯盟",
        lead: "小公會能和大公會競爭嗎？我們把第 1 週第一天上榜的 433 個公會按聯盟分開，比較名單人數、活躍比例與每人分數。",
        description: "WoW Forever 第 1 週上榜的 433 個公會，按小、中、大聯盟比較名單人數、活躍人數、活躍比例與每人分數，並說明小公會在排名上為何不吃虧。",
        method: [
          "對象：以 11 月 20 日 08:00（韓國時間，台灣 07:00）更新為準，第 1 週上榜的 433 個公會（韓國、美洲、歐洲，台灣尚無）。",
          "名單人數是週開始時公會名單上的角色數，活躍人數是其中 10 級以上且該週有登入的角色數。",
          "這是第 1 週開始一天後的數值，可能與週結束時的最終排名不同。",
        ],
        sections: [
          { h: "重點整理", p: [
            "聯盟依活躍人數劃分：5～19 人為小聯盟、20～49 人為中聯盟、50 人以上為大聯盟。433 個公會中大聯盟最多，有 194 個。",
            "每人分數中位數小聯盟 2.71、中聯盟 3.02、大聯盟 3.14，差距不大。聯盟第一名的分數反而是中聯盟（11.40）與小聯盟（8.06）高於大聯盟（5.37）。",
          ], table: {
            head: ["聯盟", "公會數", "名單中位數", "活躍中位數", "活躍比例", "每人分數中位數", "聯盟第一"],
            rows: [
              ["小（5～19 人）", "83", "25", "13", "50%", "2.71", "8.06"],
              ["中（20～49 人）", "156", "59", "34", "60%", "3.02", "11.40"],
              ["大（50 人以上）", "194", "138", "84", "61%", "3.14", "5.37"],
            ],
          } },
          { h: "為什麼用每人分數", p: [
            "如果用總分排名，人多的公會永遠在上面。Guild March 把總分除以活躍人數，比的是每位成員那一週做了多少。",
            "大公會認真與休閒的成員混在一起，平均會往中間靠。小公會只要幾個人認真，平均就會大幅變動，所以小聯盟的第一名分數比較高。",
          ] },
          { h: "活躍比例：名單的一半到三分之二", p: [
            "週開始時名單上的角色中，一天內登入的比例中、大聯盟約 60%，小聯盟 50%。名單上也有 10 級以下的角色與分身。",
            "活躍比例本身不計分。沒有登入的成員不算進分母，不會拉低平均。",
          ] },
          { h: "提高與拉低每人分數的因素", p: [
            "提高：成就（每個 5 分、無上限）、等級（每級 1 分，每個角色每週最多 20 分）、達到 60 級（一次 10 分）、榮譽擊殺（每 10 次 1 分，每個角色每週最多 10 分）。",
            "拉低：有登入卻幾乎不得分的角色，例如登入一下的分身。",
            "週中加入的成員當週不計分也不算活躍人數，從下週開始計算。招募不會影響當週排名。",
          ] },
          { h: "聯盟每週重新決定", p: [
            "聯盟依當週活躍人數決定，公會變大或變小時，下週可能換到其他聯盟。活躍人數不到 5 人，當週不會上榜。",
            "同一地區的 PvP 與一般伺服器公會在同一個聯盟競爭，只有領土地圖依伺服器類型分開。",
          ] },
        ],
        close: [
          "總結：每人分數中位數不論聯盟都在 3 分左右，第一名的分數小聯盟反而較高。小公會在排名上並不吃虧。",
          "各地區排名與聯盟第一每天在排名頁面更新。",
        ],
      },
    },
  },
  {
    slug: "pvp-vs-normal-realms-2026-11",
    date: "2026-11-20",
    text: {
      ko: {
        title: "PvP 서버 vs 일반 서버: 포에버 길드원 4만 7천 명의 레벨·진영·명예 킬 비교",
        lead: "어느 서버를 고를지, 길드를 어디에 둘지 고민하는 분을 위해 등록 길드 캐릭터 4만 7천 명의 공개 데이터로 두 서버 종류를 나란히 놓았습니다.",
        description: "WoW 포에버 PvP 서버와 일반 서버를 한국·미주·유럽별로 비교했습니다. 캐릭터 수, 호드 비율, 레벨 중앙값, 60레벨 비율, 명예 킬 참여를 등록 길드 4만 7천 명의 공개 데이터로 정리합니다.",
        method: [
          "진영·레벨: 11월 19일 08:00(한국 시간) 갱신 기준, 등록 길드 453곳의 길드원 46,994명. 진영은 길드의 진영입니다.",
          "명예 킬: 11월 17일과 20일에 모두 읽은 캐릭터의 3일간 증가(한국·미주). 유럽은 기간이 짧아 뺐습니다.",
          "등록된 길드의 길드원만 대상이라 서버 전체 인구와 같지 않습니다. 길드가 큰 곳일수록 숫자에 더 크게 반영됩니다.",
        ],
        sections: [
          { h: "한눈에 보기", p: [
            "세 지역 모두 PvP 서버는 호드 쪽으로, 일반 서버는 얼라이언스 쪽으로 기울었습니다. 한국이 가장 극단적이어서 PvP 서버는 호드 70%, 일반 서버는 호드 36%입니다.",
            "레벨은 미주와 한국에서 PvP 서버가 앞섭니다. 미주 PvP 서버의 레벨 중앙값은 29로 일반 서버보다 5레벨 높고, 60레벨 비율은 두 배가 넘습니다. 유럽은 두 서버가 비슷합니다.",
          ], table: {
            head: ["서버", "캐릭터", "호드", "레벨 중앙값", "60레벨", "3일간 1킬 이상"],
            rows: [
              ["미주 PvP", "18,650", "64%", "29", "4.8%", "53%"],
              ["미주 일반", "20,135", "47%", "24", "2.1%", "7%"],
              ["한국 PvP", "4,071", "70%", "29", "2.0%", "30%"],
              ["한국 일반", "994", "36%", "26", "0.9%", "1%"],
              ["유럽 PvP", "1,412", "60%", "31", "4.0%", "—"],
              ["유럽 일반", "1,732", "49%", "30", "4.4%", "—"],
            ],
          } },
          { h: "진영: PvP 서버는 호드, 일반 서버는 얼라이언스", p: [
            "PvP 서버에서 호드가 얼라이언스보다 미주는 1.8배, 한국은 2.3배입니다. 반대로 한국 일반 서버는 얼라이언스가 64%로 가장 많습니다.",
            "소수 진영 쪽 길드는 같은 지역 안에서 경쟁 길드가 적습니다. Guild March의 리그는 진영과 상관없이 같은 지역 길드끼리 겨루지만, 영토 지도는 서버 종류마다 따로라서 진영 구성이 지도 싸움에 그대로 드러납니다.",
          ] },
          { h: "레벨: 미주와 한국은 PvP 서버가 앞섭니다", p: [
            "미주 PvP 서버는 레벨 중앙값 29, 60레벨 4.8%이고, 일반 서버는 24와 2.1%입니다. 한국도 PvP 서버가 3레벨 높습니다.",
            "PvP 서버라서 레벨이 빨리 오른다기보다, 오래 플레이하는 사람이 PvP 서버를 더 많이 고른 것으로 보입니다. 유럽은 일반 서버가 오히려 60레벨 비율이 조금 높습니다.",
          ] },
          { h: "명예 킬: 일반 서버는 거의 없습니다", p: [
            "3일 동안 명예 킬을 1회 이상 늘린 캐릭터는 미주 PvP 53%, 한국 PvP 30%였고, 일반 서버는 미주 7%, 한국 1%였습니다.",
            "Guild March 점수에서 명예는 캐릭터당 주 10점(100킬)까지입니다. 일반 서버 길드는 이 점수를 거의 받지 못하지만, 1주차 첫날 기준으로 명예는 PvP 서버 길드 점수에서도 12% 정도라 순위를 크게 가르지는 않습니다.",
          ] },
          { h: "어느 쪽을 고를까", p: [
            "숫자로만 보면, 다른 길드와 부딪히며 플레이하고 싶은 사람은 PvP 서버에, 레벨과 업적을 차분히 쌓고 싶은 사람은 일반 서버에 더 많이 모여 있습니다.",
            "한 서버의 진영 비율이 크게 기울었다면, 소수 진영에서는 같은 진영 길드가 적어 모집이 어렵고 다수 진영에서는 경쟁 길드가 많습니다. 길드를 옮기거나 만들 때 진영 페이지와 인구 페이지의 숫자를 같이 보세요.",
          ] },
        ],
        close: [
          "정리하면, PvP 서버는 호드가 많고 레벨이 앞서며 명예 킬이 활발합니다. 일반 서버는 얼라이언스 쪽이고 명예 킬은 거의 없습니다. 한국이 이 차이가 가장 큽니다.",
          "같은 숫자는 인구 페이지에서 매일 갱신됩니다.",
        ],
      },
      en: {
        title: "PvP vs Normal realms: levels, factions and honor kills across 47,000 WoW Forever guild characters",
        lead: "For anyone choosing a realm, or where to put a guild: the two realm types side by side, from public data on 47,000 registered guild characters.",
        description: "WoW Forever PvP and Normal realms compared in Korea, the Americas and Europe: characters, Horde share, median level, share at 60 and honor kill activity, from public data on 47,000 registered guild characters.",
        method: [
          "Factions and levels: the 46,994 members of 453 registered guilds at the 08:00 Korea time update on November 19 (Nov 18, 23:00 UTC). Faction is the guild's faction.",
          "Honorable kills: three-day gains for characters read on both November 17 and 20 (Korea and the Americas). Europe is left out because its data covers a shorter span.",
          "Only members of registered guilds are included, so this isn't the full realm population. Bigger guilds weigh more.",
        ],
        sections: [
          { h: "At a glance", p: [
            "In all three regions, PvP realms lean Horde and Normal realms lean Alliance. Korea is the most extreme: 70% Horde on PvP, 36% on Normal.",
            "In the Americas and Korea, PvP realms are further along. The median level on Americas PvP is 29, five levels above Normal, and more than twice as many are 60. In Europe the two are close.",
          ], table: {
            head: ["Realms", "Characters", "Horde", "Median level", "At 60", "1+ kill in 3 days"],
            rows: [
              ["Americas PvP", "18,650", "64%", "29", "4.8%", "53%"],
              ["Americas Normal", "20,135", "47%", "24", "2.1%", "7%"],
              ["Korea PvP", "4,071", "70%", "29", "2.0%", "30%"],
              ["Korea Normal", "994", "36%", "26", "0.9%", "1%"],
              ["Europe PvP", "1,412", "60%", "31", "4.0%", "—"],
              ["Europe Normal", "1,732", "49%", "30", "4.4%", "—"],
            ],
          } },
          { h: "Factions: Horde on PvP, Alliance on Normal", p: [
            "On PvP realms there are 1.8 Horde for every Alliance in the Americas and 2.3 in Korea. Korean Normal realms go the other way, at 64% Alliance.",
            "A guild on the smaller side has fewer rivals in its region. Guild March's leagues mix both factions within a region, but the territory maps are split by realm type, so the faction balance shows up directly in the fight for the map.",
          ] },
          { h: "Levels: PvP realms lead in the Americas and Korea", p: [
            "Americas PvP has a median level of 29 and 4.8% at 60; Normal has 24 and 2.1%. In Korea, PvP is three levels ahead too.",
            "It's less that PvP realms level faster and more that people who play the most chose PvP. In Europe, Normal actually has a slightly higher share at 60.",
          ] },
          { h: "Honorable kills: almost none on Normal", p: [
            "Characters adding at least one honorable kill in three days: 53% on Americas PvP and 30% on Korea PvP, against 7% and 1% on Normal.",
            "In Guild March scoring, honor tops out at 10 points (100 kills) per character a week. Normal realm guilds get almost none of it, but on the first day of week 1 honor was only about 12% of PvP guild points too, so it doesn't decide much yet.",
          ] },
          { h: "Which to choose", p: [
            "Going by the numbers, people who want to run into other guilds gather on PvP realms, and people who want to build levels and achievements in peace gather on Normal.",
            "If a realm's factions are far apart, the smaller side has fewer guilds to recruit alongside and the bigger side has more rivals. When joining or starting a guild, check the factions and population pages too.",
          ] },
        ],
        close: [
          "In short, PvP realms are mostly Horde, further along in levels and busy with honorable kills. Normal realms lean Alliance and see almost no kills. Korea shows the biggest gap.",
          "The same numbers update daily on the population page.",
        ],
      },
      "zh-tw": {
        title: "PvP 伺服器 vs 一般伺服器：4 萬 7 千名 Forever 公會角色的等級、陣營與榮譽擊殺比較",
        lead: "給正在選伺服器、或考慮把公會放在哪裡的人：用 4 萬 7 千名已登錄公會角色的公開資料，把兩種伺服器並排比較。",
        description: "按韓國、美洲、歐洲比較 WoW Forever 的 PvP 與一般伺服器：角色數、部落比例、等級中位數、60 級比例與榮譽擊殺參與，資料來自 4 萬 7 千名已登錄公會角色。",
        method: [
          "陣營與等級：以 11 月 19 日 08:00（韓國時間，台灣 07:00）更新為準，453 個已登錄公會的 46,994 名成員。陣營為公會的陣營。",
          "榮譽擊殺：11 月 17 日與 20 日都讀到的角色三天內的增加（韓國與美洲）。歐洲資料期間較短，不列入。",
          "只包含已登錄公會的成員，與伺服器整體人口不同。大公會的影響較大。",
        ],
        sections: [
          { h: "重點整理", p: [
            "三個地區的 PvP 伺服器都偏部落，一般伺服器都偏聯盟。韓國最極端：PvP 伺服器部落 70%，一般伺服器部落 36%。",
            "美洲與韓國的 PvP 伺服器等級較高。美洲 PvP 的等級中位數 29，比一般伺服器高 5 級，60 級比例超過兩倍。歐洲兩者差不多。",
          ], table: {
            head: ["伺服器", "角色", "部落", "等級中位數", "60 級", "三天內 1 次以上擊殺"],
            rows: [
              ["美洲 PvP", "18,650", "64%", "29", "4.8%", "53%"],
              ["美洲一般", "20,135", "47%", "24", "2.1%", "7%"],
              ["韓國 PvP", "4,071", "70%", "29", "2.0%", "30%"],
              ["韓國一般", "994", "36%", "26", "0.9%", "1%"],
              ["歐洲 PvP", "1,412", "60%", "31", "4.0%", "—"],
              ["歐洲一般", "1,732", "49%", "30", "4.4%", "—"],
            ],
          } },
          { h: "陣營：PvP 偏部落，一般偏聯盟", p: [
            "PvP 伺服器上，部落人數是聯盟的 1.8 倍（美洲）與 2.3 倍（韓國）。韓國一般伺服器則相反，聯盟佔 64%。",
            "少數陣營的公會在同地區的競爭對手較少。Guild March 的聯盟不分陣營、同地區一起比，但領土地圖依伺服器類型分開，陣營組成會直接反映在地圖爭奪上。",
          ] },
          { h: "等級：美洲與韓國 PvP 伺服器領先", p: [
            "美洲 PvP 等級中位數 29、60 級 4.8%；一般伺服器為 24 與 2.1%。韓國 PvP 也高 3 級。",
            "與其說 PvP 伺服器升得快，不如說玩得最多的人比較常選 PvP。歐洲反而是一般伺服器的 60 級比例略高。",
          ] },
          { h: "榮譽擊殺：一般伺服器幾乎沒有", p: [
            "三天內至少增加 1 次榮譽擊殺的角色：美洲 PvP 53%、韓國 PvP 30%，一般伺服器為美洲 7%、韓國 1%。",
            "在 Guild March 計分中，榮譽每個角色每週最多 10 分（100 次）。一般伺服器公會幾乎拿不到這部分，但第 1 週第一天榮譽在 PvP 公會分數中也只佔約 12%，目前影響不大。",
          ] },
          { h: "該選哪一種", p: [
            "單看數字，想和其他公會正面交鋒的人多聚在 PvP 伺服器，想慢慢累積等級與成就的人多在一般伺服器。",
            "如果某伺服器陣營比例差距很大，少數陣營的同陣營公會少、招募較難，多數陣營的競爭公會則多。加入或成立公會時，請一起看陣營頁面與人口頁面的數字。",
          ] },
        ],
        close: [
          "總結：PvP 伺服器部落多、等級較高、榮譽擊殺活躍；一般伺服器偏聯盟，幾乎沒有榮譽擊殺。韓國的差距最大。",
          "同樣的數字每天在人口頁面更新。",
        ],
      },
    },
  },
  {
    slug: "guild-leader-week-2026-11",
    date: "2026-11-20",
    text: {
      ko: {
        title: "길드장의 한 주: 목요일 초기화부터 마감까지 Guild March 쓰는 법",
        lead: "주간 순위가 언제 바뀌고 무엇이 세어지는지, 길드장이 한 주 동안 언제 무엇을 보면 되는지 시간 순서대로 정리했습니다.",
        description: "WoW 포에버 길드장을 위한 Guild March 주간 일정: 목요일 08:00(한국 시간) 초기화, 매일 갱신, 주중 모집, 마감과 등급·배지·영토 진군까지 지역별 시각과 함께 정리합니다.",
        method: [
          "이 글의 규칙은 Guild March의 점수 계산 코드와 규칙 페이지를 기준으로 썼습니다. 규칙이 바뀌면 이 글도 함께 고칩니다.",
          "숫자 예시는 1주차(11월 19일 시작) 실제 데이터에서 가져왔습니다.",
        ],
        sections: [
          { h: "한 주의 시각표", p: [
            "Guild March의 한 주는 네 지역 모두 같은 순간인 목요일 08:00(한국 시간)에 시작하고 끝납니다. 데이터는 매일 같은 시각에 한 번 읽습니다. 게임 자체의 주간 초기화와는 따로입니다.",
          ], table: {
            head: ["지역", "주 시작·마감", "매일 갱신"],
            rows: [
              ["한국", "목 08:00", "08:00"],
              ["대만", "목 07:00", "07:00"],
              ["유럽(중부)", "목 00:00", "00:00"],
              ["미국 동부", "수 18:00", "18:00"],
              ["미국 서부", "수 15:00", "15:00"],
            ],
          } },
          { h: "목요일 08:00: 마감과 새 주", p: [
            "지난주가 마감되어 리그별 최종 순위, 9단계 등급, 배지가 정해지고 영토 지도에서 진군이 일어납니다. 마감된 결과는 주차별 결과 페이지와 주간 전황 리포트에 남습니다.",
            "새 주는 그 순간 길드 명단에 있는 10레벨 이상 구성원으로 시작합니다. 이 명단이 한 주 동안 고정됩니다.",
            "새 주의 첫 갱신 직후에는 순위에 오른 길드가 적습니다. 주가 시작된 지 몇 분밖에 안 되어 그 주에 접속한 길드원이 거의 없기 때문입니다. 1주차 첫날 한국은 PvP·일반 서버 각 1곳만 순위에 올랐다가, 다음 날 50곳과 7곳으로 채워졌습니다.",
          ] },
          { h: "평일: 매일 08:00 갱신", p: [
            "매일 한 번 공개 프로필을 읽어 레벨, 업적, 명예 킬을 다시 셉니다. 게임에 접속 중인 캐릭터는 로그아웃한 뒤에 반영되므로, 길게 접속한 날은 다음 날 한꺼번에 들어옵니다.",
            "길드 페이지에서는 길드원별 기여 내역을, 첫 화면에서는 어제와 달라진 점을 볼 수 있습니다. 내 길드를 한 번 열어 두면 다음 방문 때 첫 화면 맨 위에 보입니다.",
          ] },
          { h: "주중 모집: 이번 주 순위는 흔들리지 않습니다", p: [
            "주중에 들어온 길드원은 그 주에는 점수에도 활동 인원에도 들어가지 않고, 다음 목요일부터 셉니다. 모집을 언제 하든 그 주 순위에는 영향이 없습니다.",
            "모집 글에는 길드 페이지 링크와 공유 카드를 붙일 수 있습니다. 리그 순위, 등급, 영토가 한 장에 들어가 있어 길드의 활동을 숫자로 보여 줄 수 있습니다.",
            "인원당 점수로 겨루기 때문에, 접속은 하지만 거의 플레이하지 않는 캐릭터가 많으면 평균이 내려갑니다. 접속하지 않는 캐릭터는 영향이 없습니다.",
          ] },
          { h: "처음이라면", p: [
            "길드가 목록에 없으면 등록 페이지에서 지역, 서버, 길드 이름으로 등록합니다. 등록한 다음 주 목요일부터 점수가 매겨집니다.",
            "길드원 중 누군가 자신의 캐릭터를 빼고 싶어 하면 제외 요청 페이지에서 직접 요청할 수 있습니다. 다음 갱신부터 사이트에서 사라집니다.",
            "점수 규칙 전체와 등급·배지 기준은 규칙 페이지에 있습니다.",
          ] },
        ],
        close: [
          "정리하면, 목요일 08:00에 한 주가 마감되고 새로 시작되며, 순위는 매일 08:00에 바뀝니다. 새 주 첫날은 순위가 비어 보이는 것이 정상이고, 주중 모집은 다음 주부터 반영됩니다.",
        ],
      },
      en: {
        title: "A guild leader's week: using Guild March from the Thursday reset to the close",
        lead: "When the weekly ranks change, what counts, and what a guild leader can check when, in order through the week.",
        description: "The Guild March week for WoW Forever guild leaders: the Thursday 08:00 Korea time reset, daily updates, mid-week recruiting, and the close with tiers, badges and the territory march, with local times for each region.",
        method: [
          "The rules here follow Guild March's scoring code and rules page. When a rule changes, this guide changes with it.",
          "Examples use real data from week 1, which started on November 19 Korea time.",
        ],
        sections: [
          { h: "The week's timetable", p: [
            "A Guild March week starts and ends at the same moment in all four regions: Thursday 08:00 Korea time. Data is read once a day at that same time. This is separate from the game's own weekly reset.",
          ], table: {
            head: ["Region", "Week starts and closes", "Daily update"],
            rows: [
              ["Korea", "Thu 08:00", "08:00"],
              ["Taiwan", "Thu 07:00", "07:00"],
              ["Central Europe", "Thu 00:00", "00:00"],
              ["US Eastern", "Wed 18:00", "18:00"],
              ["US Pacific", "Wed 15:00", "15:00"],
            ],
          } },
          { h: "The reset: close and new week", p: [
            "Last week closes: final ranks in each league, the nine tiers and badges are settled, and the territory map marches. Closed results stay on the past weeks page and in the weekly war report.",
            "The new week starts with the level 10+ members on each guild roster at that moment. That roster is fixed for the week.",
            "Right after the new week's first update, few guilds are ranked: the week is only minutes old, so hardly any members have logged in yet. On the first day of week 1, Korea had one ranked guild on each realm type; the next day it filled in to 50 and 7.",
          ] },
          { h: "During the week: one update a day", p: [
            "Once a day the public profiles are read and levels, achievements and honorable kills are counted again. Characters who are logged in show up after they log out, so a long session lands the next day.",
            "A guild's page shows each member's contribution, and the home page shows what changed since yesterday. Open your guild once and it stays at the top of the home page on your next visit.",
          ] },
          { h: "Recruiting mid-week doesn't shake this week's rank", p: [
            "Members who join mid-week count neither as points nor as active members that week; they count from the next Thursday. Whenever you recruit, the current week stays as it was.",
            "Recruiting posts can carry your guild page link and share card, with league rank, tier and territory on one image: the guild's activity in numbers.",
            "Because guilds compete on points per member, many characters who log in but barely play pull the average down. Characters who don't log in have no effect.",
          ] },
          { h: "Getting started", p: [
            "If your guild isn't listed, add it on the register page with region, realm and guild name. It's scored from the Thursday after it's added.",
            "A member who wants their character off the site can ask on the opt-out page. It's gone from the next update.",
            "The full scoring rules and the tier and badge criteria are on the rules page.",
          ] },
        ],
        close: [
          "In short: the week closes and restarts on Thursday at 08:00 Korea time, and ranks change once a day at that time. A thin table on the first day of a week is normal, and mid-week recruits count from the next week.",
        ],
      },
      "zh-tw": {
        title: "會長的一週：從週四重置到結算，Guild March 使用指南",
        lead: "每週排名何時變動、計算哪些項目，以及會長在一週內何時該看什麼，依時間順序整理。",
        description: "給 WoW Forever 會長的 Guild March 每週行程：週四 08:00（韓國時間）重置、每日更新、週中招募，以及結算時的等級、徽章與領土進軍，附各地區時間。",
        method: [
          "本文的規則以 Guild March 的計分程式與規則頁面為準。規則變更時本文也會一起修改。",
          "數字範例取自第 1 週（11 月 19 日開始）的實際資料。",
        ],
        sections: [
          { h: "一週時間表", p: [
            "Guild March 的一週在四個地區同一時刻開始與結束：週四 08:00（韓國時間）。資料每天在同一時間讀取一次。這與遊戲本身的每週重置無關。",
          ], table: {
            head: ["地區", "週開始與結算", "每日更新"],
            rows: [
              ["韓國", "週四 08:00", "08:00"],
              ["台灣", "週四 07:00", "07:00"],
              ["歐洲（中部）", "週四 00:00", "00:00"],
              ["美國東部", "週三 18:00", "18:00"],
              ["美國西部", "週三 15:00", "15:00"],
            ],
          } },
          { h: "重置時：結算與新的一週", p: [
            "上週結算：決定各聯盟最終排名、9 階等級與徽章，領土地圖進行進軍。結算結果保留在每週結果頁面與每週戰況報告。",
            "新的一週以那一刻公會名單上 10 級以上的成員開始，這份名單整週固定。",
            "新週第一次更新後上榜公會很少，因為週才開始幾分鐘，幾乎沒有成員登入。第 1 週第一天韓國 PvP 與一般伺服器各只有 1 個公會上榜，隔天就補到 50 個與 7 個。",
          ] },
          { h: "週間：每天更新一次", p: [
            "每天讀取一次公開資料，重新計算等級、成就與榮譽擊殺。在線中的角色登出後才會反映，長時間在線的那天會在隔天一起補上。",
            "公會頁面可以看到每位成員的貢獻，首頁則顯示和昨天相比的變化。打開一次自己的公會，下次造訪時會顯示在首頁最上方。",
          ] },
          { h: "週中招募不影響本週排名", p: [
            "週中加入的成員當週不計分也不算活躍人數，從下週四開始計算。不論何時招募，本週排名都不受影響。",
            "招募文可以附上公會頁面連結與分享卡，聯盟排名、等級與領土都在一張圖上，用數字展示公會的活躍度。",
            "因為是比每人分數，有登入卻幾乎不玩的角色多，平均就會下降。沒有登入的角色沒有影響。",
          ] },
          { h: "第一次使用", p: [
            "如果公會不在清單上，到登錄頁面輸入地區、伺服器與公會名稱登錄。登錄後的下一個週四開始計分。",
            "成員若想把自己的角色從網站移除，可以在排除申請頁面自行申請，下次更新後就會消失。",
            "完整計分規則與等級、徽章標準在規則頁面。",
          ] },
        ],
        close: [
          "總結：每週四 08:00（韓國時間，台灣 07:00）結算並開始新的一週，排名每天在同一時間更新。新週第一天排名看起來很空是正常的，週中招募的成員從下週開始計算。",
        ],
      },
    },
  },
];
