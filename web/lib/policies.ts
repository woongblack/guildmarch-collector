import type { Lang } from "./i18n";

// The four site pages (R-34): about, contact, privacy, terms. Kept out of the i18n dictionary
// because they are long prose. In a paragraph, [label](/path/) links within the site (the language
// is added), [label](mailto:...) and [label](https://...) link out. The privacy page must match
// what the site really keeps: db/schema.sql (public game data only, no accounts, emails or IPs)
// and the services it runs on.

export const CONTACT_EMAIL = "contact@guildmarch.com";
// Date the privacy page and terms took effect; change it with any change to their substance
export const POLICY_DATE = "2026-11-21";

export type PolicySlug = "about" | "contact" | "privacy" | "terms";
export type PolicyText = { title: string; lead: string; description: string; sections: { h: string; p: string[] }[] };

const mail = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;

const ko: Record<PolicySlug, PolicyText> = {
  about: {
    title: "사이트 소개",
    lead: "Guild March는 WoW: Forever 길드를 매주 겨루게 하는 비공식 팬 사이트입니다.",
    description: "Guild March가 무엇이고 누가 왜 운영하는지, 데이터는 어디서 오고 점수는 어떻게 계산하는지 소개합니다.",
    sections: [
      { h: "무엇을 하나", p: [
        "길드 이름만 등록하면 블리자드가 공개하는 게임 데이터로 길드원의 레벨 상승, 업적 점수, 명예 킬을 매주 집계해 순위를 냅니다. 한국(KR), 대만(TW), 미국(US), 유럽(EU) 네 지역을 같은 규칙으로 운영합니다.",
        "큰 길드가 늘 이기지 않도록 활동 인원으로 리그를 나누고 인원당 점수로 겨룹니다. 순위에 따라 등급과 배지를 받고, 지역마다 영토 지도에서 땅을 넓히거나 빼앗깁니다. 자세한 규칙은 [규칙 안내](/guide/)에 모두 공개합니다.",
      ] },
      { h: "데이터는 어디서 오나", p: [
        "모든 게임 데이터는 Blizzard Entertainment의 공개 API에서 하루 한 번(한국 시간 08:00) 읽어 옵니다. 길드원이 가입하거나 애드온을 설치할 필요가 없습니다.",
        "공개 API가 주는 것만 씁니다. 접속 시각처럼 개인의 생활을 드러내는 정보는 보여 주지 않고, 데이터는 30일 안에 새로 고칩니다.",
      ] },
      { h: "누가 운영하나", p: [
        "한국에 사는 WoW 플레이어 한 사람이 개인적으로 만들고 운영합니다. 회사나 블리자드와는 관계가 없습니다.",
        "World of Warcraft와 관련 이름은 Blizzard Entertainment의 상표입니다. 사이트의 그림은 블리자드 공식 아트를 쓰지 않고 따로 만든 것입니다.",
      ] },
      { h: "지키는 원칙", p: [
        "로그인이 없습니다. 이메일이나 계정을 받지 않습니다.",
        "보상은 명예뿐입니다. 상금, 상품, 유료 기능이 없습니다.",
        "원치 않는 길드와 캐릭터는 [제외 요청](/opt-out/)으로 언제든 뺍니다.",
        "점수 계산 방법과 사이트가 못 하는 것을 숨기지 않습니다.",
      ] },
      { h: "연락", p: [`오류 제보, 데이터 정정, 제안은 [연락처](/contact/) 페이지나 ${mail}로 보내 주세요.`] },
    ],
  },
  contact: {
    title: "연락처",
    lead: "오류 제보, 데이터 정정, 제안, 그 밖의 문의는 이메일로 받습니다.",
    description: "Guild March 운영자에게 연락하는 방법. 오류 제보, 데이터 정정, 제외 요청, 제안을 받습니다.",
    sections: [
      { h: "이메일", p: [mail, "보통 며칠 안에 답합니다. 시즌 마감 주에는 늦어질 수 있습니다."] },
      { h: "보내실 때", p: [
        "오류나 데이터 문제라면 지역(KR·TW·US·EU), 길드 이름, 서버, 문제가 보이는 페이지 주소를 함께 적어 주시면 빨리 확인할 수 있습니다.",
        "비밀번호, 인증 코드, 결제 정보 같은 개인 정보는 보내지 마세요. 운영자는 그런 정보를 요청하지 않습니다.",
      ] },
      { h: "길드나 캐릭터를 빼고 싶다면", p: ["이메일보다 [제외 요청](/opt-out/) 양식이 빠릅니다. 이름만 받습니다. 캐릭터는 다음 갱신 때 빠지고, 길드는 운영자가 확인한 뒤 빠집니다."] },
      { h: "블리자드 계정·게임 문제", p: ["이 사이트는 블리자드와 관계가 없어 계정, 결제, 게임 안의 문제는 도울 수 없습니다. 블리자드 고객지원을 이용해 주세요."] },
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    lead: "Guild March가 무엇을 저장하고 무엇을 저장하지 않는지 적습니다.",
    description: "Guild March의 개인정보처리방침. 계정·이메일·IP를 저장하지 않고 공개 게임 데이터만 다룹니다. 분석, 글꼴, 호스팅, 광고 쿠키와 삭제 요청 방법.",
    sections: [
      { h: "요약", p: [
        "이 사이트에는 로그인이 없고, 방문자의 이메일, 계정, IP 주소를 저장하지 않습니다. 저장하는 것은 블리자드가 공개하는 게임 데이터와, 방문자가 양식에 적어 보낸 길드·캐릭터 이름, 디스코드 알림을 신청한 채널의 웹후크 주소, 그리고 IP를 되돌릴 수 없게 바꾼 익명 방문 기록뿐입니다.",
      ] },
      { h: "저장하는 정보", p: [
        "공개 게임 데이터: 등록된 길드의 이름, 지역, 서버, 진영과 길드원 캐릭터의 이름, 레벨, 업적, 명예 킬, 마지막 접속 시각. 블리자드 공개 API에서 하루 한 번 읽어 순위 계산에 씁니다. 마지막 접속 시각은 최근 활동한 인원을 세는 데만 쓰고 화면에 보여 주지 않습니다.",
        "길드 등록 양식: 지역과 길드 이름(서버). 누가 등록했는지는 저장하지 않습니다.",
        "제외 요청 양식: 빼 달라는 길드나 캐릭터의 이름과 요청 시각. 연락처는 받지 않습니다.",
        "디스코드 알림: 채널의 웹후크 주소와 메시지 언어. 주간 결과를 보내는 데만 쓰고 공개하지 않습니다. 디스코드에서 웹후크를 지우면 다음 발송 때 함께 지웁니다.",
        "익명 방문 기록: 어느 길드 페이지를 언제 열었는지와, IP 주소·브라우저·날짜를 서버만 아는 키로 섞어 만든 값. 이 값은 날마다 바뀌고 IP로 되돌릴 수 없습니다. 첫 화면의 '방금 조회된 길드'와 지금 보고 있는 사람 수, 하루 방문자 수를 세는 데만 쓰며 35일 뒤 지웁니다. 쿠키는 쓰지 않습니다.",
        "이메일 문의: 보내 주신 메일은 답장과 처리에만 쓰고, 처리가 끝나면 1년 안에 지웁니다.",
      ] },
      { h: "보관과 삭제", p: [
        "게임 데이터는 순위와 기록을 보여 주는 동안 보관하고 30일 안에 새로 고칩니다. 캐릭터 제외 요청은 다음 갱신 때 그 캐릭터에 대해 저장한 기록을 모두 지우고 이후 수집에서 뺍니다. 길드 제외 요청은 다른 사람이 경쟁 길드를 빼는 일을 막기 위해 운영자가 확인한 뒤 화면에서 내립니다. 다시 수집하지 않도록 요청한 이름은 보관합니다.",
        "삭제나 정정을 원하시면 [제외 요청](/opt-out/) 양식이나 " + mail + "로 알려 주세요.",
      ] },
      { h: "사이트를 운영하는 데 쓰는 서비스", p: [
        "Cloudflare: 사이트 전송, 보안(과도한 요청 차단), 방문 통계(Cloudflare Web Analytics). 통계는 쿠키를 쓰지 않고 개인을 구별하지 않는 합계로만 봅니다. 요청을 처리하는 동안 Cloudflare가 IP 주소를 다루지만 이 사이트는 그것을 저장하지 않습니다.",
        "Supabase: 게임 데이터와 양식 내용을 저장하는 데이터베이스.",
        "Google Fonts: 글꼴 파일을 Google 서버에서 받아 옵니다. 이때 브라우저가 Google에 접속합니다.",
        "GitHub: 하루 한 번 데이터를 갱신하는 작업을 돌립니다. 방문자 정보는 다루지 않습니다.",
      ] },
      { h: "쿠키와 광고", p: [
        "지금(" + POLICY_DATE + ") 이 사이트는 자체 쿠키를 쓰지 않고 광고도 없습니다.",
        "운영비를 위해 Google AdSense 광고를 붙일 수 있습니다. 그 경우 Google을 비롯한 제3자 광고 사업자가 쿠키를 사용해 이 사이트와 다른 사이트 방문 기록을 바탕으로 광고를 보여 줄 수 있습니다. 맞춤 광고는 [Google 광고 설정](https://adssettings.google.com)이나 [aboutads.info](https://www.aboutads.info)에서 끌 수 있습니다. 유럽 경제 지역과 영국 방문자에게는 광고 쿠키 전에 동의를 받습니다.",
        "블리자드에서 받은 게임 데이터는 광고 타기팅에 쓰지 않습니다. 광고를 시작하면 이 페이지를 고치고 시행일을 바꿉니다.",
      ] },
      { h: "아동", p: ["이 사이트는 만 14세 미만을 대상으로 하지 않으며, 나이를 묻거나 아동의 정보를 따로 모으지 않습니다."] },
      { h: "문의와 책임자", p: ["개인정보에 관한 문의와 요청은 운영자(개인정보 보호책임자)에게 " + mail + "로 보내 주세요."] },
      { h: "바뀌면", p: ["내용이 바뀌면 이 페이지에 알리고 아래 시행일을 고칩니다.", `시행일: ${POLICY_DATE}`] },
    ],
  },
  terms: {
    title: "이용약관",
    lead: "Guild March를 이용할 때의 약속입니다.",
    description: "Guild March 이용약관. 비공식 팬 사이트라는 점, 데이터의 정확성, 등록과 제외, 금지 행위, 책임의 범위.",
    sections: [
      { h: "1. 비공식 사이트", p: ["Guild March는 개인이 운영하는 비공식 팬 사이트로 Blizzard Entertainment와 관계가 없습니다. 여기의 순위, 등급, 영토는 이 사이트가 정한 규칙의 결과이며 블리자드의 공식 기록이 아닙니다. World of Warcraft와 관련 이름은 Blizzard Entertainment의 상표입니다."] },
      { h: "2. 서비스", p: [
        "블리자드 공개 데이터로 길드 점수와 순위를 계산해 보여 줍니다. 데이터는 하루 한 번 갱신되며, 블리자드 API의 지연이나 오류, 계산 규칙의 한계 때문에 틀리거나 늦을 수 있습니다.",
        "규칙은 [규칙 안내](/guide/)에 공개하며, 공정성을 위해 바꿀 수 있습니다. 바꿀 때는 미리 알립니다. 운영자의 사정으로 서비스를 멈추거나 끝낼 수 있습니다.",
      ] },
      { h: "3. 등록과 제외", p: [
        "길드장이 아니어도 누구나 길드를 등록할 수 있습니다. 길드나 캐릭터가 원하지 않으면 [제외 요청](/opt-out/)으로 언제든 빠집니다.",
        "다른 길드를 놀리거나 괴롭히려는 등록, 사실이 아닌 정보로 혼란을 주는 등록은 지울 수 있습니다.",
      ] },
      { h: "4. 하지 말아 주세요", p: [
        "사이트에 과도한 부담을 주는 자동 대량 수집, 공격, 보안 우회.",
        "이 사이트의 순위를 블리자드 공식 순위나 보상처럼 소개하는 것.",
        "사이트를 통해 다른 플레이어를 괴롭히거나 개인 정보를 캐는 것.",
      ] },
      { h: "5. 보상", p: ["순위와 등급, 영토, 배지는 명예일 뿐 상금이나 상품이 없습니다. 이 사이트의 결과를 근거로 한 거래나 내기에 운영자는 관여하지 않습니다."] },
      { h: "6. 콘텐츠", p: [
        "게임 데이터의 권리는 Blizzard Entertainment에 있습니다. 사이트의 글, 그림, 디자인은 운영자의 것이며, 출처와 링크를 밝히면 순위 화면과 길드 페이지를 자유롭게 공유할 수 있습니다.",
        "아이콘과 질감처럼 다른 사람이 만든 자료는 페이지 하단에 적은 라이선스를 따릅니다.",
      ] },
      { h: "7. 책임", p: ["사이트는 있는 그대로 제공됩니다. 데이터의 오류, 지연, 서비스 중단으로 생긴 손해에 대해 법이 허용하는 범위에서 운영자는 책임지지 않습니다."] },
      { h: "8. 바뀌면", p: ["약관이 바뀌면 이 페이지에 알리고 시행일을 고칩니다. 바뀐 뒤에도 계속 이용하시면 바뀐 약관에 동의한 것으로 봅니다. 이 약관은 대한민국 법을 따릅니다.", `시행일: ${POLICY_DATE} · 문의: ${mail}`] },
    ],
  },
};

const en: Record<PolicySlug, PolicyText> = {
  about: {
    title: "About",
    lead: "Guild March is an unofficial fan site where WoW: Forever guilds compete every week.",
    description: "What Guild March is, who runs it and why, where the data comes from and how scores are worked out.",
    sections: [
      { h: "What it does", p: [
        "Register a guild by name and we count its members' level gains, achievement points and honor kills each week from game data Blizzard makes public, then rank the guilds. Korea (KR), Taiwan (TW), the Americas (US) and Europe (EU) all run on the same rules.",
        "So that big guilds don't always win, guilds are grouped into leagues by active members and compete on score per member. Ranks earn tiers and badges, and on each region's territory map guilds gain or lose ground. Every rule is in the [Guide](/guide/).",
      ] },
      { h: "Where the data comes from", p: [
        "All game data is read from Blizzard Entertainment's public API once a day (08:00 Korea time). Members don't sign up or install an addon.",
        "We use only what the public API gives. We never show anything that reveals someone's daily life, such as when they log in, and we refresh the data within 30 days.",
      ] },
      { h: "Who runs it", p: [
        "One WoW player in Korea built it and runs it personally. It has no ties to any company or to Blizzard.",
        "World of Warcraft and related names are trademarks of Blizzard Entertainment. The site's art is made for the site and uses no official Blizzard artwork.",
      ] },
      { h: "Principles", p: [
        "No logins. We don't ask for emails or accounts.",
        "The only reward is honor. No prize money, goods or paid features.",
        "Any guild or character can leave at any time through a [removal request](/opt-out/).",
        "We publish how scores work and what the site can't do.",
      ] },
      { h: "Contact", p: [`Send bug reports, data fixes and ideas through the [Contact](/contact/) page or to ${mail}.`] },
    ],
  },
  contact: {
    title: "Contact",
    lead: "Bug reports, data fixes, ideas and other questions come in by email.",
    description: "How to reach the Guild March operator: bug reports, data fixes, removal requests and ideas.",
    sections: [
      { h: "Email", p: [mail, "We usually reply within a few days; season-end weeks can be slower."] },
      { h: "When you write", p: [
        "For a bug or a data problem, include the region (KR, TW, US or EU), the guild name, the realm and the address of the page where you see it. That lets us check quickly.",
        "Never send passwords, codes or payment details. We will never ask for them.",
      ] },
      { h: "Removing a guild or character", p: ["The [removal request](/opt-out/) form is faster than email. It takes names only. Characters leave at the next update; guilds leave once the operator has checked the request."] },
      { h: "Blizzard account or game issues", p: ["This site has no ties to Blizzard and can't help with accounts, payments or in-game problems. Please contact Blizzard Support."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lead: "What Guild March keeps, and what it doesn't.",
    description: "Guild March privacy policy. No accounts, emails or IP addresses are stored; only public game data. Analytics, fonts, hosting, ad cookies and how to ask for removal.",
    sections: [
      { h: "In short", p: [
        "There are no logins, and we don't store visitors' emails, accounts or IP addresses. We keep the game data Blizzard makes public, the guild or character names people send through our forms, the webhook URLs of Discord channels signed up for weekly results, and anonymous visit records that can't be turned back into an IP address. Nothing else.",
      ] },
      { h: "What we keep", p: [
        "Public game data: for registered guilds, the name, region, realm and faction, and for their members' characters, the name, level, achievements, honor kills and last login time. Read once a day from Blizzard's public API to work out ranks. The last login time is used only to count recently active members and is never shown.",
        "Guild registration form: the region and guild name (with realm). We don't record who registered it.",
        "Removal request form: the name of the guild or character to remove and when it was asked. No contact details.",
        "Discord results: the channel's webhook URL and message language. Used only to post weekly results and never shown. When the webhook is deleted in Discord, we delete it at the next post.",
        "Anonymous visit records: which guild page was opened and when, with a value made by mixing the IP address, browser and date with a key only the server knows. The value changes every day and can't be turned back into an IP. It is used only for the home page's list of guilds people just looked up, the number of people on the site now, and daily visitor counts, and deleted after 35 days. No cookies.",
        "Email: messages you send are used only to reply and act on them, and deleted within a year once handled.",
      ] },
      { h: "Keeping and deleting", p: [
        "Game data is kept while it shows in ranks and records, and refreshed within 30 days. A character removal request deletes everything stored about that character at the next update and leaves it out of later collection. A guild removal request is checked by the operator first, so no one can remove a rival guild, and then the guild is taken off the pages. The requested names are kept so they aren't collected again.",
        `To ask for removal or a correction, use the [removal request](/opt-out/) form or write to ${mail}.`,
      ] },
      { h: "Services the site runs on", p: [
        "Cloudflare: delivers the site, blocks excessive requests, and counts visits (Cloudflare Web Analytics). Analytics uses no cookies and shows only totals that don't single anyone out. Cloudflare handles IP addresses while serving requests; this site doesn't store them.",
        "Supabase: the database holding the game data and form entries.",
        "Google Fonts: font files load from Google's servers, so your browser connects to Google.",
        "GitHub: runs the daily update job. It handles no visitor data.",
      ] },
      { h: "Cookies and advertising", p: [
        `As of ${POLICY_DATE} the site sets no cookies of its own and shows no ads.`,
        "We may add Google AdSense ads to cover running costs. Third-party vendors, including Google, would then use cookies to show ads based on your visits to this and other sites. You can turn off personalized ads in [Google Ads Settings](https://adssettings.google.com) or at [aboutads.info](https://www.aboutads.info). Visitors in the European Economic Area and the UK are asked for consent before any ad cookies.",
        "Game data from Blizzard is never used to target ads. If ads start, this page will be updated and its date changed.",
      ] },
      { h: "Children", p: ["The site isn't aimed at children under 14 (13 in the US). We don't ask anyone's age or collect children's information."] },
      { h: "Questions", p: [`Send privacy questions and requests to the operator, who is responsible for privacy here, at ${mail}.`] },
      { h: "Changes", p: ["Changes are posted on this page with a new date.", `Effective: ${POLICY_DATE}`] },
    ],
  },
  terms: {
    title: "Terms of Use",
    lead: "What you and Guild March agree to when you use the site.",
    description: "Guild March terms of use: an unofficial fan site, data accuracy, registration and removal, what not to do, and limits of liability.",
    sections: [
      { h: "1. Unofficial site", p: ["Guild March is an unofficial fan site run by an individual and is not affiliated with Blizzard Entertainment. Its ranks, tiers and territory come from this site's own rules and are not official Blizzard records. World of Warcraft and related names are trademarks of Blizzard Entertainment."] },
      { h: "2. The service", p: [
        "We work out guild scores and ranks from Blizzard's public data. Data updates once a day and can be wrong or late because of delays or errors in Blizzard's API or limits of our rules.",
        "The rules are published in the [Guide](/guide/) and may change for fairness; we announce changes in advance. The operator may pause or end the service.",
      ] },
      { h: "3. Registering and removal", p: [
        "Anyone can register a guild, not only its leader. A guild or character that doesn't want to be listed can leave at any time through a [removal request](/opt-out/).",
        "Registrations meant to mock or harass a guild, or to mislead with false details, may be removed.",
      ] },
      { h: "4. Please don't", p: [
        "Scrape the site in bulk, attack it, or get around its protections.",
        "Present this site's ranks as official Blizzard rankings or rewards.",
        "Use the site to harass other players or dig up personal information.",
      ] },
      { h: "5. Rewards", p: ["Ranks, tiers, territory and badges are honor only, with no prizes. The operator takes no part in trades or bets based on results here."] },
      { h: "6. Content", p: [
        "Game data belongs to Blizzard Entertainment. The site's text, art and design belong to the operator; you're free to share rank pages and guild pages with a link and credit.",
        "Material by others, such as icons and textures, follows the licenses listed at the foot of each page.",
      ] },
      { h: "7. Liability", p: ["The site is provided as is. To the extent the law allows, the operator is not liable for losses from data errors, delays or downtime."] },
      { h: "8. Changes", p: ["Changes to these terms are posted here with a new date; using the site after a change means you accept it. These terms are governed by the laws of the Republic of Korea.", `Effective: ${POLICY_DATE} · Contact: ${mail}`] },
    ],
  },
};

const zh: Record<PolicySlug, PolicyText> = {
  about: {
    title: "關於本站",
    lead: "Guild March 是讓 WoW: Forever 公會每週一較高下的非官方粉絲網站。",
    description: "介紹 Guild March 是什麼、由誰經營與原因、資料來源以及分數如何計算。",
    sections: [
      { h: "做什麼", p: [
        "只要登錄公會名稱，我們就會用 Blizzard 公開的遊戲資料，每週統計成員的等級提升、成就點數與榮譽擊殺並排出名次。韓國（KR）、台灣（TW）、美洲（US）、歐洲（EU）四個地區採用相同規則。",
        "為了不讓大公會永遠獲勝，我們依活躍人數分聯賽，以人均分數競爭。名次帶來等級與徽章，各地區的領土地圖上公會會擴張或失去土地。所有規則都公開在[規則說明](/guide/)。",
      ] },
      { h: "資料從哪裡來", p: [
        "所有遊戲資料每天一次（韓國時間 08:00）從 Blizzard Entertainment 的公開 API 讀取。成員不需註冊，也不需安裝插件。",
        "我們只使用公開 API 提供的資料。不顯示登入時間等透露個人生活的資訊，資料在 30 天內更新。",
      ] },
      { h: "誰在經營", p: [
        "由一位住在韓國的 WoW 玩家個人製作與經營，與任何公司或 Blizzard 無關。",
        "World of Warcraft 及相關名稱為 Blizzard Entertainment 的商標。本站圖像為另行製作，未使用 Blizzard 官方美術。",
      ] },
      { h: "堅持的原則", p: [
        "不需登入。不收集電子郵件或帳號。",
        "獎勵只有榮譽，沒有獎金、獎品或付費功能。",
        "不願被列出的公會與角色，隨時可透過[移除申請](/opt-out/)退出。",
        "公開分數的計算方式，也坦白說明本站做不到的事。",
      ] },
      { h: "聯絡", p: [`錯誤回報、資料更正與建議，請透過[聯絡我們](/contact/)頁面或寄信至 ${mail}。`] },
    ],
  },
  contact: {
    title: "聯絡我們",
    lead: "錯誤回報、資料更正、建議與其他詢問皆以電子郵件受理。",
    description: "聯絡 Guild March 經營者的方式：錯誤回報、資料更正、移除申請與建議。",
    sections: [
      { h: "電子郵件", p: [mail, "通常會在幾天內回覆，賽季結束那週可能較慢。"] },
      { h: "來信時", p: [
        "若是錯誤或資料問題，請一併寫上地區（KR、TW、US、EU）、公會名稱、伺服器以及出現問題的頁面網址，方便我們快速確認。",
        "請勿寄送密碼、驗證碼或付款資訊。經營者絕不會要求這些資料。",
      ] },
      { h: "想移除公會或角色", p: ["使用[移除申請](/opt-out/)表單比寄信更快。只需名稱。角色會在下次更新時移除，公會則在經營者確認後移除。"] },
      { h: "Blizzard 帳號或遊戲問題", p: ["本站與 Blizzard 無關，無法協助帳號、付款或遊戲內問題。請聯絡 Blizzard 客服。"] },
    ],
  },
  privacy: {
    title: "隱私權政策",
    lead: "說明 Guild March 保存什麼、不保存什麼。",
    description: "Guild March 隱私權政策。不保存帳號、電子郵件或 IP，只處理公開遊戲資料。分析、字型、主機、廣告 Cookie 與刪除申請方式。",
    sections: [
      { h: "摘要", p: [
        "本站沒有登入功能，也不保存訪客的電子郵件、帳號或 IP 位址。保存的只有 Blizzard 公開的遊戲資料，訪客透過表單送出的公會或角色名稱，申請 Discord 通知的頻道 Webhook 網址，以及無法還原成 IP 的匿名造訪紀錄。",
      ] },
      { h: "保存的資訊", p: [
        "公開遊戲資料：已登錄公會的名稱、地區、伺服器、陣營，以及成員角色的名稱、等級、成就、榮譽擊殺與最後登入時間。每天一次從 Blizzard 公開 API 讀取，用於計算名次。最後登入時間只用於計算近期活躍人數，絕不顯示。",
        "公會登錄表單：地區與公會名稱（含伺服器）。不記錄是誰登錄的。",
        "移除申請表單：要移除的公會或角色名稱與申請時間。不收集聯絡方式。",
        "Discord 通知：頻道的 Webhook 網址與訊息語言。只用來發送每週結果，不會公開。在 Discord 刪除 Webhook 後，下次發送時會一併刪除。",
        "匿名造訪紀錄：開啟了哪個公會頁面與時間，以及用只有伺服器知道的金鑰把 IP 位址、瀏覽器與日期混合而成的值。這個值每天都會改變，無法還原成 IP。只用於首頁的「剛剛被查看的公會」、目前在看的人數與每日造訪人數，35 天後刪除。不使用 Cookie。",
        "電子郵件：來信只用於回覆與處理，處理完畢後一年內刪除。",
      ] },
      { h: "保存與刪除", p: [
        "遊戲資料在名次與紀錄顯示期間保存，並在 30 天內更新。角色移除申請會在下次更新時刪除該角色的所有保存紀錄，之後也不再收集。公會移除申請為了防止有人移除競爭公會，會由經營者確認後再從頁面撤下。申請的名稱會保留，以免再次收集。",
        `如需刪除或更正，請使用[移除申請](/opt-out/)表單或寄信至 ${mail}。`,
      ] },
      { h: "網站使用的服務", p: [
        "Cloudflare：傳送網站、安全防護（阻擋過量請求）與造訪統計（Cloudflare Web Analytics）。統計不使用 Cookie，只看不會識別個人的總數。處理請求時 Cloudflare 會接觸 IP 位址，但本站不保存。",
        "Supabase：保存遊戲資料與表單內容的資料庫。",
        "Google Fonts：字型檔從 Google 伺服器載入，此時瀏覽器會連線到 Google。",
        "GitHub：執行每日的資料更新工作，不處理訪客資訊。",
      ] },
      { h: "Cookie 與廣告", p: [
        `截至 ${POLICY_DATE}，本站不使用自己的 Cookie，也沒有廣告。`,
        "為了支付營運費用，本站可能加入 Google AdSense 廣告。屆時包括 Google 在內的第三方廣告商可能使用 Cookie，依您造訪本站及其他網站的紀錄顯示廣告。您可以在 [Google 廣告設定](https://adssettings.google.com)或 [aboutads.info](https://www.aboutads.info) 關閉個人化廣告。歐洲經濟區與英國的訪客，在使用廣告 Cookie 前會先徵求同意。",
        "從 Blizzard 取得的遊戲資料絕不用於廣告投放。開始放廣告時，會修改本頁並更新施行日期。",
      ] },
      { h: "兒童", p: ["本站並非以未滿 14 歲的兒童為對象，不詢問年齡，也不另外收集兒童的資訊。"] },
      { h: "詢問與負責人", p: [`有關個人資料的詢問與申請，請寄信給經營者（個人資料保護負責人）：${mail}。`] },
      { h: "變更", p: ["內容變更時會在本頁公告並更新下方的施行日期。", `施行日期：${POLICY_DATE}`] },
    ],
  },
  terms: {
    title: "使用條款",
    lead: "使用 Guild March 時的約定。",
    description: "Guild March 使用條款：非官方粉絲網站、資料準確性、登錄與移除、禁止行為與責任範圍。",
    sections: [
      { h: "1. 非官方網站", p: ["Guild March 是由個人經營的非官方粉絲網站，與 Blizzard Entertainment 無關。本站的名次、等級與領土是依本站規則得出的結果，並非 Blizzard 的官方紀錄。World of Warcraft 及相關名稱為 Blizzard Entertainment 的商標。"] },
      { h: "2. 服務內容", p: [
        "我們用 Blizzard 公開資料計算並顯示公會分數與名次。資料每天更新一次，可能因 Blizzard API 的延遲或錯誤、或本站規則的限制而有誤或延遲。",
        "規則公開在[規則說明](/guide/)，為了公平可能調整，調整前會事先公告。經營者可能因故暫停或結束服務。",
      ] },
      { h: "3. 登錄與移除", p: [
        "不必是會長，任何人都能登錄公會。不願被列出的公會或角色，隨時可透過[移除申請](/opt-out/)退出。",
        "以嘲弄或騷擾其他公會為目的、或以不實資訊造成混亂的登錄，可能會被刪除。",
      ] },
      { h: "4. 請勿", p: [
        "大量自動抓取造成網站負擔、攻擊網站或繞過防護。",
        "把本站名次說成 Blizzard 官方排名或獎勵。",
        "利用本站騷擾其他玩家或探查個人資訊。",
      ] },
      { h: "5. 獎勵", p: ["名次、等級、領土與徽章只是榮譽，沒有獎金或獎品。經營者不參與以本站結果為依據的交易或賭注。"] },
      { h: "6. 內容", p: [
        "遊戲資料的權利屬於 Blizzard Entertainment。本站的文字、圖像與設計屬於經營者；註明出處並附上連結，即可自由分享名次頁與公會頁。",
        "圖示、材質等他人製作的素材，依頁面底部所列授權使用。",
      ] },
      { h: "7. 責任", p: ["本站依現狀提供。在法律允許的範圍內，經營者不對資料錯誤、延遲或服務中斷造成的損失負責。"] },
      { h: "8. 變更", p: ["條款變更時會在本頁公告並更新施行日期；變更後繼續使用即視為同意。本條款適用大韓民國法律。", `施行日期：${POLICY_DATE} · 聯絡：${mail}`] },
    ],
  },
};

const all: Record<Lang, Record<PolicySlug, PolicyText>> = { ko, en, "zh-tw": zh };

export const policySlugs: PolicySlug[] = ["about", "contact", "privacy", "terms"];
export const policy = (lang: Lang, slug: PolicySlug) => all[lang][slug];
