// More questions and answers (R-25), same shape and rules as lib/answers.ts
import type { Answer } from "./answers.ts";

export const extraAnswers: Answer[] = [
  {
    slug: "guild-not-found",
    updated: "2026-11-24",
    related: ["/register/", "/guilds/"],
    text: {
      ko: {
        title: "등록할 때 길드를 찾지 못했다고 나와요",
        summary: "지역이 맞는지, 이름이 게임에 표시되는 그대로인지 먼저 확인해 주세요. 공식 API가 그 지역에서 그 이름의 길드를 돌려주지 않으면 찾을 수 없다고 나옵니다. 10레벨 미만 캐릭터만 있는 길드도 API에서 보이지 않습니다.",
        sections: [
          { h: "길드 이름은 어떻게 찾나요?", p: [
            "입력한 이름을 소문자로 바꾸고, 띄어쓰기를 하이픈(-)으로 바꾼 이름과 입력한 그대로의 이름 두 가지로 Battle.net 공개 API에 길드를 찾습니다. 대소문자는 상관없습니다.",
            "길드 이름은 2~24자여야 합니다. 이보다 짧거나 길면 찾기 전에 입력값 확인 안내가 나옵니다.",
          ] },
          { h: "길드를 왜 찾지 못하나요?", p: [
            "지역을 잘못 골랐을 때입니다. 한국, 대만, 미국, 유럽은 서로 다른 API에서 찾으므로 길드가 있는 지역을 골라야 합니다.",
            "철자가 다를 때입니다. 비슷한 글자나 띄어쓰기 위치가 다르면 다른 이름으로 봅니다.",
            "길드원이 모두 10레벨 미만일 때입니다. 공식 API는 10레벨 미만 캐릭터를 돌려주지 않아 길드도 찾을 수 없습니다. 길드원 한 명이라도 10레벨을 넘긴 뒤 다시 시도해 주세요.",
          ] },
          { h: "다른 안내 문구는 무슨 뜻인가요?", p: [
            "Battle.net이 응답하지 않으면 찾지 못함이 아니라 \"지금은 등록할 수 없습니다\"가 나옵니다. 잠시 뒤 다시 시도하면 됩니다.",
            "제외 요청으로 빠진 길드는 다시 등록할 수 없다는 안내가 따로 나옵니다.",
          ] },
        ],
      },
      en: {
        title: "Registration says our guild can't be found",
        summary: "Check the region first, then that the name is exactly as it appears in game. If the official API doesn't return a guild by that name in that region, you'll see the not-found message. A guild whose members are all below level 10 isn't visible to the API either.",
        sections: [
          { h: "How is the guild name looked up?", p: [
            "We lower-case the name and look it up on the public Battle.net API twice: with spaces turned into hyphens, and as typed. Upper and lower case don't matter.",
            "Guild names must be 2 to 24 characters. Anything shorter or longer gets the check-your-entry message before any lookup.",
          ] },
          { h: "Why might the guild not be found?", p: [
            "The wrong region. Korea, Taiwan, the Americas and Europe are looked up on separate APIs, so pick the region the guild is in.",
            "A spelling difference. A similar-looking letter or a space in another place counts as a different name.",
            "All members below level 10. The official API doesn't return characters below level 10, so the guild can't be found. Try again once at least one member is past level 10.",
          ] },
          { h: "What do the other messages mean?", p: [
            "If Battle.net doesn't answer, you see \"Guilds can't be added right now\" instead. Try again in a little while.",
            "A guild removed by a removal request gets its own message saying it can't be added again.",
          ] },
        ],
      },
      "zh-tw": {
        title: "登記時顯示找不到公會",
        summary: "請先確認地區是否正確，以及名稱是否與遊戲中顯示的完全相同。官方 API 在該地區找不到這個名稱的公會時，就會顯示找不到。只有 10 級以下角色的公會，API 也查不到。",
        sections: [
          { h: "公會名稱是怎麼查找的？", p: [
            "我們會把輸入的名稱轉成小寫，並用兩種寫法到 Battle.net 公開 API 尋找公會：把空格換成連字號（-）的名稱，以及原樣輸入的名稱。大小寫沒有影響。",
            "公會名稱必須是 2～24 個字。太短或太長時，在尋找之前就會顯示請確認輸入內容。",
          ] },
          { h: "為什麼會找不到公會？", p: [
            "選錯地區。韓國、台灣、美洲、歐洲使用不同的 API，所以要選擇公會所在的地區。",
            "拼寫不同。相似的字或空格位置不同，都會被當成不同的名稱。",
            "成員全部未滿 10 級。官方 API 不會回傳 10 級以下的角色，所以也找不到公會。請在至少一位成員超過 10 級後再試一次。",
          ] },
          { h: "其他訊息是什麼意思？", p: [
            "Battle.net 沒有回應時，會顯示「目前無法登記」而不是找不到。稍後再試即可。",
            "因移除申請而退出的公會，會另外顯示無法再次登記的訊息。",
          ] },
        ],
      },
    },
  },
  {
    slug: "guild-renamed-or-disbanded",
    updated: "2026-11-24",
    related: ["/guide/", "/register/"],
    text: {
      ko: {
        title: "길드 이름이 바뀌거나 길드가 해체되면 어떻게 되나요?",
        summary: "정기 갱신 때 읽는 명단에서 길드를 찾지 못하면 \"길드를 찾을 수 없음\"으로 바뀝니다. 그 주는 주 시작 명단으로 순위를 유지하고, 다음 주부터 순위 밖이 되며 영토 지도의 땅은 모두 빈칸이 됩니다. 이름을 바꾼 길드는 새 이름으로 다시 등록하면 새 길드로 집계합니다.",
        sections: [
          { h: "언제 '찾을 수 없음'으로 바뀌나요?", p: [
            "길드는 등록할 때의 이름으로 공식 API에서 명단을 읽습니다. 이름이 바뀌었거나 해체되어 그 이름으로 명단이 나오지 않으면 다음 갱신(월·목요일 08:00)부터 \"길드를 찾을 수 없음\"으로 표시합니다.",
            "찾을 수 없는 길드도 갱신 때마다 다시 확인합니다. 일시적인 문제였다면 명단이 다시 읽히는 갱신 때 원래 상태로 돌아옵니다.",
          ] },
          { h: "순위와 영토는 어떻게 되나요?", p: [
            "점수는 주가 시작될 때의 명단으로 셉니다. 그래서 주중에 해체돼도 그 주는 순위를 유지하고, 주 시작 명단을 읽지 못한 다음 주부터 순위에 오르지 않습니다.",
            "길드를 찾을 수 없게 된 주가 마감되면 그 길드의 영토는 수도를 포함해 모두 빈칸이 됩니다.",
          ] },
          { h: "이름을 바꾼 길드는 어떻게 하나요?", p: [
            "새 이름으로 다시 등록하면 새 길드로 등록되고, 다음 주 목요일 08:00부터 집계합니다. 예전 이름의 기록과 영토는 새 길드로 옮겨지지 않습니다.",
          ] },
        ],
      },
      en: {
        title: "What happens if our guild is renamed or disbanded?",
        summary: "If the roster read at an update can't find the guild, it's marked \"Guild not found\". It keeps its rank that week, scored from the week-start roster, drops out of the ranks from the next week, and all its map land becomes empty. A renamed guild added again under its new name is scored as a new guild.",
        sections: [
          { h: "When does a guild show as not found?", p: [
            "Rosters are read from the official API by the name the guild was registered with. If the name changed or the guild disbanded so no roster comes back, it shows as \"Guild not found\" from the next update (Monday or Thursday, 08:00 Korea time).",
            "Guilds that can't be found are still checked at every update. If it was a passing problem, the guild returns to normal at the update that reads its roster again.",
          ] },
          { h: "What happens to its ranks and territory?", p: [
            "Scores come from the roster at the start of the week, so a guild that disbands mid-week keeps its rank that week. From the next week, when no week-start roster can be read, it isn't ranked.",
            "When a week closes with the guild not found, all of its land, capital included, becomes empty.",
          ] },
          { h: "What should a renamed guild do?", p: [
            "Adding the guild again under its new name registers it as a new guild, scored from the next Thursday at 08:00 Korea time. The old name's record and land don't carry over.",
          ] },
        ],
      },
      "zh-tw": {
        title: "公會改名或解散會怎麼樣？",
        summary: "定期更新讀取名單時找不到公會，就會改為「找不到公會」。當週以週初名單保留名次，下週起不再上榜，領土地圖上的土地全部變成無主之地。改名的公會用新名稱重新登記，會以新公會計分。",
        sections: [
          { h: "什麼時候會變成找不到？", p: [
            "我們用登記時的名稱從官方 API 讀取公會名單。名稱改了或公會解散，用這個名稱讀不到名單時，從下次更新（週一或週四 07:00，台灣時間）起顯示為「找不到公會」。",
            "找不到的公會每次更新仍會再確認。如果只是暫時的問題，名單重新讀到的那次更新就會恢復原狀。",
          ] },
          { h: "排名與領土會怎樣？", p: [
            "分數以一週開始時的名單計算。所以週中解散的公會當週仍保留名次，從讀不到週初名單的下一週起不再上榜。",
            "找不到公會的那一週結算時，公會的土地連同首都全部變成無主之地。",
          ] },
          { h: "改名的公會該怎麼做？", p: [
            "用新名稱重新登記，就會登記成新的公會，從下一個週四 07:00（台灣時間）開始計分。舊名稱的紀錄與領土不會轉移到新公會。",
          ] },
        ],
      },
    },
  },
  {
    slug: "weekly-reset-times",
    updated: "2026-11-24",
    related: ["/", "/guide/"],
    text: {
      ko: {
        title: "지역별 주간 초기화 시각은 언제인가요?",
        summary: "Guild March의 새 주차는 4개 지역 모두 같은 순간인 목요일 08:00(한국 시간)에 시작합니다. 대만은 목요일 07:00, 유럽(중부)은 목요일 00:00, 미국 동부는 수요일 18:00, 미국 서부는 수요일 15:00입니다. 데이터는 목요일과 월요일의 같은 시각에 갱신합니다.",
        sections: [
          { h: "지역별 초기화 시각은 몇 시인가요?", p: [
            "한국 목요일 08:00 = 대만 목요일 07:00 = 유럽(중부) 목요일 00:00 = 미국 동부 수요일 18:00 = 미국 서부 수요일 15:00. 협정 세계시로는 수요일 23:00입니다.",
            "이 시각은 Guild March가 주를 나누는 기준입니다. 게임의 주간 초기화와는 따로입니다.",
          ] },
          { h: "서머타임에는 초기화 시각이 바뀌나요?", p: [
            "기준은 한국 시간이라 바뀌지 않습니다. 미국과 유럽이 서머타임에 들어가면 그 지역 시계로는 한 시간 늦게 보입니다. 예를 들어 미국 동부는 수요일 19:00, 유럽(중부)은 목요일 01:00이 됩니다.",
          ] },
          { h: "초기화 때 무슨 일이 일어나나요?", p: [
            "그 주가 마감되어 최종 순위, 등급, 배지가 정해지고, 영토 지도에서 진군이 일어납니다. 마감된 결과는 주차별 결과 페이지에 남습니다.",
            "새 주차는 이때 길드에 있던 10레벨 이상 구성원으로 시작합니다. 새 주차의 첫 점수는 월요일 갱신부터 보이고, 그때까지는 지난주 최종 순위를 보여 줍니다.",
          ] },
        ],
      },
      en: {
        title: "When does the weekly reset happen in each region?",
        summary: "A new Guild March week starts at the same moment in all four regions: Thursday 08:00 Korea time. That's Thursday 07:00 in Taiwan, Thursday 00:00 in Central Europe, Wednesday 18:00 US Eastern and Wednesday 15:00 US Pacific. Data refreshes on Thursday and Monday at the same time.",
        sections: [
          { h: "What time is the reset in each region?", p: [
            "Thursday 08:00 Korea = Thursday 07:00 Taiwan = Thursday 00:00 Central Europe = Wednesday 18:00 US Eastern = Wednesday 15:00 US Pacific, or Wednesday 23:00 UTC.",
            "This is where Guild March splits its weeks. It's separate from the game's own weekly reset.",
          ] },
          { h: "Does daylight saving move the reset?", p: [
            "The reset is fixed to Korea time, which doesn't change. When the US and Europe move to summer time, it lands an hour later on their clocks: Wednesday 19:00 US Eastern and Thursday 01:00 in Central Europe, for example.",
          ] },
          { h: "What happens at the reset?", p: [
            "The week closes: final ranks, tiers and badges are settled and the territory map marches. Closed results stay on the past weeks page.",
            "The new week starts with the members in each guild at that moment who are level 10 or higher. Its first scores appear at Monday's update, and until then last week's final standings stay up.",
          ] },
        ],
      },
      "zh-tw": {
        title: "各地區的每週重置時間是什麼時候？",
        summary: "Guild March 的新一週在四個地區的同一時刻開始：台灣時間週四 07:00。也就是韓國週四 08:00、歐洲（中部）週四 00:00、美國東部週三 18:00、美國西部週三 15:00。資料在週四與週一的同一時間更新。",
        sections: [
          { h: "各地區的重置時間是幾點？", p: [
            "台灣週四 07:00 = 韓國週四 08:00 = 歐洲（中部）週四 00:00 = 美國東部週三 18:00 = 美國西部週三 15:00，換算成世界協調時間是週三 23:00。",
            "這是 Guild March 劃分週次的時間，與遊戲本身的每週重置無關。",
          ] },
          { h: "夏令時間會改變重置時間嗎？", p: [
            "時間以韓國時間為準，不會改變。美國與歐洲進入夏令時間後，在當地時鐘上會晚一小時，例如美國東部變成週三 19:00，歐洲（中部）變成週四 01:00。台灣沒有夏令時間，所以一直是週四 07:00。",
          ] },
          { h: "重置時會發生什麼？", p: [
            "當週結算，確定最終排名、等級與徽章，領土地圖也會進軍。結算結果會保留在歷週結果頁面。",
            "新的一週以當時在公會中、等級 10 以上的成員開始。新一週的第一個分數在週一更新後才會出現，在那之前會顯示上週的最終排名。",
          ] },
        ],
      },
    },
  },
  {
    slug: "no-achievement-cap",
    updated: "2026-11-24",
    related: ["/guide/", "/"],
    text: {
      ko: {
        title: "업적 점수에는 왜 상한이 없나요?",
        summary: "실제 데이터에서 업적 쏠림이 작았기 때문입니다. 2026년 11월 4개 지역 11개 길드를 1.8일 동안 비교했을 때 업적은 전체 점수의 44~47%였고, 캐릭터당 업적은 많아야 5개였습니다. 첫 주차 결과를 보고 상한을 다시 검토합니다.",
        sections: [
          { h: "업적은 왜 상한 없이 시작했나요?", p: [
            "2026년 11월 9일, 상한 없이 시작하기로 정했습니다. 4개 지역 11개 길드를 1.8일 간격으로 두 번 읽어 비교한 결과입니다.",
            "업적 비중은 44~47%, 캐릭터당 최대 5개였고, 상위 10% 캐릭터가 전체 업적의 29%를 가져가 몇 명에게 크게 쏠리지 않았습니다.",
          ] },
          { h: "레벨·명예 점수와 무엇이 다른가요?", p: [
            "레벨은 캐릭터당 주 20점, 명예 킬은 주 10점에서 멈춥니다. 60레벨에 가까워지면 레벨 점수는 줄어들기 때문에, 상한이 없는 업적이 만렙 이후에도 길드가 점수를 낼 수 있는 길이 됩니다.",
            "업적은 달성 시각으로 세므로 조회가 하루 늦어도 그 주에 달성한 것은 그 주에 들어갑니다.",
          ] },
          { h: "나중에 상한이 생기나요?", p: [
            "60레벨 이후에는 업적 비중이 더 커질 수 있습니다. 첫 주차(11월 26일 마감) 결과로 비중을 다시 보고, 상한이 필요하면 바꾸기 전에 규칙 안내에 먼저 알립니다.",
          ] },
        ],
      },
      en: {
        title: "Why is there no cap on achievement points?",
        summary: "Because real data showed little skew. Comparing 11 guilds across all four regions over 1.8 days in November 2026, achievements were 44–47% of all points and no character earned more than 5. The cap is reviewed again after the first week's results.",
        sections: [
          { h: "Why did achievements start without a cap?", p: [
            "On November 9, 2026, we decided to start without a cap, after reading 11 guilds in all four regions twice, 1.8 days apart.",
            "Achievements made up 44–47% of points, the most any character earned was 5, and the top 10% of characters had 29% of all achievements, so a few players didn't dominate.",
          ] },
          { h: "How is it different from levels and honor?", p: [
            "Levels stop at 20 points per character a week and honorable kills at 10. Level points dry up near level 60, so uncapped achievements keep a way to score after the level cap.",
            "Achievements count by when they were earned, so one earned this week counts this week even if it's read a day later.",
          ] },
          { h: "Will a cap be added later?", p: [
            "Achievements may weigh more after level 60. We'll check their share in week one (closing November 26), and if a cap is needed, the rules page will say so before it changes.",
          ] },
        ],
      },
      "zh-tw": {
        title: "成就分數為什麼沒有上限？",
        summary: "因為實際資料顯示集中程度不高。2026 年 11 月比較四個地區 11 個公會 1.8 天的資料，成就佔全部分數的 44～47%，每個角色最多只完成 5 個成就。第一週結果出來後會再檢討上限。",
        sections: [
          { h: "成就為什麼一開始不設上限？", p: [
            "2026 年 11 月 9 日決定不設上限開始。這是讀取四個地區 11 個公會兩次、間隔 1.8 天比較後的結果。",
            "成就佔分數的 44～47%，單一角色最多 5 個，前 10% 的角色佔全部成就的 29%，沒有集中在少數人身上。",
          ] },
          { h: "和等級、榮譽分數有什麼不同？", p: [
            "等級每個角色每週最多 20 分，榮譽擊殺最多 10 分。接近 60 級時等級分數會減少，所以沒有上限的成就，是公會在滿級後仍能得分的方式。",
            "成就以達成時間計算，即使晚一天讀取，本週達成的成就也會算在本週。",
          ] },
          { h: "之後會加上限嗎？", p: [
            "60 級之後成就的比重可能會更大。我們會用第一週（11 月 26 日結算）的結果再看比重，如果需要上限，會先在規則說明公告再改。",
          ] },
        ],
      },
    },
  },
  {
    slug: "become-region-lord",
    updated: "2026-11-24",
    related: ["/map/", "/ranks/"],
    text: {
      ko: {
        title: "지역 영주가 되려면 어떻게 해야 하나요?",
        summary: "주가 마감될 때 지도의 한 지역에서 칸의 절반을 넘게 가지고 있으면 그 지역의 영주가 됩니다. 땅은 순위에 올라 받은 등급만큼 진군해서 늘리므로, 매주 순위에 들고 등급을 높이는 것이 영주가 되는 길입니다.",
        sections: [
          { h: "영주가 되려면 무엇이 필요한가요?", p: [
            "지도는 지역과 룰셋마다 한 장이고, 지형을 따라 나눈 지역 37곳이 있습니다. 지역마다 22~111칸입니다.",
            "주가 마감될 때 한 지역 칸의 절반을 넘게 가진 길드가 그 지역의 영주입니다. 절반을 넘는 길드가 없으면 영주도 없습니다. 영주는 매주 마감 때 다시 정해집니다.",
          ] },
          { h: "땅은 어떻게 늘리나요?", p: [
            "순위에 올라야 진군합니다. 활동 인원 5명 이상으로 순위에 들면 그 주 등급에 따라 진군 횟수를 받습니다(패왕 4, 성주와 깃발대장 3, 돌파자와 선봉 II 2, 그 밖의 등급 1, 여기에 지도 배수를 곱함).",
            "진군은 맞닿은 빈칸부터 차지하고, 수도에서 가까운 칸부터 골라 땅이 한 덩어리로 자랍니다. 빈칸이 없으면 맞닿은 칸 중 그 주 등급이 자기보다 낮은 길드의 땅을 빼앗습니다.",
          ] },
          { h: "영주 자리는 어떻게 지키나요?", p: [
            "더 높은 등급의 길드가 이웃하면 땅을 빼앗길 수 있습니다. 한 주에 잃는 땅은 진군 전에 가진 땅의 절반까지입니다.",
            "그 주 순위에 들지 못하면 진군하지 않고, 등급 0으로 취급되어 누구에게나 땅을 빼앗길 수 있습니다(수도 제외).",
            "영주 칭호는 명예입니다. 점수, 진군 횟수, 리그에는 영향이 없습니다.",
          ] },
        ],
      },
      en: {
        title: "How does a guild become a region lord?",
        summary: "A guild holding more than half the cells of a map region when a week closes becomes that region's lord. Land grows by marching, and marches come from the tier a guild earns by being ranked, so staying ranked and climbing tiers is how you get there.",
        sections: [
          { h: "What does it take to become a lord?", p: [
            "There's one map per region and ruleset, split along the terrain into 37 regions of 22 to 111 cells each.",
            "When a week closes, the guild holding more than half a region's cells is its lord. If nobody holds more than half, the region has no lord. Lords are settled again at every close.",
          ] },
          { h: "How does a guild grow its land?", p: [
            "Only ranked guilds march. With 5 or more active members a guild is ranked and gets marches by that week's tier (4 for Overlord, 3 for Castellan and Banner Captain, 2 for Breaker and Vanguard II, 1 for the rest, times the map's multiplier).",
            "Marches take neighbouring empty cells first, nearest the capital first, so land grows in one piece. With no empty cell next door, they take neighbouring cells from guilds with a lower tier that week.",
          ] },
          { h: "How does a lord keep its region?", p: [
            "A higher-tier neighbour can take your land, but no guild loses more than half of what it held before the march in one week.",
            "A guild that isn't ranked that week doesn't march and counts as tier 0, so anyone can take its land except the capital.",
            "Lord titles are honor only. They don't change scores, marches or leagues.",
          ] },
        ],
      },
      "zh-tw": {
        title: "要怎麼成為地區領主？",
        summary: "每週結算時，在地圖的某個地區擁有超過一半格數的公會，就會成為該地區的領主。土地靠上榜獲得的等級進軍來擴張，所以每週上榜、提高等級就是成為領主的方法。",
        sections: [
          { h: "成為領主需要什麼？", p: [
            "每個地區依規則各有一張地圖，依地形分成 37 個地區，每個地區 22～111 格。",
            "每週結算時，擁有某地區超過一半格數的公會就是該地區的領主。沒有公會超過一半時，該地區就沒有領主。領主在每次結算時重新決定。",
          ] },
          { h: "怎麼擴張土地？", p: [
            "只有上榜的公會才會進軍。活躍人數 5 人以上上榜後，依當週等級獲得進軍次數（霸王 4 次，城主與旗隊長 3 次，破陣者與先鋒 II 2 次，其他等級 1 次，再乘上地圖倍數）。",
            "進軍先佔領相鄰的無主之地，並從離首都近的格子開始，讓土地連成一片。沒有相鄰的空地時，會奪取相鄰且當週等級比自己低的公會的土地。",
          ] },
          { h: "怎麼守住領主？", p: [
            "等級更高的公會在旁邊時，土地可能被奪走，但一週失去的土地最多是進軍前所擁有的一半。",
            "當週沒有上榜就不會進軍，並被視為等級 0，任何公會都能奪走土地（首都除外）。",
            "領主稱號只是榮譽，不影響分數、進軍次數或分組。",
          ] },
        ],
      },
    },
  },
  {
    slug: "below-level-10",
    updated: "2026-11-24",
    related: ["/guide/", "/register/"],
    text: {
      ko: {
        title: "10레벨 미만 캐릭터는 왜 세지 않나요?",
        summary: "공식 Battle.net API가 10레벨 미만 캐릭터의 정보를 돌려주지 않기 때문입니다. 읽을 수 없는 캐릭터는 점수를 계산할 수 없어, 주가 시작될 때 10레벨 이상인 구성원만 점수와 활동 인원에 넣습니다.",
        sections: [
          { h: "API가 왜 읽지 못하나요?", p: [
            "길드 명단에는 저레벨 캐릭터도 나오지만, 캐릭터 프로필, 업적, PvP 요약은 10레벨 이상만 조회됩니다. 그래서 그 캐릭터가 얼마나 성장했는지 알 수 없습니다.",
          ] },
          { h: "10레벨 미만은 어떻게 세나요?", p: [
            "주가 시작될 때 10레벨 이상이었던 구성원만 점수에 들어가고, 그중 그 주에 접속한 구성원이 활동 인원이 됩니다.",
            "주중에 10레벨을 넘긴 캐릭터는 그 주에는 세지 않고, 다음 주 시작 때 길드에 있으면 그 주부터 셉니다.",
          ] },
          { h: "길드 페이지에는 어떻게 표시되나요?", p: [
            "10레벨 미만이거나 조회되지 않아 빠진 구성원 수는 길드 페이지에 따로 적습니다. 명단 인원과 활동 인원이 다른 이유를 그 숫자로 확인할 수 있습니다.",
          ] },
        ],
      },
      en: {
        title: "Why don't characters below level 10 count?",
        summary: "Because the official Battle.net API doesn't return characters below level 10. A character we can't read can't be scored, so only members who are level 10 or higher when the week starts count toward points and active members.",
        sections: [
          { h: "Why can't the API read them?", p: [
            "Low-level characters appear on the guild roster, but profiles, achievements and PvP summaries are only returned from level 10 up, so there's no way to see how such a character progressed.",
          ] },
          { h: "How are members below level 10 counted?", p: [
            "Only members at level 10 or higher when the week starts are scored, and of those, the ones who log in that week are active members.",
            "A character who passes level 10 mid-week doesn't count that week. If they're in the guild when the next week starts, they count from then.",
          ] },
          { h: "Where does the guild page show them?", p: [
            "The guild page shows how many members were left out for being below level 10 or not readable, which explains the gap between roster size and active members.",
          ] },
        ],
      },
      "zh-tw": {
        title: "為什麼不計算 10 級以下的角色？",
        summary: "因為官方 Battle.net API 不會回傳 10 級以下角色的資料。讀不到的角色無法計分，所以只有一週開始時等級 10 以上的成員才會計入分數與活躍人數。",
        sections: [
          { h: "API 為什麼讀不到？", p: [
            "公會名單上會出現低等級角色，但角色資料、成就與 PvP 摘要只有 10 級以上才查得到，所以無法知道這些角色成長了多少。",
          ] },
          { h: "10 級以下的成員怎麼計算？", p: [
            "只有一週開始時等級 10 以上的成員會計分，其中在這一週上線的成員就是活躍成員。",
            "週中超過 10 級的角色當週不計算；如果下週開始時還在公會中，就從下週開始計算。",
          ] },
          { h: "公會頁面上怎麼顯示？", p: [
            "公會頁面會另外寫出因未滿 10 級或無法查詢而不列入計算的成員人數，可以用這個數字了解名單人數與活躍人數的差別。",
          ] },
        ],
      },
    },
  },
  {
    slug: "logged-in-not-updated",
    updated: "2026-11-24",
    related: ["/guide/", "/"],
    text: {
      ko: {
        title: "접속 중인 캐릭터의 점수가 반영되지 않아요",
        summary: "게임에 접속 중인 캐릭터는 공식 API에서 조회되지 않습니다. 갱신(월·목요일 08:00) 때 접속 중이었다면 그 갱신에는 직전에 읽은 값을 쓰고, 로그아웃한 뒤 다음 갱신에 반영됩니다. 업적은 달성 시각으로 세므로 잃지 않습니다.",
        sections: [
          { h: "왜 늦게 반영되나요?", p: [
            "Guild March는 월요일과 목요일 08:00(한국 시간)에 Battle.net 공개 API로 캐릭터 정보를 읽습니다. 이때 게임에 접속 중인 캐릭터는 API가 정보를 돌려주지 않습니다.",
            "읽지 못한 캐릭터는 마지막으로 읽은 값으로 계산합니다. 로그아웃한 상태로 다음 08:00을 맞으면 그때 올린 레벨과 명예 킬이 반영됩니다.",
          ] },
          { h: "잃는 점수가 있나요?", p: [
            "업적은 달성한 시각으로 세므로, 늦게 읽혀도 그 주에 달성한 업적은 그 주 점수에 들어갑니다.",
            "레벨과 명예 킬은 주 시작 값과 마지막으로 읽은 값의 차이로 셉니다. 주가 마감되는 목요일 08:00에도 접속 중이었다면, 마감 뒤에 늘어난 몫은 다음 주 점수로 넘어갈 수 있습니다.",
          ] },
          { h: "확실히 반영되게 하려면 어떻게 하나요?", p: [
            "목요일 08:00 전에는 한 번 로그아웃해 두면 그 주 마지막 값이 정확히 읽힙니다. 순위표의 갱신 시각으로 언제 읽었는지 확인할 수 있습니다.",
          ] },
        ],
      },
      en: {
        title: "Our logged-in character's progress isn't showing",
        summary: "The official API doesn't return characters who are logged in. If a character is online at an update (Monday or Thursday, 08:00), the last value read stands in for that update, and its progress shows at the next update after logging out. Achievements count by when they were earned, so none are lost.",
        sections: [
          { h: "Why does it show up late?", p: [
            "Guild March reads characters from the public Battle.net API on Monday and Thursday at 08:00 Korea time. Characters logged in at that moment aren't returned.",
            "A character that can't be read is scored from the last value we read. Once it's logged out at the next 08:00 read, its new levels and honorable kills show up.",
          ] },
          { h: "Can points be lost?", p: [
            "Achievements count by when they were earned, so one earned this week counts this week even if it's read a day late.",
            "Levels and honorable kills count as the difference between the week-start value and the last value read. If a character is still logged in at the Thursday 08:00 close, gains not yet read can fall into the next week instead.",
          ] },
          { h: "How can I make sure it counts?", p: [
            "Log out once before Thursday 08:00 Korea time so the week's last values are read. The rank table shows when the data was last updated.",
          ] },
        ],
      },
      "zh-tw": {
        title: "正在遊戲中的角色分數沒有反映",
        summary: "官方 API 查不到正在遊戲中的角色。如果週一或週四 07:00（台灣時間）更新時角色在線上，那次更新會使用上一次讀到的數值，登出後的下次更新才會反映。成就以達成時間計算，所以不會遺漏。",
        sections: [
          { h: "為什麼會晚一點反映？", p: [
            "Guild March 在週一與週四 07:00（台灣時間）用 Battle.net 公開 API 讀取角色資料。這時正在遊戲中的角色，API 不會回傳資料。",
            "讀不到的角色會用上一次讀到的數值計算。在登出狀態下迎接下一個 07:00，提升的等級與榮譽擊殺就會反映。",
          ] },
          { h: "會不會少算分數？", p: [
            "成就以達成時間計算，即使晚一天讀到，本週達成的成就也會算進本週分數。",
            "等級與榮譽擊殺以週初數值和最後讀到的數值之差計算。如果週四 07:00 結算時角色仍在線上，結算後才讀到的增加量可能會算進下一週。",
          ] },
          { h: "怎麼確定會被計算？", p: [
            "在週四 07:00（台灣時間）前先登出一次，當週最後的數值就會被正確讀取。可以在排名表的更新時間確認何時讀取。",
          ] },
        ],
      },
    },
  },
  {
    slug: "mid-week-recruits",
    updated: "2026-11-24",
    related: ["/guide/", "/guilds/"],
    text: {
      ko: {
        title: "주중에 들어온 길드원은 언제부터 세나요?",
        summary: "다음 주부터 셉니다. 점수는 주가 시작되는 목요일 08:00(한국 시간)에 길드 명단에 있던 10레벨 이상 구성원으로만 계산하고, 주중에 들어온 길드원은 다음 목요일에 명단에 있으면 그 주부터 들어갑니다.",
        sections: [
          { h: "그 주에는 어느 명단을 세나요?", p: [
            "매주 목요일 08:00에 읽은 명단이 그 주의 구성원입니다. 주중에 명단이 바뀌어도 그 주 점수를 낼 구성원은 바뀌지 않습니다.",
            "주가 끝나기 직전에 고레벨 캐릭터를 데려와 점수를 올리는 일을 막으려는 규칙입니다.",
          ] },
          { h: "주중에 나간 길드원은 어떻게 되나요?", p: [
            "주 시작 때 있던 구성원은 주중에 길드를 나가도 그 주가 끝날 때까지 원래 길드 점수로 셉니다. 옮겨 간 길드에서는 다음 주부터 셉니다.",
          ] },
          { h: "새로 등록한 길드는 언제부터 세나요?", p: [
            "길드 자체도 같습니다. 등록한 다음 목요일 08:00에 주 시작 명단을 정하고 그 주부터 집계합니다.",
          ] },
        ],
      },
      en: {
        title: "When do mid-week recruits start counting?",
        summary: "From the next week. Points come only from members who were on the roster and level 10 or higher at the Thursday 08:00 Korea time start. A recruit who joins mid-week counts from the next week if they're on the roster that Thursday.",
        sections: [
          { h: "Which roster counts for the week?", p: [
            "The roster read on Thursday at 08:00 Korea time is the week's membership. Roster changes during the week don't change who scores that week.",
            "The rule stops guilds from bringing in high-level characters near the end of a week to lift their score.",
          ] },
          { h: "What about members who leave mid-week?", p: [
            "A member on the week-start roster still counts for their old guild until the week ends, even after leaving. Their new guild counts them from the next week.",
          ] },
          { h: "When do newly added guilds start counting?", p: [
            "The same goes for guilds. The roster is set on the Thursday at 08:00 after registration, and scoring starts that week.",
          ] },
        ],
      },
      "zh-tw": {
        title: "週中加入的成員從什麼時候開始計算？",
        summary: "從下週開始。分數只計算一週開始的週四 07:00（台灣時間）時就在公會名單中、且等級 10 以上的成員。週中加入的成員，如果下個週四在名單上，就從那一週開始計算。",
        sections: [
          { h: "那一週算的是哪份名單？", p: [
            "每週四 07:00（台灣時間）讀到的名單就是當週的成員。週中名單有變動，當週計分的成員也不會改變。",
            "這條規則是為了防止在一週快結束時拉進高等級角色來衝分數。",
          ] },
          { h: "週中退出的成員會怎樣？", p: [
            "週初在名單上的成員，即使週中退出公會，到該週結束為止都計入原本公會的分數。新公會從下週開始計算。",
          ] },
          { h: "新登記的公會什麼時候開始計算？", p: [
            "公會本身也一樣。登記後的下一個週四 07:00 確定週初名單，從那一週開始計分。",
          ] },
        ],
      },
    },
  },
  {
    slug: "league-change",
    updated: "2026-11-24",
    related: ["/guide/", "/ranks/"],
    text: {
      ko: {
        title: "활동 인원이 바뀌어 리그가 바뀌면 순위는 어떻게 되나요?",
        summary: "리그는 매주 그 주의 활동 인원으로 다시 정해집니다. 리그를 옮긴 주에는 새 리그 안에서 순위를 매기고, 순위표에는 오르내림 대신 \"옮겨 옴\"으로 표시하며, 그 주 급상승 배지 대상에서 빠집니다.",
        sections: [
          { h: "리그는 어떻게 정하나요?", p: [
            "활동 인원 5~19명은 소 리그, 20~49명은 중 리그, 50명 이상은 대 리그입니다. 활동 인원은 주 시작 명단의 10레벨 이상 구성원 중 그 주에 접속한 사람 수입니다.",
            "갱신 때마다 그 주 활동 인원으로 다시 계산하므로, 주중에도 리그가 바뀔 수 있습니다. 5명 아래로 떨어지면 그 주는 \"활동 인원 부족\"으로 순위 밖입니다.",
          ] },
          { h: "리그를 옮긴 주에는 어떻게 표시되나요?", p: [
            "지난주와 다른 리그에 있으면 순위 변동 숫자 대신 \"옮겨 옴\"으로 표시합니다. 서로 다른 리그의 순위를 비교하는 것은 뜻이 없기 때문입니다.",
            "급상승 배지는 같은 리그에서 2계단 이상 오른 길드에게만 주므로, 옮긴 주에는 받을 수 없습니다.",
          ] },
          { h: "등급과 영토는 어떻게 되나요?", p: [
            "등급은 마감 때 새 리그 안의 위치로 정합니다. 영토 지도는 리그와 상관없이 지역·룰셋마다 한 장이라, 리그를 옮겨도 같은 지도에서 땅을 유지합니다.",
          ] },
        ],
      },
      en: {
        title: "What happens to our rank if a change in active members moves us to another league?",
        summary: "Leagues are set each week from that week's active members. In a week a guild changes league, it's ranked within the new league, the table shows it as moved instead of up or down, and it can't earn the Biggest climb badge that week.",
        sections: [
          { h: "How is the league set?", p: [
            "5 to 19 active members is the small league, 20 to 49 medium, and 50 or more large. Active members are the week-start roster members at level 10 or higher who log in that week.",
            "It's worked out again at every update, so a guild can change league mid-week. Below 5, the guild is \"Not enough active members\" and unranked that week.",
          ] },
          { h: "How is a move shown?", p: [
            "A guild in a different league from last week shows as moved rather than a number of places up or down, since ranks in different leagues can't be compared.",
            "The Biggest climb badge only goes to a guild that rose at least 2 places in the same league, so it can't be earned in a week of moving.",
          ] },
          { h: "What happens to tiers and territory?", p: [
            "The tier comes from the guild's place in its new league when the week closes. The territory map is one per region and ruleset whatever the league, so the guild keeps its land on the same map.",
          ] },
        ],
      },
      "zh-tw": {
        title: "活躍人數改變導致換組時，排名會怎麼樣？",
        summary: "分組每週依當週活躍人數重新決定。換組的那一週會在新分組內排名，排名表上顯示「移入」而不是名次升降，當週也不列入最大躍升徽章。",
        sections: [
          { h: "分組怎麼決定？", p: [
            "活躍 5～19 人是小型組，20～49 人是中型組，50 人以上是大型組。活躍人數是週初名單中等級 10 以上、且當週有上線的成員人數。",
            "每次更新都會用當週活躍人數重新計算，所以週中也可能換組。少於 5 人時，當週會顯示「活躍人數不足」且不會上榜。",
          ] },
          { h: "換組那週怎麼顯示？", p: [
            "與上週分組不同時，會顯示「移入」而不是名次變化的數字，因為不同分組的名次無法比較。",
            "最大躍升徽章只頒給在同一分組上升 2 名以上的公會，所以換組那週無法獲得。",
          ] },
          { h: "等級與領土會怎樣？", p: [
            "等級依結算時在新分組內的位置決定。領土地圖不分組，每個地區與規則各一張，所以換組後土地仍保留在同一張地圖上。",
          ] },
        ],
      },
    },
  },
  {
    slug: "remove-my-character",
    updated: "2026-11-24",
    related: ["/opt-out/", "/guide/"],
    text: {
      ko: {
        title: "내 캐릭터를 순위에서 빼려면 어떻게 하나요?",
        summary: "제외 요청 페이지에서 \"캐릭터 하나 빼기\"를 고르고 지역과 캐릭터 이름을 남기면 됩니다. 다음 갱신(월·목요일 08:00)부터 순위와 길드 페이지에서 빠지고, 저장된 그 캐릭터의 정보는 모두 지웁니다. 로그인이나 연락처는 필요 없습니다.",
        sections: [
          { h: "어떻게 요청하나요?", p: [
            "제외 요청 페이지에서 요청 종류로 \"캐릭터 하나 빼기\"를 고르고, 지역과 캐릭터 이름을 적어 보내면 됩니다. 이름만 받고 이메일 같은 연락처는 받지 않습니다.",
            "캐릭터 요청은 본인 정보에 관한 요청이라 운영자 확인 없이 다음 갱신 때 자동으로 처리합니다.",
          ] },
          { h: "처리되면 어떻게 되나요?", p: [
            "그 캐릭터와 함께 저장된 레벨 기록, 업적, 구성원별 점수가 지워지고, 이후 길드 명단에 나와도 다시 저장하지 않습니다. 아직 저장된 적 없는 캐릭터도 앞으로 저장하지 않습니다.",
            "이미 마감된 주의 길드 합계는 바꾸지 않습니다. 진행 중인 주는 그 캐릭터를 빼고 다시 계산합니다.",
          ] },
          { h: "길드 전체를 뺄 수도 있나요?", p: [
            "길드 전체 제외는 로그인이 없어 누구나 요청할 수 있으므로, 남의 길드를 지우지 못하게 운영자가 확인한 뒤 처리합니다.",
          ] },
        ],
      },
      en: {
        title: "How do I remove my character from the ranks?",
        summary: "On the removal request page, choose \"Remove one character\" and leave the region and character name. It drops off the ranks and guild pages at the next update (Monday or Thursday, 08:00 Korea time), and everything stored about it is deleted. No login or contact details are needed.",
        sections: [
          { h: "How do I ask?", p: [
            "On the removal request page, choose \"Remove one character\" as the request and send the region and character name. We take the name only, never an email or other contact.",
            "A character request is about a person's own data, so it's handled automatically at the next update without waiting for a check.",
          ] },
          { h: "What happens once it's handled?", p: [
            "The character's stored levels, achievements and per-member points are deleted, and it isn't stored again even when it shows up on a guild roster. A character never stored before won't be stored from then on either.",
            "Guild totals for weeks that already closed stay as they were. The week in progress is worked out again without the character.",
          ] },
          { h: "Can a whole guild be removed?", p: [
            "Anyone can ask to remove a whole guild, since there are no logins, so the site owner checks those requests first and nobody can remove a rival's guild.",
          ] },
        ],
      },
      "zh-tw": {
        title: "要怎麼把我的角色從排名移除？",
        summary: "在移除申請頁面選擇「移除一個角色」，留下地區與角色名稱即可。從下次更新（週一或週四 07:00，台灣時間）起會從排名與公會頁面移除，並刪除已儲存的該角色所有資料。不需要登入，也不需要聯絡方式。",
        sections: [
          { h: "要怎麼申請？", p: [
            "在移除申請頁面的申請類型選擇「移除一個角色」，填寫地區與角色名稱後送出即可。只收名稱，不收電子郵件等聯絡方式。",
            "角色申請涉及本人的資料，所以不需要營運者確認，會在下次更新時自動處理。",
          ] },
          { h: "處理之後會怎樣？", p: [
            "會刪除該角色已儲存的等級紀錄、成就與成員分數，之後即使出現在公會名單上也不會再儲存。從未儲存過的角色，之後也不會儲存。",
            "已結算週次的公會合計不會更改。進行中的一週會排除該角色重新計算。",
          ] },
          { h: "可以移除整個公會嗎？", p: [
            "因為不需要登入，任何人都能申請移除整個公會，為了防止別人刪除其他公會，會由營運者確認後處理。",
          ] },
        ],
      },
    },
  },
  {
    slug: "faction-stats-meaning",
    updated: "2026-11-24",
    related: ["/factions/", "/ranks/"],
    text: {
      ko: {
        title: "진영 통계는 서버 인구를 뜻하나요?",
        summary: "아니요. 진영 통계는 Guild March에 등록한 길드만 모아 호드와 얼라이언스를 비교한 값입니다. 등록하지 않은 길드와 길드가 없는 캐릭터는 들어가지 않으므로 서버 전체 인구와는 다릅니다.",
        sections: [
          { h: "진영 통계는 무엇을 세나요?", p: [
            "지역과 룰셋마다 등록 길드를 진영별로 나눠 순위 길드 수, 활동 인원, 올린 레벨, 인원당 점수를 비교합니다. 마감된 주에는 영토 지도에서 각 진영 길드가 가진 땅도 보여 줍니다.",
            "\"우세\"는 인원당 점수가 더 높은 진영입니다. 같으면 동률입니다.",
          ] },
          { h: "왜 서버 인구가 아닌가요?", p: [
            "Guild March는 등록한 길드의 명단만 읽습니다. 어느 진영 길드가 더 많이 등록했는지에 따라 숫자가 크게 달라집니다.",
            "길드의 진영은 공식 API가 알려 주는 진영을 우선합니다. API가 진영을 주지 않으면 등록할 때 고른 진영을 씁니다.",
          ] },
          { h: "어떻게 읽으면 좋나요?", p: [
            "\"등록한 길드끼리 이번 주 어느 진영이 더 활발했나\"로 읽어 주세요. 인원당 점수는 길드 수에 덜 흔들리므로 진영 간 비교에 더 알맞습니다.",
          ] },
        ],
      },
      en: {
        title: "Do the faction stats show server population?",
        summary: "No. The faction stats compare Horde and Alliance among guilds registered with Guild March only. Unregistered guilds and characters without a guild aren't in them, so they aren't a server population.",
        sections: [
          { h: "What do the faction stats count?", p: [
            "For each region and ruleset, registered guilds are split by faction to compare ranked guilds, active members, levels gained and points per member. For closed weeks, the land each faction's guilds held on the territory map is shown too.",
            "\"Ahead\" means the faction with more points per member. Equal means even.",
          ] },
          { h: "Why isn't it the server population?", p: [
            "Guild March only reads the rosters of registered guilds, so the numbers depend heavily on which faction's guilds have registered.",
            "A guild's faction is the one the official API reports. When the API gives none, the faction chosen at registration is used.",
          ] },
          { h: "How should I read it?", p: [
            "Read it as \"which faction's registered guilds were busier this week\". Points per member move less with the number of guilds, so they're the fairer comparison.",
          ] },
        ],
      },
      "zh-tw": {
        title: "陣營統計代表伺服器人口嗎？",
        summary: "不是。陣營統計只彙整在 Guild March 登記的公會，比較部落與聯盟。沒有登記的公會和沒有公會的角色都不包含在內，所以與伺服器整體人口不同。",
        sections: [
          { h: "陣營統計計算哪些？", p: [
            "依地區與規則，把登記的公會按陣營分開，比較上榜公會數、活躍人數、提升等級與每人分數。已結算的週次還會顯示各陣營公會在領土地圖上擁有的土地。",
            "「領先」是每人分數較高的陣營，相同則為平手。",
          ] },
          { h: "為什麼不是伺服器人口？", p: [
            "Guild March 只讀取已登記公會的名單，所以數字會因哪個陣營的公會登記得多而有很大差異。",
            "公會的陣營以官方 API 回報的陣營為準。API 沒有提供陣營時，使用登記時選擇的陣營。",
          ] },
          { h: "該怎麼看？", p: [
            "請把它看成「已登記的公會中，本週哪個陣營比較活躍」。每人分數較不受公會數量影響，更適合用來比較陣營。",
          ] },
        ],
      },
    },
  },
  {
    slug: "dungeons-and-raids",
    updated: "2026-11-24",
    related: ["/guide/", "/"],
    text: {
      ko: {
        title: "던전과 레이드는 점수에 들어가나요?",
        summary: "아직 따로 세지 않습니다. 지금 점수는 레벨, 60레벨 달성, 업적, 명예 킬 네 가지입니다. 던전이나 레이드에서 얻은 업적은 업적 점수로 들어가고, 우두머리 처치 점수는 레이드가 열리는 12월 9일 뒤에 넣을 예정입니다.",
        sections: [
          { h: "지금은 무엇을 세나요?", p: [
            "레벨 1에 1점(캐릭터당 주 20점까지), 60레벨 달성 10점, 업적 하나에 5점(상한 없음), 명예 킬 10회에 1점(캐릭터당 주 10점까지)입니다.",
            "던전과 레이드에서 얻은 업적도 다른 업적과 똑같이 하나에 5점으로 셉니다.",
          ] },
          { h: "던전·레이드 처치는 언제부터 세나요?", p: [
            "던전·레이드 처치 점수는 12월 9일 레이드 개방 뒤에 넣을 예정입니다. 60레벨 근처에서 레벨 점수가 줄어드는 것을 채우려는 것입니다.",
            "점수 방식은 아직 정하지 않았습니다. 정해지면 규칙 안내와 첫 화면 점수표에 먼저 공개합니다.",
          ] },
        ],
      },
      en: {
        title: "Do dungeons and raids count toward the score?",
        summary: "Not on their own yet. The score has four parts today: levels, reaching level 60, achievements and honorable kills. Achievements earned in dungeons and raids count as achievements, and boss kill points are planned for after raids open on December 9.",
        sections: [
          { h: "What counts now?", p: [
            "1 point per level (up to 20 per character a week), 10 for reaching level 60, 5 per achievement (no limit) and 1 per 10 honorable kills (up to 10 per character a week).",
            "Achievements earned in dungeons and raids are worth 5 points each, like any other achievement.",
          ] },
          { h: "When will dungeon and raid kills count?", p: [
            "Dungeon and raid kill points are planned for after raids open on December 9, to make up for level points drying up near level 60.",
            "How they'll be scored isn't decided yet. Once it is, it goes up on the rules page and the landing page's scoring table first.",
          ] },
        ],
      },
      "zh-tw": {
        title: "地城與團隊副本會計入分數嗎？",
        summary: "目前還沒有另外計算。現在的分數有四項：等級、達到 60 級、成就與榮譽擊殺。在地城與團隊副本獲得的成就會算進成就分數，首領擊殺分數預計在 12 月 9 日團隊副本開放後加入。",
        sections: [
          { h: "目前計算哪些項目？", p: [
            "每 1 級得 1 分（每個角色每週最多 20 分），達到 60 級得 10 分，每個成就得 5 分（無上限），每 10 次榮譽擊殺得 1 分（每個角色每週最多 10 分）。",
            "在地城與團隊副本獲得的成就，也和其他成就一樣每個 5 分。",
          ] },
          { h: "地城與團隊副本擊殺什麼時候開始計分？", p: [
            "地城・團隊副本擊殺分數預計在 12 月 9 日團隊副本開放後加入，用來補足接近 60 級時等級分數的減少。",
            "計分方式還沒有決定。決定後會先公布在規則說明與首頁的分數表。",
          ] },
        ],
      },
    },
  },
];
