import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Guild March" };

// Any unknown path lands here, so the page can't know the language and shows all three
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Almendra:wght@400;700&family=Gowun+Dodum&family=Hahmlet:wght@500;700;800&display=swap"
        />
      </head>
      <body className="lost">
        <div className="world is-dim" style={{ backgroundImage: 'url("/images/scenes/forest-ambush.webp")' }} aria-hidden="true" />
        <main className="lost-card frame">
          <h1 className="frame-plate">404</h1>
          <section lang="en">
            <h2>You've wandered off the map</h2>
            <p>This page doesn't exist. If you were looking for a guild, it may have been renamed or not scored yet.</p>
            <p className="lost-links">
              <a className="btn" href="/en/guilds/">Find a guild</a>
              <a className="link-quiet" href="/en/">Back to the ranks</a>
            </p>
          </section>
          <section lang="ko">
            <h2>길을 잃었습니다</h2>
            <p>찾는 페이지가 없습니다. 길드 페이지라면 길드 이름이 바뀌었거나 아직 집계 전일 수 있습니다.</p>
            <p className="lost-links">
              <a className="btn" href="/ko/guilds/">길드 찾기</a>
              <a className="link-quiet" href="/ko/">순위로 돌아가기</a>
            </p>
          </section>
          <section lang="zh-Hant-TW">
            <h2>你走出地圖了</h2>
            <p>找不到這個頁面。如果你在找公會頁面，公會可能改了名字，或還沒開始計分。</p>
            <p className="lost-links">
              <a className="btn" href="/zh-tw/guilds/">尋找公會</a>
              <a className="link-quiet" href="/zh-tw/">回到排名</a>
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
