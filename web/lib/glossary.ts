// Glossary terms: one page per term at /[lang]/glossary/[slug]/. Definitions follow the rules as coded
// (lib/league.ts, lib/territory.ts, pipeline/); change a term when its rule changes.
import type { Lang } from "./i18n.ts";

type Text = { term: string; short: string; body: string[] };
export type Term = { slug: string; related: string[]; links: string[]; text: Record<Lang, Text> };

export const terms: Term[] = [
  {
    slug: "active-members",
    related: ["score-per-member", "week-start-roster", "leagues"],
    links: ["/guide/", "/"],
    text: {
      ko: {
        term: "활동 인원",
        short: "주 시작 명단에 있던 10레벨 이상 구성원 가운데 그 주에 한 번이라도 접속한 사람 수입니다. 리그를 나누고 인원당 점수를 계산하는 기준입니다.",
        body: [
          "활동 인원은 두 단계로 셉니다. 먼저 목요일 08:00(한국 시간) 주가 시작될 때 길드 명단에 있고 10레벨 이상인 구성원만 남깁니다. 그다음 그중 마지막 접속 시각이 그 주 시작 뒤인 구성원만 활동 인원으로 셉니다.",
          "활동 인원은 두 곳에 쓰입니다. 5~19명이면 소 리그, 20~49명이면 중 리그, 50명 이상이면 대 리그에 들어가고, 5명이 안 되면 그 주 순위에 오르지 않습니다. 그리고 길드 총점을 이 수로 나눈 값이 인원당 점수입니다.",
          "접속하지 않은 구성원을 빼는 이유는 쉬는 계정이 많은 길드가 불리하지 않게 하려는 것입니다. 반대로 접속만 하고 점수를 얻지 못한 캐릭터는 나누는 수에 들어가므로 인원당 점수를 낮춥니다.",
          "예를 들어 명단이 30명이고 그중 10레벨 이상이 24명, 그 주에 접속한 사람이 18명이면 활동 인원은 18명이고 소 리그에서 겨룹니다.",
          "게임에 접속 중인 캐릭터는 공식 API에서 조회되지 않아 로그아웃한 뒤 다음 갱신 때 반영됩니다. 조회에 실패한 캐릭터는 직전에 읽은 값을 씁니다(임시 규칙).",
        ],
      },
      en: {
        term: "Active members",
        short: "The members on the week-start roster, at level 10 or higher, who log in at least once that week. They set a guild's league and divide its score.",
        body: [
          "Active members are counted in two steps. First, only members who are on the guild roster and at least level 10 when the week starts (Thursday 08:00 Korea time) are kept. Then, of those, only members whose last login is after the week started count as active.",
          "The number is used twice. 5 to 19 active members puts a guild in the small league, 20 to 49 in the medium league and 50 or more in the large league; with fewer than 5 the guild isn't ranked that week. And the guild's total points divided by this number is its score per member.",
          "Members who don't log in are left out so that guilds with many resting accounts aren't held back. The other side of it: a character who logs in but earns nothing still counts in the divisor and lowers the score per member.",
          "For example, a roster of 30 with 24 members at level 10 or higher, 18 of whom log in that week, has 18 active members and plays in the small league.",
          "Characters who are logged in can't be read from the official API, so they show up at the next update after they log out. A character that can't be read keeps its last value read (a draft rule).",
        ],
      },
      "zh-tw": {
        term: "活躍人數",
        short: "週初名單中等級 10 以上、且當週至少上線一次的成員人數。用來決定分組，也是計算每人分數時的除數。",
        body: [
          "活躍人數分兩步計算。首先只保留週四 07:00（台灣時間）一週開始時在公會名單中、且等級 10 以上的成員。接著在這些成員中，只計算最後上線時間在本週開始之後的人。",
          "這個數字有兩個用途。活躍 5～19 人進入小型組，20～49 人進入中型組，50 人以上進入大型組；不到 5 人的公會當週不會上榜。公會總分除以這個人數就是每人分數。",
          "不計入沒有上線的成員，是為了不讓休息帳號多的公會吃虧。反過來說，只上線卻沒有得分的角色仍會算進除數，讓每人分數下降。",
          "例如名單 30 人，其中等級 10 以上 24 人，當週上線 18 人，活躍人數就是 18 人，在小型組競賽。",
          "正在遊戲中的角色無法從官方 API 查詢，會在登出後的下次更新時反映。查詢失敗的角色會使用上一次讀到的數值（暫定規則）。",
        ],
      },
    },
  },
  {
    slug: "score-per-member",
    related: ["active-members", "leagues", "guild-tiers"],
    links: ["/guide/", "/ranks/"],
    text: {
      ko: {
        term: "인원당 점수",
        short: "길드가 한 주 동안 얻은 총점을 활동 인원으로 나눈 값입니다. 같은 리그 안의 순위는 이 값으로 정합니다.",
        body: [
          "총점은 네 가지를 더한 값입니다. 레벨 1당 1점(캐릭터당 주 20점까지), 60레벨 달성 10점(캐릭터당 한 번), 업적 하나당 5점(상한 없음), 명예 킬 10회당 1점(캐릭터당 주 10점까지)입니다. 이 총점을 활동 인원으로 나눕니다.",
          "총점이 아니라 인원당 점수로 겨루는 이유는 리그 안에서도 인원 차이가 있기 때문입니다. 소 리그만 해도 5명과 19명이 같은 표에 있으므로, 나누지 않으면 인원이 많은 쪽이 거의 늘 이깁니다.",
          "화면에는 소수점 한 자리까지 보여 주고, 순위도 소수점 한 자리로 반올림한 값으로 매깁니다. 반올림한 값이 같으면 공동 순위이고(1, 2, 2, 4위처럼), 표의 순서는 먼저 등록한 길드가 위입니다.",
          "예를 들어 활동 인원 8명인 길드가 레벨 60점, 업적 45점, 명예 9점으로 총 114점을 얻으면 인원당 점수는 14.3입니다.",
        ],
      },
      en: {
        term: "Score per member",
        short: "A guild's total points for the week divided by its active members. Guilds in the same league are ranked by it.",
        body: [
          "Total points add up four things: 1 per level gained (up to 20 per character a week), 10 for reaching level 60 (once per character), 5 per achievement (no limit) and 1 per 10 honorable kills (up to 10 per character a week). The total is divided by the active members.",
          "Guilds compete on points per member rather than total points because sizes differ even within a league. The small league alone puts 5-member and 19-member guilds in the same table, and without dividing the bigger guild would almost always win.",
          "The score is shown to one decimal place, and ranks use the score rounded to one decimal. Guilds with the same rounded score share a rank (1, 2, 2, 4), and the guild that registered first is listed higher.",
          "For example, a guild with 8 active members that earns 60 level points, 45 achievement points and 9 honor points has 114 points in all, or 14.3 per member.",
        ],
      },
      "zh-tw": {
        term: "每人分數",
        short: "公會一週總分除以活躍人數的數值。同一組內的名次由這個數值決定。",
        body: [
          "總分由四項相加：每提升 1 級得 1 分（每個角色每週最多 20 分），達到 60 級得 10 分（每個角色 1 次），每個成就 5 分（無上限），每 10 次榮譽擊殺 1 分（每個角色每週最多 10 分）。總分再除以活躍人數。",
          "比的是每人分數而不是總分，是因為同一組內人數也有差距。光是小型組就有 5 人和 19 人的公會在同一張表上，不除以人數的話，人多的一方幾乎總是會贏。",
          "畫面上顯示到小數點後一位，名次也以四捨五入到小數點後一位的數值決定。數值相同則並列名次（例如第 1、2、2、4 名），表上的順序是先登記的公會在前。",
          "例如活躍 8 人的公會得到等級 60 分、成就 45 分、榮譽 9 分，總共 114 分，每人分數就是 14.3。",
        ],
      },
    },
  },
  {
    slug: "leagues",
    related: ["active-members", "score-per-member", "rulesets"],
    links: ["/ranks/", "/guide/"],
    text: {
      ko: {
        term: "리그",
        short: "그 주의 활동 인원으로 나눈 소·중·대 세 묶음입니다. 활동 인원 5~19명은 소 리그, 20~49명은 중 리그, 50명 이상은 대 리그에서 겨룹니다.",
        body: [
          "리그는 매주 새로 정합니다. 지난주에 중 리그였던 길드도 이번 주 활동 인원이 19명이면 소 리그로 갑니다. 활동 인원이 5명이 안 되면 어느 리그에도 들지 않고 \"활동 인원 부족\"으로 표시합니다.",
          "리그는 지역마다 따로입니다. 한국, 대만, 미국, 유럽 길드는 서로 다른 표에서 겨룹니다. 한 지역 안에서는 PvP 서버와 일반 서버 길드가 같은 리그에 들어갑니다.",
          "리그를 옮긴 길드는 순위표에 \"옮겨 옴\"으로 표시하고 오르내림 숫자를 보여 주지 않습니다. 그 주에는 급상승 배지 대상에서도 빠집니다.",
          "등급과 배지도 리그 안에서 매깁니다. 리그 1위, 레벨·업적·명예 1위는 리그마다 한 길드씩(같으면 함께) 나옵니다. 리그에 길드가 적을 때 두 리그를 한 표로 묶는 규칙은 아직 만들지 않았습니다.",
        ],
      },
      en: {
        term: "Leagues",
        short: "Three groups set by the week's active members: 5 to 19 plays in the small league, 20 to 49 in the medium league and 50 or more in the large league.",
        body: [
          "Leagues are set again every week. A guild that was in the medium league last week goes to the small league if it has 19 active members this week. With fewer than 5 active members it isn't in any league and shows as not enough active members.",
          "Each region has its own leagues: guilds in Korea, Taiwan, the Americas and Europe are in separate tables. Within a region, PvP and Normal realm guilds share the leagues.",
          "A guild that changes league shows as moved in the table, without an up or down number, and can't earn the Biggest climb badge that week.",
          "Tiers and badges are also given within a league. The league winner and the top guild in levels, achievements and honor come from each league (ties share). Merging small leagues into one table isn't built yet.",
        ],
      },
      "zh-tw": {
        term: "分組",
        short: "依當週活躍人數分成小型、中型、大型三組：活躍 5～19 人在小型組，20～49 人在中型組，50 人以上在大型組。",
        body: [
          "分組每週重新決定。上週在中型組的公會，本週活躍人數若是 19 人，就會進入小型組。活躍人數不到 5 人時不屬於任何一組，顯示為「活躍人數不足」。",
          "每個地區各自分組：韓國、台灣、美洲、歐洲的公會在不同的表上競賽。同一地區內，PvP 伺服器與一般伺服器的公會在同一組。",
          "換組的公會在排名表上顯示為「移入」，不顯示名次升降，當週也不列入最大躍升徽章。",
          "等級和徽章也是在組內決定。組內第一以及等級、成就、榮譽第一，每組各出一個公會（同分則一起獲得）。組內公會太少時把兩組合成一張表的規則目前還沒有做。",
        ],
      },
    },
  },
  {
    slug: "week-start-roster",
    related: ["active-members", "weekly-reset", "removal-request"],
    links: ["/register/", "/guide/"],
    text: {
      ko: {
        term: "주 시작 명단",
        short: "목요일 08:00(한국 시간) 주가 시작될 때 읽은 길드 명단입니다. 그 주 점수는 이 명단에 있던 10레벨 이상 구성원만 셉니다.",
        body: [
          "주 시작 명단은 그 주 내내 바뀌지 않습니다. 주중에 들어온 길드원은 다음 주 명단부터 들어가고, 주중에 나간 길드원은 그 주가 끝날 때까지 원래 길드 점수로 셉니다.",
          "이렇게 하는 이유는 주중 영입으로 점수를 끌어올리는 것을 막기 위해서입니다. 높은 레벨 캐릭터를 잠깐 데려와 점수를 올리고 내보내는 일이 의미가 없어집니다.",
          "명단에 있어도 주 시작 때 10레벨 미만이면 점수와 활동 인원에 들어가지 않습니다. 공식 API가 10레벨 미만 캐릭터를 돌려주지 않기 때문입니다. 길드 페이지에 이렇게 빠진 인원을 따로 적습니다.",
          "새로 등록한 길드는 등록 뒤 처음 오는 목요일 08:00의 명단부터 씁니다. 그 전에는 길드 찾기와 길드 페이지에 현재 명단 인원만 보여 줍니다.",
        ],
      },
      en: {
        term: "Week-start roster",
        short: "The guild roster read when the week starts, Thursday 08:00 Korea time. Only members on it at level 10 or higher count toward that week's score.",
        body: [
          "The week-start roster doesn't change during the week. Members who join mid-week count from the next week's roster, and members who leave mid-week keep counting for their old guild until the week ends.",
          "This stops guilds from lifting their score with mid-week recruits: bringing in a high-level character for a few days and letting them go again gains nothing.",
          "Members on the roster who are below level 10 when the week starts don't count toward score or active members, because the official API doesn't return characters below level 10. The guild page lists how many were left out this way.",
          "A newly added guild uses the roster from the first Thursday 08:00 after it registers. Until then, Find a guild and the guild page show the current roster size only.",
        ],
      },
      "zh-tw": {
        term: "週初名單",
        short: "每週四 07:00（台灣時間）一週開始時讀取的公會名單。當週分數只計算這份名單中等級 10 以上的成員。",
        body: [
          "週初名單在一週內不會改變。週中加入的成員從下週的名單開始計算，週中退出的成員到該週結束為止都計入原本公會的分數。",
          "這樣做是為了防止靠週中招募拉高分數：短暫找來高等級角色、拿到分數後再讓他離開，並不會有任何效果。",
          "名單中週初時未滿 10 級的成員不計入分數與活躍人數，因為官方 API 查不到 10 級以下的角色。公會頁面會另外列出這樣被排除的人數。",
          "新登記的公會從登記後第一個週四 07:00 的名單開始使用。在那之前，「尋找公會」和公會頁面只顯示目前名單的人數。",
        ],
      },
    },
  },
  {
    slug: "weekly-reset",
    related: ["daily-update", "week-start-roster", "seasons"],
    links: ["/weeks/", "/"],
    text: {
      ko: {
        term: "주간 초기화",
        short: "목요일 08:00(한국 시간)에 한 주가 마감되고 새 주차가 시작되는 순간입니다. 4개 지역이 같은 순간에 바뀝니다.",
        body: [
          "초기화 시각은 지역마다 현지 시간으로 다르게 보입니다. 한국 목요일 08:00, 대만 목요일 07:00, 유럽(중부) 목요일 00:00, 미국 동부 수요일 18:00, 미국 서부 수요일 15:00입니다. 모두 같은 순간입니다.",
          "초기화 때 지난주 순위가 확정되고, 등급과 배지가 정해지고, 영토 지도가 진군합니다. 마감된 주의 결과는 주차별 결과 페이지에 그대로 남고, 이미 마감된 주의 길드 합계는 나중에 바꾸지 않습니다.",
          "새 주차 첫날에는 아직 점수가 없으므로, 첫 갱신이 지나기 전까지 순위표와 길드 페이지가 지난주 최종 결과를 보여 줍니다.",
          "첫 주차는 2026년 11월 19일(목) 08:00에 시작해 11월 26일 08:00에 마감합니다.",
        ],
      },
      en: {
        term: "Weekly reset",
        short: "The moment a week closes and the next one starts: Thursday 08:00 Korea time. All four regions change at the same moment.",
        body: [
          "In local time the reset falls at Thursday 08:00 in Korea, Thursday 07:00 in Taiwan, Thursday 00:00 in Central Europe, Wednesday 18:00 US Eastern and Wednesday 15:00 US Pacific. It's the same moment everywhere.",
          "At the reset last week's ranks become final, tiers and badges are given, and the territory maps march. Closed weeks stay on the past weeks page as they ended, and a guild's totals for a closed week aren't changed later.",
          "The new week has no scores on its first morning, so the rank table and guild pages keep showing last week's final results until the first update.",
          "Week one starts on Thursday, November 19, 2026, at 08:00 Korea time and closes on November 26 at 08:00.",
        ],
      },
      "zh-tw": {
        term: "每週重置",
        short: "一週結算、新的一週開始的時刻：週四 07:00（台灣時間）。四個地區在同一時刻切換。",
        body: [
          "以當地時間來看，重置時間分別是台灣週四 07:00、韓國週四 08:00、歐洲（中部）週四 00:00、美國東部週三 18:00、美國西部週三 15:00。全部是同一時刻。",
          "重置時，上週名次確定、頒發等級與徽章，領土地圖也會進軍。結算後的週次會原樣保留在歷週結果頁面，已結算週次的公會合計之後不會更改。",
          "新的一週第一天還沒有分數，所以在首次更新之前，排名表和公會頁面會繼續顯示上週的最終結果。",
          "第一週在 2026 年 11 月 19 日（週四）07:00（台灣時間）開始，11 月 26 日 07:00 結算。",
        ],
      },
    },
  },
  {
    slug: "daily-update",
    related: ["weekly-reset", "active-members", "removal-request"],
    links: ["/guide/", "/"],
    text: {
      ko: {
        term: "정기 갱신",
        short: "일주일에 두 번, 월요일과 목요일 08:00(한국 시간)에 Battle.net 공개 API로 등록 길드의 명단과 구성원 정보를 읽고, 점수와 순위를 다시 계산해 사이트를 새로 만드는 작업입니다.",
        body: [
          "갱신은 목요일(주간 마감)과 월요일(중간 집계)에 합니다. 길드마다 명단을 읽고, 구성원마다 캐릭터 정보, 업적, PvP 요약을 읽습니다. 그 결과로 점수, 순위, 진영 통계를 다시 계산하고 사이트 전체를 다시 배포합니다.",
          "실시간이 아닌 이유는 API 호출 수와 비용 때문입니다. 블리자드 API는 시간당 호출 수가 정해져 있어 한 번 갱신에 몇 시간이 걸립니다. 그래서 순위표에는 마지막 갱신 시각을 함께 적습니다(한국어는 한국 시간, 영어는 UTC, 중국어는 대만 시간).",
          "게임에 접속 중인 캐릭터와 10레벨 미만 캐릭터는 공식 API에서 조회되지 않습니다. 접속 중이던 캐릭터는 로그아웃한 뒤 다음 갱신 때 반영됩니다. 업적은 달성한 시각으로 세므로 늦게 읽혀도 잃지 않습니다.",
          "갱신 때 캐릭터 제외 요청을 먼저 처리합니다. 저장한 스냅숏은 14일 뒤 지우고, 30일 동안 어느 명단에도 보이지 않은 캐릭터의 정보도 지웁니다.",
        ],
      },
      en: {
        term: "Scheduled update",
        short: "Twice a week, on Monday and Thursday at 08:00 Korea time, registered guilds' rosters and members are read from the public Battle.net API, scores and ranks are worked out again and the site is rebuilt.",
        body: [
          "The update runs on Thursday (the weekly close) and Monday (mid-week standings). It reads each guild's roster, then each member's profile, achievements and PvP summary. From that it works out scores, ranks and faction stats again and redeploys the whole site.",
          "It isn't live because of the number of API calls and the cost. Blizzard's API allows a set number of calls an hour, so one update takes a few hours. The rank table shows when the last update ran (Korea time on Korean pages, UTC on English pages, Taiwan time on Chinese pages).",
          "Characters who are logged in and characters below level 10 can't be read from the official API. A character who was logged in shows up at the next update after logging out. Achievements count by when they were earned, so a late read loses nothing.",
          "Each update handles character removal requests first. Stored snapshots are deleted after 14 days, and data for characters no roster has listed for 30 days is deleted too.",
        ],
      },
      "zh-tw": {
        term: "定期更新",
        short: "每週兩次，在週一與週四 07:00（台灣時間）透過 Battle.net 公開 API 讀取已登記公會的名單與成員資料，重新計算分數與排名並重新產生網站。",
        body: [
          "更新在週四（每週結算）與週一（週中排名）進行。先讀取每個公會的名單，再讀取每位成員的角色資料、成就與 PvP 摘要，然後重新計算分數、排名與陣營統計，並重新部署整個網站。",
          "不做即時更新是因為 API 呼叫次數與成本。暴雪 API 每小時的呼叫次數有上限，一次更新需要數小時。排名表上會一併標示最後更新時間（韓文為韓國時間，英文為 UTC，中文為台灣時間）。",
          "正在遊戲中的角色和 10 級以下的角色無法從官方 API 查詢。原本在線上的角色會在登出後的下次更新時反映。成就以達成時間計算，晚一點讀到也不會遺漏。",
          "每次更新會先處理角色移除申請。儲存的快照在 14 天後刪除，30 天內沒有出現在任何名單上的角色資料也會刪除。",
        ],
      },
    },
  },
  {
    slug: "rulesets",
    related: ["leagues", "territory-map", "removal-request"],
    links: ["/ranks/", "/factions/", "/answers/"],
    text: {
      ko: {
        term: "룰셋 (PvP 서버·일반 서버)",
        short: "길드가 있는 서버 종류입니다. Guild March는 PvP와 일반 두 가지를 받고, 순위는 같은 리그에서 겨루지만 영토 지도와 진영 비교는 룰셋마다 따로입니다.",
        body: [
          "룰셋은 길드를 등록할 때 고릅니다. 점수 산식은 룰셋과 상관없이 같으므로 한 지역의 PvP 서버 길드와 일반 서버 길드는 활동 인원에 따라 같은 소·중·대 리그에 들어갑니다.",
          "영토 지도는 지역과 룰셋마다 한 장씩입니다(예: 한국 PvP, 한국 일반). 같은 지도에 있는 길드끼리만 땅을 넓히고 빼앗습니다. 진영 통계도 룰셋마다 호드와 얼라이언스를 따로 비교합니다.",
          "PvP 서버에서는 명예 킬이 더 쉽게 쌓일 수 있지만, 명예 점수는 캐릭터당 주 10점에서 멈추고 업적에는 상한이 없어 한쪽이 크게 유리하지 않게 했습니다.",
          "룰셋을 잘못 골라 등록했다면 제외 요청 페이지에서 \"길드 정보 정정\"을 골라 길드 이름을 남기면 운영자가 확인한 뒤 고칩니다.",
        ],
      },
      en: {
        term: "Ruleset (PvP and Normal realms)",
        short: "The kind of realm a guild plays on. Guild March takes PvP and Normal. Both share the same leagues, but territory maps and the faction comparison are kept per ruleset.",
        body: [
          "The ruleset is picked when a guild is added. Scoring is the same on either ruleset, so a region's PvP and Normal realm guilds go into the same small, medium and large leagues by active members.",
          "Each region has one territory map per ruleset (for example Korea PvP and Korea Normal), and guilds only claim and take land from guilds on the same map. The faction stats also compare Horde and Alliance separately for each ruleset.",
          "Honorable kills can come easier on PvP realms, but honor points stop at 10 per character a week while achievements have no limit, so neither ruleset gets a large edge.",
          "If the wrong ruleset was picked, choose \"Fix a guild's ruleset or faction\" on the removal request page and leave the guild's name. The site owner fixes it after a check.",
        ],
      },
      "zh-tw": {
        term: "規則（PvP 伺服器・一般伺服器）",
        short: "公會所在的伺服器類型。 Guild March 接受 PvP 與一般兩種，排名在同一組內競賽，但領土地圖與陣營比較依規則分開。",
        body: [
          "規則在登記公會時選擇。兩種規則的計分公式相同，所以同一地區的 PvP 伺服器與一般伺服器公會會依活躍人數進入同樣的小型、中型、大型組。",
          "每個地區依規則各有一張領土地圖（例如韓國 PvP、韓國一般），公會只會在同一張地圖上擴張和奪取土地。陣營統計也依規則分別比較部落與聯盟。",
          "PvP 伺服器上的榮譽擊殺可能比較容易累積，但榮譽分數每個角色每週最多 10 分，而成就沒有上限，所以不會讓某一種規則大幅領先。",
          "如果登記時選錯了規則，請在移除申請頁面選擇「更正公會資料」並留下公會名稱，營運者確認後會更正。",
        ],
      },
    },
  },
  {
    slug: "guild-tiers",
    related: ["leagues", "march", "badges"],
    links: ["/guide/", "/ranks/"],
    text: {
      ko: {
        term: "길드 등급",
        short: "주가 마감될 때 순위에 오른 모든 길드가 리그 안 위치에 따라 받는 9단계 마크입니다. 낮은 쪽부터 깃발병 I·II, 선봉 I·II, 돌파자 I·II, 깃발대장, 성주, 패왕입니다.",
        body: [
          "위치는 (순위 − 0.5) ÷ 리그 길드 수로 구합니다. 이 값이 리그 상위 5% 안이면 패왕, 12% 안이면 성주, 22% 안이면 깃발대장, 34% 안이면 돌파자 II, 46% 안이면 돌파자 I, 58% 안이면 선봉 II, 70% 안이면 선봉 I, 85% 안이면 깃발병 II, 나머지는 깃발병 I입니다. 이 기준 비율은 초안입니다.",
          "순위에서 0.5를 빼는 이유는 길드가 적은 리그의 1위가 곧바로 최상위 등급을 받지 않게 하려는 것입니다. 그래서 패왕은 길드가 11곳 이상인 리그의 1위부터 나옵니다. 대신 리그 1위는 리그가 아무리 작아도 최소 성주를 받습니다(2026-11-08 결정).",
          "순위에 오르기만 하면 리그 꼴찌도 깃발병 I을 받습니다. 공동 순위는 같은 등급입니다. 진행 중인 주에는 지난주 등급을 보여 줍니다.",
          "등급은 영토 지도의 진군 횟수를 정합니다. 패왕 4번, 성주와 깃발대장 3번, 돌파자 I·II와 선봉 II 2번, 선봉 I과 깃발병 I·II 1번이고, 여기에 지도 배수를 곱합니다.",
        ],
      },
      en: {
        term: "Guild tiers",
        short: "Nine marks every ranked guild gets when a week closes, from where it finished in its league. From the bottom: Banner Bearer I and II, Vanguard I and II, Breaker I and II, Banner Captain, Castellan and Overlord.",
        body: [
          "Position is (rank − 0.5) ÷ guilds in the league. Within the top 5% of the league is Overlord, 12% Castellan, 22% Banner Captain, 34% Breaker II, 46% Breaker I, 58% Vanguard II, 70% Vanguard I, 85% Banner Bearer II, and the rest Banner Bearer I. These cut-offs are a draft.",
          "Half a place is taken off the rank so that the winner of a small league doesn't go straight to the top tier: Overlord starts with the winner of a league of 11 guilds or more. In return, a league winner gets at least Castellan however small the league is (decided November 8, 2026).",
          "Any ranked guild gets at least Banner Bearer I, even the last in its league. Guilds sharing a rank share a tier. During a week, last week's tier is shown.",
          "The tier sets a guild's marches on the territory map: 4 for Overlord, 3 for Castellan and Banner Captain, 2 for Breaker I and II and Vanguard II, and 1 for Vanguard I and Banner Bearer I and II, multiplied by the map's multiplier.",
        ],
      },
      "zh-tw": {
        term: "公會等級",
        short: "每週結算時，所有上榜公會依在組內的位置獲得的 9 個等級標誌。由低到高為旗手 I・II、先鋒 I・II、破陣者 I・II、旗隊長、城主、霸王。",
        body: [
          "位置以（名次 − 0.5）÷ 組內公會數計算。落在組內前 5% 為霸王，12% 為城主，22% 為旗隊長，34% 為破陣者 II，46% 為破陣者 I，58% 為先鋒 II，70% 為先鋒 I，85% 為旗手 II，其餘為旗手 I。這些比例是草案。",
          "名次減去 0.5，是為了讓小組的第一名不會直接拿到最高等級：霸王從 11 個公會以上分組的第一名開始出現。相對地，組內第一不論分組多小，至少會獲得城主（2026 年 11 月 8 日決定）。",
          "只要上榜，即使是組內最後一名也會獲得旗手 I。並列名次獲得相同等級。進行中的一週顯示上週的等級。",
          "等級決定領土地圖上的進軍次數：霸王 4 次，城主與旗隊長 3 次，破陣者 I・II 與先鋒 II 2 次，先鋒 I 與旗手 I・II 1 次，再乘上地圖倍數。",
        ],
      },
    },
  },
  {
    slug: "badges",
    related: ["guild-tiers", "leagues", "seasons"],
    links: ["/guide/", "/weeks/"],
    text: {
      ko: {
        term: "배지",
        short: "주가 마감될 때 리그마다 주는 표시입니다. 주간 1·2·3위, 3주 연속 상위권, 급상승, 첫 순위, 레벨·업적·명예 1위의 9가지가 있습니다.",
        body: [
          "주간 1·2·3위는 리그 1~3위로 주를 마감한 길드가 받습니다. 3주 연속 상위권은 그 주와 앞선 두 주에 모두 리그 3위 안에 든 길드가 받습니다.",
          "급상승은 지난주보다 2계단 이상 올라 리그에서 가장 크게 오른 길드가 받습니다. 리그를 옮긴 길드는 대상이 아닙니다. 첫 순위는 처음으로 순위에 오른 길드가 받으며, 모두가 처음인 첫 주차에는 주지 않습니다.",
          "레벨·업적·명예 1위는 리그 안에서 그 항목의 인원당 점수가 가장 높은 길드가 받습니다. 레벨 점수에는 60레벨 달성 점수도 들어갑니다.",
          "가장 좋은 값이 같은 길드가 여럿이면 모두 받습니다. 배지 규칙은 임시 규칙이며, 배지는 길드 페이지의 주차별 기록과 주차별 결과 페이지에 남습니다. 시즌이 끝날 때 줄 영토 칭호는 따로 준비 중입니다.",
        ],
      },
      en: {
        term: "Badges",
        short: "Marks given in each league when a week closes. There are nine: first, second and third this week, top three three weeks running, biggest climb, first time ranked, and top in levels, achievements and honor.",
        body: [
          "First, second and third this week go to the guilds that finish the week first to third in their league. Top three, three weeks running goes to a guild that was in its league's top three this week and the two weeks before.",
          "Biggest climb goes to the guild that rose the most in its league, by at least 2 places since last week; guilds that changed league can't get it. First time ranked goes to a guild ranked for the first time, and isn't given in week one, when everyone is new.",
          "Top in levels, achievements and honor go to the guild with the most points per active member in that part of the score within its league. Level points include the bonus for reaching level 60.",
          "When several guilds share the best value, they all get the badge. Badge rules are a draft. Badges stay in the guild page's week-by-week record and on the past weeks pages. The territory titles given at the end of a season are separate and still being prepared.",
        ],
      },
      "zh-tw": {
        term: "徽章",
        short: "每週結算時各組頒發的標誌，共 9 種：本週第一・第二・第三、連續三週前三、最大躍升、首次上榜，以及等級・成就・榮譽第一。",
        body: [
          "本週第一・第二・第三頒給以組內第 1～3 名結束一週的公會。連續三週前三頒給本週與前兩週都在組內前三的公會。",
          "最大躍升頒給比上週上升至少 2 名、且是組內上升最多的公會；換組的公會不列入。首次上榜頒給第一次上榜的公會，所有公會都是首次參加的第一週不頒發。",
          "等級・成就・榮譽第一頒給組內該項目每人分數最高的公會。等級分數包含達到 60 級的加分。",
          "最佳數值相同的公會有好幾個時，全部都會獲得。徽章規則是暫定規則。徽章會留在公會頁面的歷週紀錄與歷週結果頁面上。賽季結束時頒發的領土稱號另外準備中。",
        ],
      },
    },
  },
  {
    slug: "territory-map",
    related: ["cells", "march", "region-lord", "seasons"],
    links: ["/map/", "/answers/"],
    text: {
      ko: {
        term: "영토 지도",
        short: "지역과 룰셋마다 한 장씩 있는 땅따먹기 지도입니다. 주가 마감될 때마다 순위 길드가 등급만큼 진군해 땅을 넓히고 빼앗으며, 4주 시즌마다 비웁니다.",
        body: [
          "지도는 AI로 그린 비공식 팬아트 위에 1,994칸을 나눠 만들었고, 칸들을 지형에 따라 지역 37곳으로 묶었습니다. 지도 모양은 시즌마다 같아서 \"우리 땅\" 위치를 기억할 수 있습니다.",
          "지도는 지역과 룰셋마다 따로입니다(한국 PvP, 한국 일반 등 8장). 리그와 진영은 지도에서 나누지 않으므로 어느 길드든 어디나 차지할 수 있습니다.",
          "진행 순서는 이렇습니다. 처음 순위에 오른 길드가 수도를 받고, 등급이 높은 길드부터 한 번씩 돌아가며 맞닿은 빈칸을 차지하고, 빈칸이 없으면 자기보다 그 주 등급이 낮은 길드의 칸을 빼앗습니다. 둘러싸이면 원정을 갑니다.",
          "영토는 명예만 줍니다. 땅이 넓어도 점수, 리그, 등급, 진군 횟수는 바뀌지 않습니다. 영토 규칙은 초안입니다.",
        ],
      },
      en: {
        term: "Territory map",
        short: "A land-grab map for each region and ruleset. Each time a week closes, ranked guilds march by their tier to claim and take land, and the map is cleared every four-week season.",
        body: [
          "The map is 1,994 cells laid over unofficial AI-made fan art, grouped into 37 regions along the terrain. Its shape is the same every season, so guilds can remember where their land is.",
          "There is one map per region and ruleset (Korea PvP, Korea Normal and so on, 8 in all). Leagues and factions aren't split on the map, so any guild can hold land anywhere.",
          "A week's march goes like this: a guild ranked for the first time gets a capital; then guilds take turns, highest tier first, claiming neighbouring empty cells, and when none are left, taking cells from guilds with a lower tier that week. A guild that's boxed in goes on an expedition.",
          "Territory is honor only. More land doesn't change scores, leagues, tiers or marches. The territory rules are a draft.",
        ],
      },
      "zh-tw": {
        term: "領土地圖",
        short: "每個地區與規則各一張的搶地地圖。每週結算時，上榜公會依等級進軍擴張與奪取土地，地圖每四週一個賽季清空一次。",
        body: [
          "地圖是在以 AI 繪製的非官方同人作品上切出 1,994 格，再依地形把格子分成 37 個地區。每個賽季的地圖形狀相同，公會可以記住「我們的土地」在哪裡。",
          "每個地區依規則各有一張地圖（韓國 PvP、韓國一般等共 8 張）。地圖上不分組，也不分陣營，任何公會都能佔領任何地方。",
          "一週的進軍順序如下：第一次上榜的公會獲得首都；接著從等級高的公會開始輪流佔領相鄰的無主之地，沒有空地時，奪取當週等級比自己低的公會的土地。被包圍的公會會出發遠征。",
          "領土只帶來榮譽。土地再多也不會改變分數、分組、等級或進軍次數。領土規則是草案。",
        ],
      },
    },
  },
  {
    slug: "cells",
    related: ["territory-map", "region-lord", "march"],
    links: ["/map/"],
    text: {
      ko: {
        term: "칸",
        short: "영토 지도의 가장 작은 땅 단위입니다. 지도 한 장은 1,994칸이고, 길드의 영토 크기는 가진 칸 수로 셉니다.",
        body: [
          "칸은 해안선을 따라 잘린 자연스러운 모양이고, 한 칸은 평균 5~6칸과 맞닿아 있습니다. 진군은 한 번에 한 칸씩 차지하거나 빼앗습니다.",
          "칸 수가 고정이라 길드가 많을수록 길드당 땅이 줄어듭니다. 그래서 진군 횟수에 길드 수에 맞춘 배수를 곱해 지도가 2~3주 안에 차게 합니다.",
          "칸들은 지역 37곳으로 묶여 있고, 지역 하나는 22~111칸입니다. 한 지역에서 칸의 절반을 넘게 가지면 그 지역의 영주가 됩니다.",
          "길드 페이지, 길드 찾기, 순위표 툴팁에 마지막으로 마감된 주 기준 칸 수를 보여 줍니다. 진영 통계의 \"지도 영토\"는 진영별 등록 길드가 가진 칸 수의 합입니다.",
        ],
      },
      en: {
        term: "Cells",
        short: "The smallest unit of land on the territory map. Each map has 1,994 cells, and a guild's territory is measured by how many it holds.",
        body: [
          "Cells are natural shapes cut along the coastlines, and each touches 5 to 6 others on average. Each march step claims or takes one cell.",
          "The number of cells is fixed, so the more guilds there are, the less land each gets. Marches are multiplied to suit the number of guilds so the map fills in two or three weeks.",
          "Cells are grouped into 37 regions of 22 to 111 cells each. Holding more than half the cells of a region makes a guild its lord.",
          "Guild pages, Find a guild and the rank table tooltip show the cells held when the last week closed. Map land in the faction stats is the sum of cells held by each faction's registered guilds.",
        ],
      },
      "zh-tw": {
        term: "格",
        short: "領土地圖上最小的土地單位。一張地圖有 1,994 格，公會的領土大小以擁有的格數計算。",
        body: [
          "格子沿著海岸線切成自然的形狀，每格平均與 5～6 格相鄰。每次進軍佔領或奪取一格。",
          "格數是固定的，公會越多，每個公會分到的土地就越少。因此進軍次數會依公會數乘上倍數，讓地圖在兩三週內填滿。",
          "格子分屬 37 個地區，每個地區 22～111 格。在一個地區擁有超過一半的格數，就會成為該地區的領主。",
          "公會頁面、「尋找公會」與排名表的提示框會顯示最近一次結算時擁有的格數。陣營統計中的「地圖領土」是各陣營已登記公會擁有的格數總和。",
        ],
      },
    },
  },
  {
    slug: "capital",
    related: ["territory-map", "loss-cap", "seasons"],
    links: ["/map/"],
    text: {
      ko: {
        term: "수도",
        short: "길드가 한 시즌에 처음 순위에 오를 때 받는 영토 지도의 첫 칸입니다. 수도는 누구에게도 빼앗기지 않습니다.",
        body: [
          "수도 자리는 다른 길드의 수도들과 가장 먼 빈칸으로 정합니다. 그 시즌의 첫 수도는 지도 가장자리 해안 쪽 칸에서 시작합니다. 서로 멀리 떨어져 시작해야 처음 몇 주가 빈 땅 넓히기로 진행됩니다.",
          "진군할 때 빈칸이 여럿이면 수도에서 가까운 칸부터 차지하므로 땅이 수도를 중심으로 한 덩어리로 자랍니다.",
          "수도는 그 주 순위에 들지 못해도, 손실 상한과 상관없이 빼앗기지 않습니다. 그래서 땅을 다 잃어도 다음에 순위에 오르면 수도에서 다시 시작할 수 있습니다.",
          "길드를 찾을 수 없게 되거나 길드 제외 요청이 처리되면 수도를 포함한 그 길드의 땅이 모두 빈칸이 됩니다. 시즌이 끝나 지도를 비우면 다음 시즌에 수도를 새로 받습니다.",
        ],
      },
      en: {
        term: "Capital",
        short: "A guild's first cell on the territory map, given the first time it's ranked in a season. A capital can never be taken.",
        body: [
          "A capital goes on the empty cell farthest from every other guild's capital, and a season's first capital starts on a cell at the coast. Starting far apart means the first weeks are spent spreading into empty land.",
          "When several empty cells are in reach, a guild claims the one nearest its capital first, so its land grows as one piece around the capital.",
          "A capital can't be taken, even when the guild isn't ranked that week and whatever the loss cap. A guild that loses all its other land can start again from its capital the next time it's ranked.",
          "If a guild can no longer be found, or a request to remove it is carried out, all its land including the capital becomes empty. When the season ends and the map is cleared, guilds get new capitals the next season.",
        ],
      },
      "zh-tw": {
        term: "首都",
        short: "公會在一個賽季中第一次上榜時，在領土地圖上獲得的第一格。首都永遠不會被奪走。",
        body: [
          "首都設在離其他公會首都最遠的空格；該賽季的第一個首都從地圖邊緣靠海的格子開始。彼此分散起步，前幾週就會以擴張無主之地為主。",
          "進軍時若有多個空格可選，會先佔領離首都最近的格子，所以土地會以首都為中心連成一塊。",
          "即使當週沒有上榜，也不論損失上限，首都都不會被奪走。所以就算失去其他所有土地，下次上榜時也能從首都重新開始。",
          "公會找不到了，或公會移除申請被處理時，包括首都在內的所有土地都會變成無主之地。賽季結束、地圖清空後，下個賽季會重新獲得首都。",
        ],
      },
    },
  },
  {
    slug: "march",
    related: ["guild-tiers", "expedition", "loss-cap", "cells"],
    links: ["/map/", "/guide/"],
    text: {
      ko: {
        term: "진군",
        short: "주가 마감될 때 순위 길드가 영토 지도에서 칸을 차지하거나 빼앗는 움직임입니다. 진군 횟수는 그 주 등급과 지도 배수로 정합니다.",
        body: [
          "기본 진군 횟수는 패왕 4번, 성주와 깃발대장 3번, 돌파자 I·II와 선봉 II 2번, 선봉 I과 깃발병 I·II 1번입니다. 여기에 배수를 곱합니다. 배수는 칸 수 ÷ (5.25 × 그 주 순위 길드 수)를 반올림한 값이고 최소 1입니다.",
          "배수는 길드가 몇 곳이든 지도가 2~3주 만에 차도록 정한 값입니다. 순위 길드가 9곳이면 42배라서 패왕은 168칸, 깃발병은 42칸을 진군하고, 100곳이면 4배입니다.",
          "등급이 높은 길드부터, 같으면 먼저 등록한 길드부터 한 번씩 돌아가며 진군합니다. 한 길드가 연달아 다 쓰지 않게 하려는 것입니다.",
          "목표는 자기 땅과 맞닿은 칸입니다. 빈칸을 먼저, 그중 수도에서 가까운 칸부터 차지합니다. 빈칸이 없으면 맞닿은 칸 중 그 주 등급이 자기보다 낮은 길드의 칸을 빼앗고, 그중 가장 약한 길드부터 고릅니다. 갈 곳이 없으면 원정을 갑니다.",
          "그 주 순위에 들지 못한 길드는 진군하지 않고 등급 0으로 취급되어, 수도를 빼고 누구에게나 땅을 빼앗길 수 있습니다.",
        ],
      },
      en: {
        term: "March",
        short: "How ranked guilds claim or take cells on the territory map when a week closes. A guild's marches come from its tier that week and the map's multiplier.",
        body: [
          "Base marches are 4 for Overlord, 3 for Castellan and Banner Captain, 2 for Breaker I and II and Vanguard II, and 1 for Vanguard I and Banner Bearer I and II. They're multiplied by cells ÷ (5.25 × ranked guilds that week), rounded, and at least 1.",
          "The multiplier is set so the map fills in two or three weeks however many guilds there are. With 9 ranked guilds it's 42, so an Overlord marches 168 cells and a Banner Bearer 42; with 100 guilds it's 4.",
          "Guilds take turns one step at a time, highest tier first, and earlier registration first among equals, so no guild spends all its marches in one go.",
          "Targets are cells next to a guild's own land: empty cells first, nearest the capital first. When none are left, it takes neighbouring cells from guilds with a lower tier that week, weakest first. With nowhere to go, it goes on an expedition.",
          "Guilds that aren't ranked that week don't march. They count as tier 0, so anyone can take their land except the capital.",
        ],
      },
      "zh-tw": {
        term: "進軍",
        short: "每週結算時，上榜公會在領土地圖上佔領或奪取格子的行動。進軍次數由當週等級與地圖倍數決定。",
        body: [
          "基本進軍次數為霸王 4 次，城主與旗隊長 3 次，破陣者 I・II 與先鋒 II 2 次，先鋒 I 與旗手 I・II 1 次，再乘上倍數。倍數是格數 ÷（5.25 × 當週上榜公會數）四捨五入的值，最少為 1。",
          "倍數的設定是為了不論公會多少，地圖都能在兩三週內填滿。上榜公會 9 個時是 42 倍，霸王進軍 168 格，旗手 42 格；100 個公會時是 4 倍。",
          "公會從等級高的開始，同等級時從先登記的開始，每次一步輪流進軍，避免一個公會一口氣用完所有次數。",
          "目標是與自己土地相鄰的格子：先選空格，空格中先選離首都近的。沒有空格時，奪取相鄰且當週等級比自己低的公會的格子，從最弱的公會開始。無處可去時就出發遠征。",
          "當週沒有上榜的公會不會進軍，等級視為 0，除了首都以外的土地任何人都能奪取。",
        ],
      },
    },
  },
  {
    slug: "expedition",
    related: ["march", "capital", "loss-cap"],
    links: ["/map/"],
    text: {
      ko: {
        term: "원정",
        short: "자기 땅과 맞닿은 칸에 차지하거나 빼앗을 곳이 없을 때, 지도 어디든 갈 수 있는 곳으로 진군하는 것입니다.",
        body: [
          "진군은 보통 맞닿은 칸으로만 갑니다. 그런데 더 강한 길드에 둘러싸이거나 주변이 모두 손실 상한에 닿은 땅이면 갈 곳이 없어집니다. 원정은 이런 길드가 그 주에 멈추지 않게 하려는 규칙입니다.",
          "원정 목표는 지도 전체에서 고릅니다. 고르는 기준은 보통 진군과 같아서, 빈칸을 먼저 수도에서 가까운 순서로 고르고, 빈칸이 없으면 그 주 등급이 자기보다 낮은 길드의 칸 중 가장 약한 길드의 칸을 고릅니다.",
          "원정으로 얻은 칸은 본래 땅과 떨어진 섬처럼 생길 수 있습니다. 다음 진군부터는 그 칸과 맞닿은 칸도 목표가 됩니다.",
          "원정할 곳도 없으면 그 길드의 남은 진군은 그 주에 쓰이지 않습니다. 지도 페이지의 주차 기록에서 원정 횟수는 따로 보여 주지 않습니다.",
        ],
      },
      en: {
        term: "Expedition",
        short: "A march to anywhere on the map, taken when no cell next to a guild's own land can be claimed or taken.",
        body: [
          "Marches normally only reach neighbouring cells. A guild boxed in by stronger guilds, or surrounded by land that has hit its loss cap, has nowhere to go. Expeditions keep such a guild moving that week.",
          "The target is chosen from the whole map by the usual order: empty cells first, nearest the capital first, then cells of the weakest guild with a lower tier that week.",
          "Land won on an expedition can sit apart from the guild's main land like an island. From the next step on, cells next to it become targets too.",
          "If there's nowhere to go even on an expedition, the guild's remaining marches go unused that week. The map page's week notes don't list expeditions separately.",
        ],
      },
      "zh-tw": {
        term: "遠征",
        short: "與自己土地相鄰的格子都無法佔領或奪取時，改往地圖上任何可去之處進軍。",
        body: [
          "進軍通常只會前往相鄰的格子。但被更強的公會包圍，或周圍的土地都已達到損失上限時，就會無處可去。遠征是讓這樣的公會當週不會停下的規則。",
          "遠征目標從整張地圖中挑選，順序與一般進軍相同：先選空格，從離首都近的開始；沒有空格時，選當週等級比自己低的公會中最弱的那個的格子。",
          "遠征得到的格子可能像孤島一樣與本來的土地分開。從下一步開始，與它相鄰的格子也會成為目標。",
          "連遠征都無處可去時，該公會剩下的進軍次數當週就不會使用。地圖頁面的週次紀錄不會另外顯示遠征次數。",
        ],
      },
    },
  },
  {
    slug: "region-lord",
    related: ["territory-map", "cells", "seasons"],
    links: ["/map/", "/ranks/"],
    text: {
      ko: {
        term: "지역 영주",
        short: "주가 마감될 때 영토 지도의 한 지역에서 칸의 절반을 넘게 가진 길드가 받는 칭호입니다. 예: \"불타는 산의 영주\".",
        body: [
          "지도에는 지형을 따라 나눈 지역 37곳이 있고, 지역마다 22~111칸입니다. 진군이 끝난 뒤 한 지역에서 칸의 절반을 넘게(정확히 절반은 아님) 가진 길드가 그 지역의 영주가 됩니다. 그런 길드가 없으면 영주도 없습니다.",
          "지역 이름은 실제 게임 지역 이름이 아니라 그림에 보이는 지형으로 붙였습니다. 팬아트 지도의 해안선이 실제 아제로스와 정확히 맞지 않기 때문입니다.",
          "영주 칭호는 길드 페이지에 다스리는 지역 목록으로, 길드 찾기와 순위표에 \"지역 영주 n곳\"으로 보입니다. 지도를 멀리서 보면 지역 이름 아래에 영주 길드 이름을 적습니다.",
          "영주는 매주 다시 정해집니다. 땅을 빼앗겨 절반 아래로 내려가면 칭호도 사라집니다. 칭호는 명예일 뿐 점수와 리그에는 영향이 없습니다.",
        ],
      },
      en: {
        term: "Region lord",
        short: "A title for the guild holding more than half the cells of a territory map region when a week closes, such as Lord of Burning Mountain.",
        body: [
          "The map has 37 regions drawn along the terrain, each 22 to 111 cells. After the march, a guild holding more than half the cells of a region (exactly half isn't enough) becomes its lord. If no guild does, the region has no lord.",
          "Regions are named after what the painting shows, not after real game zones, because the fan-art coastlines don't match Azeroth closely enough for zone names to land in the right place.",
          "Lordships show on the guild page as a list of regions ruled, and in Find a guild and the rank table as Lord of n regions. Zoomed out, the map writes the lord's name under the region's name.",
          "Lords are settled again every week: a guild that drops to half or less loses the title. Titles are honor only and don't change scores or leagues.",
        ],
      },
      "zh-tw": {
        term: "地區領主",
        short: "每週結算時，在領土地圖的一個地區擁有超過一半格數的公會獲得的稱號，例如「燃燒之山領主」。",
        body: [
          "地圖依地形分成 37 個地區，每個地區 22～111 格。進軍結束後，在一個地區擁有超過一半格數（剛好一半不算）的公會就成為該地區的領主。沒有這樣的公會時，該地區就沒有領主。",
          "地區名稱是依畫中看得到的地形命名，而不是遊戲中的實際地區名稱，因為同人地圖的海岸線與真正的艾澤拉斯並不完全吻合。",
          "領主稱號會在公會頁面以統治地區列表顯示，在「尋找公會」與排名表顯示為「地區領主 n 處」。把地圖拉遠時，地區名稱下方會寫上領主公會的名字。",
          "領主每週重新決定：土地被奪走、降到一半以下時，稱號也會消失。稱號只是榮譽，不影響分數與分組。",
        ],
      },
    },
  },
  {
    slug: "loss-cap",
    related: ["march", "capital", "expedition"],
    links: ["/map/"],
    text: {
      ko: {
        term: "손실 상한",
        short: "한 길드가 한 주에 영토 지도에서 빼앗길 수 있는 땅의 한도입니다. 진군 전에 가진 칸의 절반(내림)까지입니다.",
        body: [
          "진군을 시작하기 전에 길드마다 가진 칸 수를 세고, 그 절반을 내림한 수까지만 그 주에 빼앗길 수 있습니다. 상한에 닿은 길드의 칸은 그 주에 더는 누구도 빼앗을 수 없습니다.",
          "예를 들어 200칸을 가진 길드는 한 주에 최대 100칸을 잃습니다. 3칸이면 1칸까지, 수도 1칸만 있으면 잃을 것이 없습니다.",
          "이 규칙은 한 주 성적이 나빴다고 땅이 한꺼번에 사라지지 않게 하려고 2026년 11월 8일에 정했습니다. 먼저 앞선 길드가 모든 것을 가져가는 판이 되지 않도록, 땅을 지킨 길드도 다시 반격할 기회를 남깁니다.",
          "상한은 빼앗기는 칸에만 적용됩니다. 길드를 찾을 수 없게 되거나 제외 요청이 처리되면 그 길드의 땅은 상한과 상관없이 모두 빈칸이 됩니다.",
        ],
      },
      en: {
        term: "Loss cap",
        short: "The most land a guild can lose on the territory map in one week: half the cells it held before the march, rounded down.",
        body: [
          "Before the march starts, each guild's cells are counted, and it can lose at most half of them, rounded down, that week. Once a guild hits its cap, nobody can take any more of its cells that week.",
          "For example, a guild holding 200 cells loses at most 100 in a week. One with 3 cells can lose 1, and one with only its capital has nothing to lose.",
          "The cap was decided on November 8, 2026, so that one bad week doesn't wipe out a guild's land. It keeps the map from becoming a game where whoever gets ahead first takes everything, and leaves the losing side room to strike back.",
          "The cap only applies to cells taken by other guilds. If a guild can no longer be found or a request to remove it is carried out, all its land becomes empty regardless of the cap.",
        ],
      },
      "zh-tw": {
        term: "損失上限",
        short: "一個公會一週內在領土地圖上最多會失去的土地：進軍前擁有格數的一半（無條件捨去）。",
        body: [
          "進軍開始前先計算每個公會擁有的格數，當週最多只會失去其中一半（無條件捨去）。達到上限的公會，當週任何人都不能再奪取它的格子。",
          "例如擁有 200 格的公會一週最多失去 100 格。擁有 3 格的可能失去 1 格，只有首都 1 格的公會則沒有可失去的土地。",
          "這條規則在 2026 年 11 月 8 日決定，目的是不讓一週表現不好就讓土地一次消失。避免地圖變成先領先的公會拿走一切，也給落後的一方留下反擊的機會。",
          "上限只適用於被其他公會奪走的格子。公會找不到了或移除申請被處理時，不論上限，該公會的土地都會全部變成無主之地。",
        ],
      },
    },
  },
  {
    slug: "seasons",
    related: ["territory-map", "region-lord", "badges"],
    links: ["/map/", "/weeks/"],
    text: {
      ko: {
        term: "시즌",
        short: "영토 지도의 한 판입니다. 4주가 한 시즌이고, 시즌이 끝나면 지도를 비우고 처음부터 다시 시작합니다. 첫 시즌은 2026년 12월 17일 08:00(한국 시간)에 마감합니다.",
        body: [
          "첫 시즌은 2026년 11월 19일에 시작한 1~4주차입니다. 시즌 안에서는 주마다 진군이 이어지고, 시즌이 바뀌면 모든 칸과 수도가 빈칸으로 돌아갑니다.",
          "시즌을 4주로 둔 이유는 지도가 보통 2~3주 만에 차고, 그 뒤로는 빼앗기 위주가 되기 때문입니다. 정해진 기간마다 지도를 비워야 새로 들어온 길드도 처음부터 겨룰 수 있습니다.",
          "시즌이 끝나면 지도마다 시즌 영토 1위, 대륙의 패자, 철옹성, 역전 칭호를 줄 계획입니다. 기준은 초안이고 첫 시즌 마감 전에 확정하며, 실제 지급 계산은 아직 만들지 않았습니다.",
          "점수, 리그, 등급은 시즌과 상관없이 매주 따로 매깁니다. 시즌은 영토 지도와 영토 칭호에만 해당합니다.",
        ],
      },
      en: {
        term: "Seasons",
        short: "One round of the territory map. A season is four weeks; when it ends the map is cleared and starts over. The first season closes on December 17, 2026, at 08:00 Korea time.",
        body: [
          "The first season is weeks 1 to 4, starting November 19, 2026. Within a season the marches carry on week to week; when a new season starts, every cell and capital goes back to empty.",
          "Seasons are four weeks because the map usually fills in two or three weeks and is mostly about taking land after that. Clearing it on a fixed schedule lets newly added guilds compete from the start.",
          "At the end of a season, each map is planned to give out Season land leader, Continent ruler, Unbroken hold and Comeback titles. The thresholds are a draft to be settled before the first season ends, and the payout isn't built yet.",
          "Scores, leagues and tiers are worked out every week regardless of seasons. Seasons only apply to the territory map and its titles.",
        ],
      },
      "zh-tw": {
        term: "賽季",
        short: "領土地圖的一輪。一個賽季為四週，結束後清空地圖重新開始。第一個賽季在 2026 年 12 月 17 日 07:00（台灣時間）結束。",
        body: [
          "第一個賽季是從 2026 年 11 月 19 日開始的第 1～4 週。賽季內每週的進軍會延續下去；新賽季開始時，所有格子與首都都會回到無主狀態。",
          "賽季定為四週，是因為地圖通常兩三週就會填滿，之後主要是互相奪取。定期清空地圖，新加入的公會也能從頭開始競爭。",
          "賽季結束時，每張地圖預計頒發賽季領土第一、大陸霸主、鐵壁、逆轉等稱號。標準是草案，會在第一個賽季結束前確定，實際的頒發計算還沒有做。",
          "分數、分組與等級不論賽季，每週分別計算。賽季只適用於領土地圖與領土稱號。",
        ],
      },
    },
  },
  {
    slug: "removal-request",
    related: ["daily-update", "rulesets", "week-start-roster"],
    links: ["/opt-out/", "/guide/"],
    text: {
      ko: {
        term: "제외 요청",
        short: "길드나 캐릭터를 순위와 길드 페이지에서 빼거나, 잘못 등록된 길드의 룰셋·진영을 고쳐 달라는 요청입니다. 이름만 받고 연락처는 받지 않습니다.",
        body: [
          "캐릭터 하나를 빼는 요청은 본인의 정보에 관한 것이라 다음 갱신(월·목요일 08:00)에 자동으로 처리합니다. 저장한 캐릭터 정보를 지우고, 이후 명단에서도 그 캐릭터를 건너뜁니다. 아직 저장되지 않은 캐릭터도 처음 보일 때부터 건너뜁니다.",
          "길드 전체를 빼는 요청과 길드 정보 정정은 운영자가 확인한 뒤 처리합니다. 로그인이 없어 누구나 요청할 수 있으므로, 남의 길드를 지우지 못하게 하려는 것입니다.",
          "제외된 길드는 다시 등록할 수 없고, 영토 지도의 땅은 모두 빈칸이 됩니다.",
          "이미 마감된 주의 길드 합계는 바꾸지 않습니다. 제외는 다음 갱신부터 적용됩니다.",
        ],
      },
      en: {
        term: "Removal request",
        short: "A request to take a guild or character off the ranks and guild pages, or to fix a guild registered with the wrong ruleset or faction. Only a name is needed, never contact details.",
        body: [
          "A request to remove one character is about that person's own data, so it's applied automatically at the next update (Monday or Thursday, 08:00 Korea time). The stored character data is deleted and later rosters skip the character. A character not stored yet is skipped from the moment it first shows up.",
          "Requests to remove a whole guild, and fixes to a guild's details, are handled after the site owner checks them. There are no logins, so anyone can ask, and this stops anyone from removing a rival's guild.",
          "A removed guild can't be added again, and its land on the territory map becomes empty.",
          "Totals for weeks that already closed stay as they were. A removal applies from the next update.",
        ],
      },
      "zh-tw": {
        term: "移除申請",
        short: "將公會或角色從排名與公會頁面移除，或更正登記錯誤的公會規則・陣營的申請。只收名稱，不收聯絡方式。",
        body: [
          "移除單一角色的申請涉及本人的資料，所以會在下次更新（週一或週四 07:00，台灣時間）時自動處理：刪除已儲存的角色資料，之後的名單也會略過這個角色。尚未儲存的角色，從第一次出現時就會被略過。",
          "移除整個公會的申請與公會資料更正，會由營運者確認後處理。因為不需要登入、任何人都能申請，這是為了防止有人刪除別人的公會。",
          "被移除的公會無法再次登記，它在領土地圖上的土地也會全部變成無主之地。",
          "已結算週次的公會合計不會更改。移除從下次更新開始生效。",
        ],
      },
    },
  },
];

export const termBySlug = (slug: string) => terms.find((t) => t.slug === slug) ?? null;
