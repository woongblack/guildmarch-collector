// Questions-and-answers articles (R-25). Each one answers a single question in its first lines,
// then explains from the rules as they are coded (lib/league.ts, lib/territory.ts). When a rule
// changes, change the article and its updated date with it.
import { extraAnswers } from "./answers-extra.ts";
import type { Lang } from "./i18n.ts";

type Text = { title: string; summary: string; sections: { h: string; p: string[] }[] };
export type Answer = { slug: string; updated: string; related: string[]; text: Record<Lang, Text> };

const firstAnswers: Answer[] = [
  {
    slug: "how-ranking-works",
    updated: "2026-11-24",
    related: ["/guide/", "/ranks/"],
    text: {
      ko: {
        title: "WoW 포에버 길드 순위는 어떻게 정하나요?",
        summary: "한 주 동안 길드원이 올린 레벨, 업적, 명예 킬을 점수로 바꾸고, 활동 인원으로 소·중·대 리그를 나눈 뒤 리그 안에서 활동 인원당 점수로 순위를 매깁니다. 주는 목요일 08:00(한국 시간)에 시작하고, 순위는 매일 08:00에 갱신합니다.",
        sections: [
          { h: "무엇이 점수가 되나요?", p: [
            "레벨 1을 올릴 때마다 1점(캐릭터당 주 20점까지), 60레벨에 닿으면 10점(캐릭터당 한 번), 업적 하나에 5점(상한 없음), 명예 킬 10회에 1점(캐릭터당 주 10점까지)입니다.",
            "던전과 레이드 기록은 아직 점수에 없습니다. 레이드가 열리는 12월 9일 뒤에 넣을 예정입니다.",
          ] },
          { h: "어떤 길드원이 세어지나요?", p: [
            "주가 시작될 때 길드 명단에 있고 10레벨 이상인 구성원만 셉니다. 주중에 들어온 길드원은 다음 주부터 들어갑니다.",
            "그중 그 주에 한 번이라도 접속한 구성원이 활동 인원입니다. 점수는 이 활동 인원으로 나눕니다.",
          ] },
          { h: "리그와 순위는 어떻게 정하나요?", p: [
            "활동 인원 5~19명은 소 리그, 20~49명은 중 리그, 50명 이상은 대 리그입니다. 5명이 안 되면 그 주 순위에 오르지 않습니다.",
            "리그 안에서는 총점을 활동 인원으로 나눈 인원당 점수가 높은 순서로 순위를 매기고, 같으면 공동 순위입니다.",
            "한 지역의 PvP 서버와 일반 서버 길드는 같은 리그에서 겨룹니다. 영토 지도만 룰셋마다 따로입니다.",
          ] },
          { h: "순위는 언제 바뀌나요?", p: [
            "매일 08:00(한국 시간)에 공개 데이터를 한 번 읽어 순위를 다시 계산합니다. 게임에 접속 중인 캐릭터는 로그아웃한 뒤에 반영됩니다.",
            "목요일 08:00에 그 주가 마감되고 새 주차가 시작됩니다. 마감된 주의 결과는 주차별 결과 페이지에 그대로 남습니다.",
          ] },
        ],
      },
      en: {
        title: "How are WoW: Forever guilds ranked?",
        summary: "Levels, achievements and honorable kills your members earn in a week are turned into points. Guilds are split into small, medium and large leagues by active members, and ranked within their league by points per active member. Weeks start on Thursday at 08:00 Korea time and ranks update every day at 08:00.",
        sections: [
          { h: "What earns points?", p: [
            "1 point per level gained (up to 20 per character a week), 10 for reaching level 60 (once per character), 5 per achievement (no limit) and 1 per 10 honorable kills (up to 10 per character a week).",
            "Dungeon and raid progress doesn't count yet. It's planned for after raids open on December 9.",
          ] },
          { h: "Which members count?", p: [
            "Only members who are on the guild roster and at least level 10 when the week starts. Anyone who joins mid-week counts from the next week.",
            "Of those, members who log in at least once that week are the active members, and the guild's points are divided by them.",
          ] },
          { h: "How do leagues and ranks work?", p: [
            "5 to 19 active members is the small league, 20 to 49 the medium league, and 50 or more the large league. A guild with fewer than 5 isn't ranked that week.",
            "Within a league, guilds are ranked by total points divided by active members. Equal scores share a rank.",
            "PvP and Normal realm guilds of the same region share the leagues. Only the territory maps are split by ruleset.",
          ] },
          { h: "When do the ranks change?", p: [
            "The public data is read once a day at 08:00 Korea time and the ranks are worked out again. Characters who are logged in show up after they log out.",
            "On Thursday at 08:00 the week closes and a new one starts. Closed weeks stay on the past weeks page as they ended.",
          ] },
        ],
      },
      "zh-tw": {
        title: "WoW: Forever 公會排名是怎麼決定的？",
        summary: "把公會成員一週內提升的等級、完成的成就與榮譽擊殺換算成分數，依活躍人數分成小型、中型、大型組，再在組內以每位活躍成員的平均分數排名。每週從週四 07:00（台灣時間）開始，排名每天 07:00 更新。",
        sections: [
          { h: "哪些行為會得分？", p: [
            "每提升 1 級得 1 分（每個角色每週最多 20 分），達到 60 級得 10 分（每個角色 1 次），每個成就得 5 分（無上限），每 10 次榮譽擊殺得 1 分（每個角色每週最多 10 分）。",
            "地城與團隊副本紀錄目前還沒有計入分數，預計在 12 月 9 日團隊副本開放後加入。",
          ] },
          { h: "哪些成員會被計算？", p: [
            "只計算一週開始時在公會名單中、且等級 10 以上的成員。週中加入的成員從下週開始計算。",
            "其中在這一週至少上線一次的成員就是活躍成員，公會分數會除以活躍人數。",
          ] },
          { h: "分組與排名怎麼決定？", p: [
            "活躍 5～19 人是小型組，20～49 人是中型組，50 人以上是大型組。不到 5 人的公會當週不會上榜。",
            "組內依總分除以活躍人數的每人分數排名，分數相同則並列名次。",
            "同一地區的 PvP 伺服器與一般伺服器公會在同一組內競賽，只有領土地圖依規則分開。",
          ] },
          { h: "排名什麼時候更新？", p: [
            "每天 07:00（台灣時間）讀取一次公開資料並重新計算排名。正在遊戲中的角色會在登出後才反映。",
            "週四 07:00 結算當週並開始新的一週。結算後的結果會原樣保留在歷週結果頁面。",
          ] },
        ],
      },
    },
  },
  {
    slug: "raise-weekly-score",
    updated: "2026-11-24",
    related: ["/guide/", "/"],
    text: {
      ko: {
        title: "길드 주간 점수를 올리려면 무엇을 해야 하나요?",
        summary: "업적이 가장 큰 몫입니다. 업적은 하나에 5점이고 상한이 없지만, 레벨은 캐릭터당 주 20점, 명예 킬은 주 10점에서 멈춥니다. 순위는 활동 인원당 점수로 매기므로, 그 주에 접속한 길드원이 저마다 조금씩 쌓는 것이 인원을 늘리는 것보다 중요합니다.",
        sections: [
          { h: "업적이 왜 가장 중요한가요?", p: [
            "업적 하나는 5점입니다. 업적 네 개면 한 캐릭터가 한 주에 레벨로 얻을 수 있는 최대치(20점)와 같습니다.",
            "업적은 달성한 시각으로 셉니다. 조회가 하루 늦어도 그 주에 달성했다면 그 주 점수에 들어갑니다.",
          ] },
          { h: "레벨로는 몇 점까지 얻나요?", p: [
            "레벨 1을 올릴 때마다 1점이고, 한 캐릭터가 한 주에 받을 수 있는 레벨 점수는 20점까지입니다. 그래서 한 캐릭터를 몰아서 키우기보다 여러 길드원이 고르게 레벨을 올리는 편이 점수가 큽니다.",
            "60레벨에 닿으면 캐릭터마다 한 번 10점을 더 받습니다.",
          ] },
          { h: "명예 킬로는 몇 점까지 얻나요?", p: [
            "명예 킬 10회에 1점이며, 캐릭터당 주 10점(100회)에서 멈춥니다. 누적 횟수가 늘어난 만큼만 보므로 누구를 잡았는지는 상관없습니다.",
          ] },
          { h: "왜 인원당 점수가 중요한가요?", p: [
            "점수는 그 주에 접속한 구성원 수로 나눕니다. 접속만 하고 아무 점수도 얻지 못한 캐릭터가 많으면 인원당 점수가 낮아집니다.",
            "주중에 들어온 길드원은 그 주에 세지 않습니다. 영입은 다음 주부터 점수에 반영됩니다.",
            "10레벨 미만 캐릭터와 게임에 접속 중인 캐릭터는 공식 API에서 조회되지 않습니다. 로그아웃하면 다음 갱신 때 반영됩니다.",
          ] },
        ],
      },
      en: {
        title: "How can our guild raise its weekly score?",
        summary: "Achievements matter most: 5 points each with no limit, while levels stop at 20 points per character a week and honorable kills at 10. Ranks use points per active member, so every member who logs in earning a little counts for more than adding members.",
        sections: [
          { h: "Why do achievements matter most?", p: [
            "Each achievement is worth 5 points. Four of them equal the most a character can earn from levels in a week (20 points).",
            "Achievements count by when they were earned, so one earned this week counts this week even if it's read a day later.",
          ] },
          { h: "How many points can levels give?", p: [
            "Each level gained is 1 point, up to 20 per character a week. Several members levelling evenly score more than one character levelled hard.",
            "Reaching level 60 adds 10 points, once per character.",
          ] },
          { h: "How many points can honorable kills give?", p: [
            "Every 10 honorable kills is 1 point, up to 10 points (100 kills) per character a week. Only the rise in the running total counts, not who was killed.",
          ] },
          { h: "Why does score per member matter?", p: [
            "Points are divided by the members who logged in that week. Many characters who log in without earning anything lower the score per member.",
            "Members who join mid-week don't count that week. New recruits count from the next week.",
            "The official API doesn't return characters below level 10 or characters who are logged in. They show up at the next update after logging out.",
          ] },
        ],
      },
      "zh-tw": {
        title: "公會每週分數要怎麼提高？",
        summary: "成就佔最大比重：每個 5 分且沒有上限，而等級每個角色每週最多 20 分，榮譽擊殺最多 10 分。排名看的是每位活躍成員的平均分數，所以當週上線的成員各自穩定得分，比增加人數更重要。",
        sections: [
          { h: "為什麼成就最重要？", p: [
            "每個成就 5 分。四個成就就等於一個角色一週靠等級能拿到的上限（20 分）。",
            "成就以達成時間計算。即使晚一天讀取，只要是本週達成就會算在本週。",
          ] },
          { h: "升級最多能得幾分？", p: [
            "每提升 1 級得 1 分，一個角色一週最多 20 分。與其集中練一個角色，不如多位成員平均升級，分數會更高。",
            "達到 60 級時，每個角色再加 10 分，只算一次。",
          ] },
          { h: "榮譽擊殺最多能得幾分？", p: [
            "每 10 次榮譽擊殺得 1 分，每個角色每週最多 10 分（100 次）。只看累計次數的增加，與擊殺了誰無關。",
          ] },
          { h: "為什麼看的是每人分數？", p: [
            "分數會除以當週上線的成員人數。只上線卻沒有得分的角色多了，每人分數就會降低。",
            "週中加入的成員當週不計算，新成員從下週開始反映在分數上。",
            "官方 API 查不到 10 級以下的角色和正在遊戲中的角色。登出後會在下次更新時反映。",
          ] },
        ],
      },
    },
  },
  {
    slug: "small-guild-chance",
    updated: "2026-11-24",
    related: ["/guide/", "/ranks/"],
    text: {
      ko: {
        title: "작은 길드도 1위를 할 수 있나요?",
        summary: "네. 활동 인원 5명부터 소 리그 순위에 오르고, 리그 안에서는 총점이 아니라 활동 인원당 점수로 겨룹니다. 리그 1위는 리그가 작아도 최소 성주 등급을 받습니다.",
        sections: [
          { h: "리그는 규모별로 어떻게 나뉘나요?", p: [
            "그 주의 활동 인원으로 리그를 나눕니다. 5~19명은 소 리그, 20~49명은 중 리그, 50명 이상은 대 리그라서 큰 길드와 작은 길드가 같은 표에서 겨루지 않습니다.",
          ] },
          { h: "인원당 점수가 작은 길드에 왜 유리한가요?", p: [
            "순위는 총점을 활동 인원으로 나눈 값으로 정합니다. 다섯 명이 저마다 꾸준히 점수를 쌓으면 인원이 많은 길드보다 앞설 수 있습니다.",
          ] },
          { h: "작은 길드도 등급과 배지를 받나요?", p: [
            "주가 마감되면 순위에 오른 모든 길드가 리그 안 위치에 따라 9단계 등급 중 하나를 받습니다. 리그 꼴찌도 깃발병 I을 받습니다.",
            "리그 1위는 리그 크기와 상관없이 최소 성주를 받습니다. 가장 높은 패왕은 길드가 11곳 이상인 리그의 1위부터 나옵니다.",
            "레벨, 업적, 명예 배지도 리그 안에서 인원당 점수가 가장 높은 길드에게 줍니다.",
          ] },
          { h: "인원이 바뀌면 어떻게 되나요?", p: [
            "활동 인원이 바뀌어 리그를 옮기면 순위 변동 대신 \"옮겨 옴\"으로 표시합니다. 그 주에는 급상승 배지 대상에서 빠집니다.",
          ] },
        ],
      },
      en: {
        title: "Can a small guild finish first?",
        summary: "Yes. Five active members are enough to be ranked in the small league, and within a league guilds compete on points per active member, not total points. A league winner gets at least the Castellan tier however small the league is.",
        sections: [
          { h: "How are leagues split by size?", p: [
            "Each week's active members decide the league: 5 to 19 is small, 20 to 49 medium, and 50 or more large, so big and small guilds don't share a table.",
          ] },
          { h: "Why does score per member help small guilds?", p: [
            "Rank comes from total points divided by active members. Five members who each earn steadily can finish ahead of a much bigger guild.",
          ] },
          { h: "Do small guilds get tiers and badges too?", p: [
            "When a week closes, every ranked guild gets one of nine tiers from where it finished in its league. Even the last guild in a league gets Banner Bearer I.",
            "A league winner gets at least Castellan, whatever the league's size. The top tier, Overlord, starts with the winner of a league of 11 guilds or more.",
            "The levels, achievements and honor badges also go to the guild with the most points per member in its league.",
          ] },
          { h: "What happens when a guild's size changes?", p: [
            "A guild whose active members move it to another league shows as moved rather than up or down, and can't earn the Biggest climb badge that week.",
          ] },
        ],
      },
      "zh-tw": {
        title: "小公會也能拿第一嗎？",
        summary: "可以。活躍 5 人就能在小型組上榜，組內比的不是總分，而是每位活躍成員的平均分數。組內第一名即使分組很小，也至少會獲得城主等級。",
        sections: [
          { h: "分組怎麼依規模劃分？", p: [
            "依當週活躍人數分組：5～19 人是小型組，20～49 人是中型組，50 人以上是大型組，大公會和小公會不會在同一張表上比較。",
          ] },
          { h: "每人分數為什麼對小公會有利？", p: [
            "名次由總分除以活躍人數決定。五位成員各自穩定得分，就可能贏過人數多很多的公會。",
          ] },
          { h: "小公會也會得到等級與徽章嗎？", p: [
            "每週結算時，所有上榜公會會依在組內的位置獲得 9 個等級之一。組內最後一名也會獲得旗手 I。",
            "組內第一名不論分組大小，至少會獲得城主。最高等級霸王從 11 個公會以上分組的第一名開始出現。",
            "等級、成就、榮譽徽章也是頒給組內每人分數最高的公會。",
          ] },
          { h: "人數改變時會怎樣？", p: [
            "活躍人數改變而換組時，會顯示「移入」而不是名次變化，當週也不列入最大躍升徽章。",
          ] },
        ],
      },
    },
  },
  {
    slug: "pvp-vs-normal-realms",
    updated: "2026-11-24",
    related: ["/ranks/", "/factions/", "/map/"],
    text: {
      ko: {
        title: "PvP 서버와 일반 서버 길드는 따로 겨루나요?",
        summary: "순위는 같이, 영토 지도와 진영 비교는 따로입니다. 한 지역의 PvP 서버와 일반 서버 길드는 같은 소·중·대 리그에서 인원당 점수로 겨루고, 영토 지도는 지역과 룰셋마다 한 장씩 있습니다.",
        sections: [
          { h: "PvP와 일반 서버 길드는 같이 순위를 매기나요?", p: [
            "점수 산식은 룰셋과 상관없이 같습니다. 그래서 한 지역의 길드는 룰셋을 가리지 않고 활동 인원에 따라 같은 리그에 들어갑니다.",
            "지역별 순위 페이지(예: 한국 PvP 서버)는 그 지역 순위표에서 해당 룰셋 길드만 보여 줍니다. 리그 순위 번호가 건너뛸 수 있는 이유입니다.",
          ] },
          { h: "PvP 서버가 명예 킬 점수에 유리한가요?", p: [
            "PvP 서버에서는 필드에서 마주치는 일이 많아 명예 킬이 더 쉽게 쌓일 수 있습니다. 대신 명예 점수는 캐릭터당 주 10점에서 멈추고, 업적에는 상한이 없어 한쪽이 크게 유리하지 않게 했습니다.",
          ] },
          { h: "영토 지도는 룰셋끼리 같이 쓰나요?", p: [
            "지도는 지역과 룰셋마다 따로 있습니다(예: 한국 PvP, 한국 일반). 같은 지도에 있는 길드끼리만 땅을 넓히고 빼앗습니다. 리그와 진영은 지도에서 나누지 않습니다.",
          ] },
          { h: "진영 비교도 룰셋별로 나뉘나요?", p: [
            "진영 통계는 룰셋마다 호드와 얼라이언스를 따로 비교합니다. 등록한 길드만 센 값이라 서버 전체 인구와는 다릅니다.",
          ] },
        ],
      },
      en: {
        title: "Do PvP and Normal realm guilds compete separately?",
        summary: "They share the ranks but not the maps. PvP and Normal realm guilds in the same region compete in the same small, medium and large leagues on points per member, while the territory map and the faction comparison are kept per ruleset.",
        sections: [
          { h: "Are PvP and Normal realm guilds ranked together?", p: [
            "The scoring is the same on either ruleset, so a region's guilds go into the same leagues by active members, whatever their ruleset.",
            "A region page such as Korea PvP realms shows that ruleset's guilds from the region's table, which is why league rank numbers can skip.",
          ] },
          { h: "Do PvP realms have an edge in honor points?", p: [
            "On PvP realms players run into each other in the open world more often, so honorable kills can come easier. Honor points stop at 10 per character a week, while achievements have no limit, so neither side gets a large edge.",
          ] },
          { h: "Do the rulesets share a territory map?", p: [
            "Each region has a map per ruleset (for example Korea PvP and Korea Normal). Guilds only claim and take land from guilds on the same map. The map doesn't split by league or faction.",
          ] },
          { h: "Are faction stats split by ruleset?", p: [
            "The faction stats compare Horde and Alliance separately for each ruleset. They count registered guilds only, so they aren't a server population.",
          ] },
        ],
      },
      "zh-tw": {
        title: "PvP 伺服器和一般伺服器的公會是分開比賽的嗎？",
        summary: "排名一起，地圖分開。同一地區的 PvP 伺服器與一般伺服器公會在同樣的小型、中型、大型組中以每人分數競賽，而領土地圖與陣營比較則依規則分開。",
        sections: [
          { h: "PvP 與一般伺服器的公會一起排名嗎？", p: [
            "兩種規則的計分公式相同，所以同一地區的公會不分規則，依活躍人數進入同樣的分組。",
            "各地區排名頁面（例如韓國 PvP 伺服器）只顯示該地區排名表中這個規則的公會，所以組內名次可能會跳號。",
          ] },
          { h: "PvP 伺服器在榮譽擊殺分數上比較有利嗎？", p: [
            "PvP 伺服器在野外遇到敵對陣營的機會較多，榮譽擊殺可能比較容易累積。不過榮譽分數每個角色每週最多 10 分，而成就沒有上限，所以不會讓某一邊大幅領先。",
          ] },
          { h: "不同規則共用領土地圖嗎？", p: [
            "每個地區依規則各有一張地圖（例如韓國 PvP、韓國一般）。公會只會在同一張地圖上擴張和奪取土地。地圖上不分組，也不分陣營。",
          ] },
          { h: "陣營比較也依規則分開嗎？", p: [
            "陣營統計會依規則分別比較部落與聯盟。只計算已登記的公會，與伺服器整體人口不同。",
          ] },
        ],
      },
    },
  },
  {
    slug: "territory-map",
    updated: "2026-11-24",
    related: ["/map/", "/ranks/"],
    text: {
      ko: {
        title: "길드 영토 지도는 어떻게 움직이나요?",
        summary: "주가 마감될 때마다 순위에 오른 길드가 그 주 등급만큼 진군해 빈 땅을 차지하고, 맞닿은 땅 중 자기보다 등급이 낮은 길드의 땅을 빼앗습니다. 수도는 빼앗기지 않고, 한 주에 잃는 땅은 가진 땅의 절반까지입니다. 지도는 4주 시즌마다 비웁니다.",
        sections: [
          { h: "지도는 어떻게 나뉘어 있나요?", p: [
            "지역과 룰셋마다 지도가 한 장 있고, 약 2,000칸과 지형을 따라 나눈 지역 37곳으로 되어 있습니다. 진영과 상관없이 어느 길드든 어디나 차지할 수 있습니다.",
          ] },
          { h: "수도와 진군은 무엇인가요?", p: [
            "길드가 시즌 중 처음 순위에 오르면 수도 한 칸을 받습니다. 수도는 빼앗기지 않습니다.",
            "주가 마감되면 등급에 따라 진군 횟수를 받습니다. 패왕은 4, 성주와 깃발대장은 3, 돌파자와 선봉 II는 2, 그 밖의 등급은 1이고, 지도가 2~3주 안에 차도록 순위 길드 수에 맞춘 배수를 곱합니다.",
            "등급이 높은 길드부터 한 번씩 돌아가며 진군합니다. 맞닿은 빈칸을 먼저 차지하고, 빈칸이 없으면 맞닿은 칸 중 자기보다 그 주 등급이 낮은 길드의 칸을 빼앗습니다. 둘러싸이면 지도 어디든 가장 약한 곳으로 원정을 갑니다.",
          ] },
          { h: "한 주에 땅을 얼마나 잃을 수 있나요?", p: [
            "한 주에 잃는 땅은 진군 전에 가진 땅의 절반까지입니다.",
            "그 주 순위에 오르지 못한 길드는 진군하지 않고 누구에게나 땅을 빼앗길 수 있습니다(수도 제외).",
          ] },
          { h: "영주와 시즌 보상은 어떻게 정해지나요?", p: [
            "한 지역에서 칸의 절반을 넘게 가진 길드가 그 지역의 영주가 됩니다. 길드 페이지에 \"불타는 산의 영주\"처럼 남습니다.",
            "시즌은 4주이며 첫 시즌은 2026년 12월 17일에 마감합니다. 시즌 영토 1위, 대륙의 패자, 철옹성, 역전 칭호를 줄 예정이고, 칭호는 명예일 뿐 점수와 리그에는 영향이 없습니다.",
          ] },
        ],
      },
      en: {
        title: "How does the guild territory map work?",
        summary: "Each time a week closes, ranked guilds march by their tier for the week: they claim empty land, then take neighbouring land from guilds with a lower tier. Capitals can't be taken, and a guild loses at most half its land in a week. The map is cleared every four-week season.",
        sections: [
          { h: "How are the maps divided?", p: [
            "Each region has one map per ruleset, made of about 2,000 cells and 37 regions drawn along the terrain. Any guild can hold land anywhere, whatever its faction.",
          ] },
          { h: "What are capitals and marches?", p: [
            "A guild gets a capital cell the first time it's ranked in a season. Capitals can't be taken.",
            "When a week closes, guilds get marches by tier: 4 for Overlord, 3 for Castellan and Banner Captain, 2 for Breaker and Vanguard II, and 1 for the rest, multiplied to suit the number of ranked guilds so the map fills in two or three weeks.",
            "Guilds take turns, highest tier first. They claim neighbouring empty cells first, then neighbouring cells of guilds with a lower tier that week. A guild that's surrounded goes on an expedition to the weakest spot anywhere on the map.",
          ] },
          { h: "How much land can a guild lose in a week?", p: [
            "A guild loses at most half the land it held before the march in a week.",
            "Guilds that aren't ranked that week don't march, and anyone can take their land except the capital.",
          ] },
          { h: "How do region lords and season rewards work?", p: [
            "A guild holding more than half the cells of a region becomes its lord, shown on the guild page as, for example, Lord of Burning Mountain.",
            "A season is four weeks, and the first one closes on December 17, 2026. Season land leader, Continent ruler, Unbroken hold and Comeback titles are planned. Titles are honor only and don't change scores or leagues.",
          ] },
        ],
      },
      "zh-tw": {
        title: "公會領土地圖是怎麼運作的？",
        summary: "每週結算時，上榜公會依當週等級進軍：先佔領無主之地，再奪取相鄰且等級比自己低的公會的土地。首都不會被奪走，一週最多失去一半的土地。地圖每四週一個賽季清空一次。",
        sections: [
          { h: "地圖怎麼劃分？", p: [
            "每個地區依規則各有一張地圖，約 2,000 格，並依地形分成 37 個地區。不論陣營，任何公會都能佔領任何地方。",
          ] },
          { h: "首都與進軍是什麼？", p: [
            "公會在賽季中第一次上榜時會獲得一格首都。首都不會被奪走。",
            "每週結算時依等級獲得進軍次數：霸王 4 次，城主與旗隊長 3 次，破陣者與先鋒 II 2 次，其他等級 1 次，並依上榜公會數乘上倍數，讓地圖在兩三週內填滿。",
            "公會從等級高的開始輪流進軍。先佔領相鄰的無主之地，沒有空地時，奪取相鄰且當週等級比自己低的公會的土地。被包圍時，會遠征到地圖上任何最弱的地方。",
          ] },
          { h: "一週最多會失去多少土地？", p: [
            "一週失去的土地最多是進軍前所擁有土地的一半。",
            "當週沒有上榜的公會不會進軍，土地也可能被任何公會奪走（首都除外）。",
          ] },
          { h: "地區領主與賽季獎勵怎麼決定？", p: [
            "在一個地區擁有超過一半格數的公會會成為該地區的領主，並在公會頁面上留下像「燃燒之山領主」這樣的稱號。",
            "一個賽季為四週，第一個賽季在 2026 年 12 月 17 日結束。預計會頒發賽季領土第一、大陸霸主、鐵壁、逆轉等稱號。稱號只是榮譽，不影響分數與分組。",
          ] },
        ],
      },
    },
  },
  {
    slug: "recruiting-post",
    updated: "2026-11-24",
    related: ["/guilds/", "/register/"],
    text: {
      ko: {
        title: "길드 모집 글에 Guild March 기록을 어떻게 쓰나요?",
        summary: "길드 페이지 주소를 모집 글에 붙이고, 리그 순위와 등급, 지역 영주 칭호를 한 줄로 적으면 됩니다. 기록은 공개 게임 데이터로 계산하므로 읽는 사람이 직접 확인할 수 있습니다.",
        sections: [
          { h: "우리 길드 페이지는 어디 있나요?", p: [
            "길드를 등록하면 다음 갱신(매일 08:00) 때 길드 페이지가 생깁니다. 길드 찾기에서 이름으로 찾아 주소를 복사하세요.",
            "첫 주차 점수가 나오기 전에는 \"첫 주차 시작 전\"과 현재 명단 인원만 보입니다. 순위와 등급은 첫 주차부터 쌓입니다.",
          ] },
          { h: "모집 글에는 뭐라고 적으면 되나요?", p: [
            "예: \"한국 PvP · 중 리그 2위 · 성주 · 불타는 산의 영주\". 지역과 룰셋, 지난주 리그 순위, 등급, 영주 칭호 순서면 읽기 쉽습니다.",
            "매주 바뀌는 순위보다 등급과 주차별 기록을 함께 보여 주면 꾸준히 활동하는 길드라는 것이 잘 드러납니다.",
          ] },
          { h: "길드 정보가 틀렸으면 어떻게 하나요?", p: [
            "룰셋이나 진영이 잘못 등록됐다면 제외 요청 페이지에서 \"길드 정보 정정\"을 골라 길드 이름을 남겨 주세요. 운영자가 확인한 뒤 고칩니다.",
          ] },
        ],
      },
      en: {
        title: "How do we use our Guild March record in a recruiting post?",
        summary: "Paste your guild page's address into the post and add one line with your league rank, tier and region lord titles. The record is worked out from public game data, so readers can check it themselves.",
        sections: [
          { h: "Where is our guild page?", p: [
            "Once a guild is added, its page appears at the next daily update (08:00 Korea time). Find it by name under Find a guild and copy the address.",
            "Until week one is scored, the page shows \"Before week one\" and the current roster only. Ranks and tiers build up from week one.",
          ] },
          { h: "What should the post say?", p: [
            "For example: \"Korea PvP · #2 in the medium league · Castellan · Lord of Burning Mountain\". Region and ruleset, last week's league rank, tier and lord titles, in that order, read easily.",
            "Showing your tier and week-by-week record alongside the rank, which changes every week, makes it clear the guild is steadily active.",
          ] },
          { h: "What if our guild's details are wrong?", p: [
            "If the ruleset or faction was registered wrongly, choose \"Fix a guild's ruleset or faction\" on the removal request page and leave the guild's name. It's fixed after a check.",
          ] },
        ],
      },
      "zh-tw": {
        title: "要怎麼在公會招募文中使用 Guild March 的紀錄？",
        summary: "把公會頁面的網址貼到招募文中，再用一行寫出組內名次、等級與地區領主稱號即可。紀錄是用公開遊戲資料計算的，讀者可以自己確認。",
        sections: [
          { h: "我們的公會頁面在哪裡？", p: [
            "登記公會後，下次更新（每天 07:00，台灣時間）時就會產生公會頁面。在「尋找公會」用名稱找到後複製網址。",
            "第一週分數出來之前，頁面只會顯示「第一週開始前」和目前名單人數。名次與等級從第一週開始累積。",
          ] },
          { h: "招募文要寫什麼？", p: [
            "例如：「台灣 PvP · 中型組第 2 名 · 城主 · 燃燒之山領主」。依地區與規則、上週組內名次、等級、領主稱號的順序寫，最容易閱讀。",
            "比起每週變動的名次，同時附上等級和歷週紀錄，更能看出公會持續活躍。",
          ] },
          { h: "公會資料有誤怎麼辦？", p: [
            "如果規則或陣營登記錯了，請在移除申請頁面選擇「更正公會資料」並留下公會名稱，營運者確認後會更正。",
          ] },
        ],
      },
    },
  },
];

export const answers: Answer[] = [...firstAnswers, ...extraAnswers];

// The five groups the Q&A list shows, each with its icon (public/images/glossary/cat-{id}-*.webp)
export const answerCategories = [
  { id: "score", slugs: ["raise-weekly-score", "no-achievement-cap", "below-level-10", "logged-in-not-updated", "dungeons-and-raids"] },
  { id: "leagues-and-tiers", slugs: ["how-ranking-works", "small-guild-chance", "league-change", "pvp-vs-normal-realms"] },
  { id: "territory", slugs: ["territory-map", "become-region-lord"] },
  { id: "registration-and-removal", slugs: ["guild-not-found", "guild-renamed-or-disbanded", "remove-my-character", "recruiting-post"] },
  { id: "data", slugs: ["weekly-reset-times", "mid-week-recruits", "faction-stats-meaning"] },
] as const;
export type AnswerCategory = (typeof answerCategories)[number]["id"];
export const categoryOf = (slug: string): AnswerCategory => answerCategories.find((c) => (c.slugs as readonly string[]).includes(slug))!.id;

export const answerBySlug = (slug: string) => answers.find((a) => a.slug === slug) ?? null;
