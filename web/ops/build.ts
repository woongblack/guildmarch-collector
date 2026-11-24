// The owner's dashboard (Growth_Plan.md section 5): one HTML page with its data baked in, built
// after the daily update and deployed to its own Cloudflare Pages project behind the id/password gate in ops/worker.js.
// Stage 1 reads only the site's own DB; visits, Search Console and AI answers come in stage 2.
// Run from web/: node ops/build.ts   (needs DATABASE_URL; writes ops/out/index.html)
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { connect } from "../pipeline/db.ts";

const OUT = new URL("./out/", import.meta.url);
const KST = "Asia/Seoul";
// Go/No-Go on 12/3 (Guild_League_Plan.md): two of the three
const GO = { guilds: 50, revisit: 0.4, visitors: 1000 };

type Post = { date: string; board: string; title: string; url: string; views: number; likes: number; comments: number };
const community: Post[] = JSON.parse(readFileSync(new URL("./community.json", import.meta.url), "utf8")).posts;

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const num = (n: number) => n.toLocaleString("ko-KR");
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
// Dates from Postgres "date" columns are midnight UTC; month/day is read in UTC so it doesn't shift
const day = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
const stamp = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: KST, month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);

async function load() {
  const sql = connect();
  try {
    const guilds = await sql`select region, ruleset, faction, status, registered_at, roster_size from guild`;
    const regs = await sql`
      select (registered_at at time zone ${KST})::date as d, count(*)::int as n
      from guild group by 1 order by 1`;
    const runs = await sql`
      select (started_at at time zone ${KST})::date as d, region, started_at, finished_at, api_calls, failed_calls
      from collection_run where started_at > now() - interval '30 days' order by started_at`;
    const [chars] = await sql`select count(*)::int as n from character`;
    const requests = await sql`select kind, status, count(*)::int as n from opt_out_request group by 1, 2`;
    const weeks = await sql`
      select w.region, w.number, w.status, gw.status as gstatus, gw.league, count(gw.guild_id)::int as n
      from week w left join guild_week gw on gw.week_id = w.id
      where w.number = (select max(number) from week x where x.region = w.region)
         or w.number = (select max(number) from week x where x.region = w.region and x.status = 'closed')
      group by 1, 2, 3, 4, 5 order by 1, 2`;
    const maps = await sql`
      select w.region, w.number, t.ruleset, t.season, cardinality(t.owner) as cells,
        (select count(*) from unnest(t.owner) o where o is not null)::int as held,
        (select count(*) from jsonb_object_keys(t.lords))::int as lords, t.claimed, t.captured
      from territory_week t join week w on w.id = t.week_id
      where w.number = (select max(x.number) from week x join territory_week y on y.week_id = x.id where x.region = w.region and y.ruleset = t.ruleset)
      order by 1, 3`;
    // R-46: visitors are a daily hash, so a day's count is exact and a week is the sum of its days.
    // Missing until the page_view table exists
    const visits = await sql`
      select (at at time zone ${KST})::date as d, count(distinct visitor)::int as n, count(*) filter (where guild_id > 0)::int as guild_views
      from page_view where at > now() - interval '30 days' group by 1 order by 1`.catch(() => []);
    const topGuilds = await sql`
      select g.name, g.region, count(distinct p.visitor)::int as n from page_view p join guild g on g.id = p.guild_id
      where p.at > now() - interval '7 days' group by 1, 2 order by 3 desc limit 10`.catch(() => []);
    return { guilds, regs, runs, chars: chars.n as number, requests, weeks, maps, visits, topGuilds };
  } finally {
    await sql.end();
  }
}

// One-series charts: the title names the series, so there is no legend; each mark carries a
// native tooltip. Bars end square on the baseline with a 4px rounded top, and a 2px gap between.
function bars(points: { label: string; value: number; tip: string }[], height = 120) {
  if (!points.length) return `<p class="empty">아직 기록이 없습니다.</p>`;
  const w = 640;
  const max = Math.max(1, ...points.map((p) => p.value));
  const bw = Math.min(28, (w - 40) / points.length - 2);
  const step = (w - 40) / points.length;
  const marks = points.map((p, i) => {
    const h = Math.max(p.value ? 2 : 0, (p.value / max) * (height - 28));
    const x = 32 + i * step + (step - bw) / 2;
    const y = height - 18 - h;
    return `<g><title>${esc(p.tip)}</title><rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="4" class="bar"/>`
      + `<rect x="${x}" y="${Math.max(y, height - 22)}" width="${bw}" height="${Math.min(h, 4)}" class="bar"/>`
      + `<rect x="${x - step / 2 + bw / 2}" y="0" width="${step}" height="${height}" fill="transparent"/></g>`;
  }).join("");
  const labels = points.map((p, i) => (i % Math.ceil(points.length / 8) === 0 || i === points.length - 1
    ? `<text x="${32 + i * step + step / 2}" y="${height - 4}" class="tick" text-anchor="middle">${esc(p.label)}</text>` : "")).join("");
  return `<svg viewBox="0 0 ${w} ${height}" class="chart" role="img"><line x1="30" x2="${w - 6}" y1="${height - 18}" y2="${height - 18}" class="axis"/>`
    + `<text x="26" y="12" class="tick" text-anchor="end">${num(max)}</text>${marks}${labels}</svg>`;
}

function line(points: { label: string; value: number }[], height = 140) {
  if (points.length < 2) return bars(points.map((p) => ({ ...p, tip: `${p.label}: ${p.value}` })), height);
  const w = 640;
  const max = Math.max(1, ...points.map((p) => p.value));
  const x = (i: number) => 32 + (i / (points.length - 1)) * (w - 48);
  const y = (v: number) => height - 18 - (v / max) * (height - 30);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.value)}`).join(" ");
  const dots = points.map((p, i) => `<g><title>${esc(`${p.label}: 누적 ${num(p.value)}곳`)}</title><circle cx="${x(i)}" cy="${y(p.value)}" r="4" class="dot"/><circle cx="${x(i)}" cy="${y(p.value)}" r="12" fill="transparent"/></g>`).join("");
  const last = points.at(-1)!;
  return `<svg viewBox="0 0 ${w} ${height}" class="chart" role="img"><line x1="30" x2="${w - 6}" y1="${height - 18}" y2="${height - 18}" class="axis"/>`
    + `<path d="${path}" class="line"/>${dots}`
    + `<text x="${x(points.length - 1)}" y="${y(last.value) - 10}" class="value" text-anchor="end">${num(last.value)}곳</text>`
    + `<text x="32" y="${height - 4}" class="tick">${esc(points[0].label)}</text><text x="${w - 16}" y="${height - 4}" class="tick" text-anchor="end">${esc(last.label)}</text></svg>`;
}

function tile(label: string, value: string, note = "", state = "") {
  return `<div class="tile ${state}"><span class="tile-label">${esc(label)}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ""}</div>`;
}

function goBar(label: string, now: number | null, target: number, fmt: (n: number) => string, pending = "") {
  const share = now === null ? 0 : Math.min(1, now / target);
  const met = now !== null && now >= target;
  return `<div class="go ${met ? "is-met" : ""}"><div class="go-head"><span>${esc(label)}</span><strong>${now === null ? "—" : fmt(now)} / ${fmt(target)}</strong>`
    + `<em>${now === null ? esc(pending) : met ? "✓ 달성" : `${pct(share)}`}</em></div>`
    + `<div class="go-track"><span style="width:${share * 100}%"></span></div></div>`;
}

const REGION: Record<string, string> = { kr: "한국", tw: "대만", us: "미국", eu: "유럽" };
const RULESET: Record<string, string> = { pvp: "PvP", normal: "일반" };
const FACTION: Record<string, string> = { horde: "호드", alliance: "얼라" };
const LEAGUE: Record<string, string> = { small: "소", medium: "중", large: "대" };

async function main() {
  const d = await load();
  const now = new Date();
  const live = d.guilds.filter((g) => g.status !== "opted_out");
  const tracked = live.filter((g) => g.status === "tracked").length;

  // Registrations: daily counts and the running total
  let total = 0;
  const cumulative = d.regs.map((r) => ({ label: day(new Date(r.d)), value: (total += r.n) }));
  const daily = d.regs.slice(-30).map((r) => ({ label: day(new Date(r.d)), value: r.n, tip: `${day(new Date(r.d))}: ${r.n}곳 등록` }));
  const lastWeekRegs = d.regs.filter((r) => now.getTime() - new Date(r.d).getTime() < 7 * 86_400_000).reduce((s, r) => s + r.n, 0);

  // Who is registered: region x ruleset x faction
  const split = new Map<string, number>();
  for (const g of live) split.set(`${g.region}|${g.ruleset ?? "-"}|${g.faction ?? "-"}`, (split.get(`${g.region}|${g.ruleset ?? "-"}|${g.faction ?? "-"}`) ?? 0) + 1);
  const splitRows = [...split].sort((a, b) => b[1] - a[1]).map(([k, n]) => {
    const [r, s, f] = k.split("|");
    return `<tr><td>${REGION[r] ?? r}</td><td>${RULESET[s] ?? "—"}</td><td>${FACTION[f] ?? "—"}</td><td class="n">${n}</td></tr>`;
  }).join("");

  // Collection health per day, all regions together
  const byDay = new Map<string, { calls: number; failed: number; minutes: number; runs: number }>();
  for (const r of d.runs) {
    const k = day(new Date(r.d));
    const x = byDay.get(k) ?? { calls: 0, failed: 0, minutes: 0, runs: 0 };
    x.calls += r.api_calls; x.failed += r.failed_calls; x.runs++;
    if (r.finished_at) x.minutes += (r.finished_at.getTime() - r.started_at.getTime()) / 60000;
    byDay.set(k, x);
  }
  const health = [...byDay].map(([label, x]) => ({ label, value: x.calls ? x.failed / x.calls : 0, tip: `${label}: 실패 ${num(x.failed)} / 호출 ${num(x.calls)} (${pct(x.calls ? x.failed / x.calls : 0)}), ${Math.round(x.minutes)}분` }));
  const lastRun = d.runs.filter((r) => r.finished_at).at(-1);
  const unfinished = d.runs.filter((r) => !r.finished_at && now.getTime() - r.started_at.getTime() > 3 * 3600_000).length;
  const lastHealth = health.at(-1);
  const stale = !lastRun || now.getTime() - lastRun.finished_at.getTime() > 26 * 3600_000;

  const waiting = d.requests.filter((r) => r.status === "received");
  const waitingGuild = waiting.filter((r) => r.kind !== "character").reduce((s, r) => s + r.n, 0);
  const handled = d.requests.filter((r) => r.status !== "received").reduce((s, r) => s + r.n, 0);

  // Weeks: the open week and the last closed one per region
  const weekRows = [...new Set(d.weeks.map((w) => `${w.region}|${w.number}|${w.status}`))].map((k) => {
    const [region, number, status] = k.split("|");
    const rows = d.weeks.filter((w) => w.region === region && String(w.number) === number);
    const ranked = (l: string) => rows.filter((r) => r.gstatus === "ranked" && r.league === l).reduce((s, r) => s + r.n, 0);
    const other = (s: string) => rows.filter((r) => r.gstatus === s).reduce((t, r) => t + r.n, 0);
    return `<tr><td>${REGION[region]}</td><td>${number}주차 ${status === "closed" ? "마감" : "진행"}</td>`
      + ["small", "medium", "large"].map((l) => `<td class="n">${ranked(l)}</td>`).join("")
      + `<td class="n">${other("too_few_active")}</td><td class="n">${other("pending")}</td></tr>`;
  }).join("");

  const mapRows = d.maps.map((m) => `<tr><td>${REGION[m.region]} ${RULESET[m.ruleset]}</td><td>시즌 ${m.season} · ${m.number}주차</td>`
    + `<td class="n">${pct(m.held / m.cells)}</td><td class="n">${m.lords}</td><td class="n">${num(m.claimed)}</td><td class="n">${num(m.captured)}</td></tr>`).join("");

  // Last 7 Korean days of daily unique visitors, summed
  const weekVisitors = d.visits.slice(-7).reduce((t, v) => t + v.n, 0);
  const visitBars = d.visits.map((v) => ({ label: day(v.d), value: v.n, tip: `${day(v.d)} · 방문자 ${num(v.n)}명 · 길드 페이지 ${num(v.guild_views)}회` }));
  const topRows = d.topGuilds.map((g) => `<tr><td>${esc(g.name)}</td><td>${REGION[g.region]}</td><td class="n">${num(g.n)}</td></tr>`).join("");

  const posts = community.map((p) => `<tr><td>${esc(p.date)}</td><td>${esc(p.board)}</td><td><a href="${esc(p.url)}">${esc(p.title)}</a></td>`
    + `<td class="n">${num(p.views)}</td><td class="n">${num(p.likes)}</td><td class="n">${num(p.comments)}</td></tr>`).join("");

  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Guild March 운영 계기판</title><style>
:root { --bg:#14110d; --panel:#1f1a14; --line:#3a3125; --ink:#eee4cf; --dim:#a89c84; --gold:#d0a94f; --good:#5fbf6a; --warn:#e0a63a; --bad:#e0644e; }
* { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.55 "Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif; }
main { max-width:1080px; margin:0 auto; padding:24px 16px 60px; }
h1 { margin:0; font-size:24px; } h2 { margin:34px 0 12px; font-size:17px; color:var(--gold); }
.meta { margin:4px 0 0; color:var(--dim); font-size:13px; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; }
.tile { background:var(--panel); border:1px solid var(--line); border-radius:6px; padding:12px 14px; display:flex; flex-direction:column; gap:2px; }
.tile-label { font-size:12.5px; color:var(--dim); } .tile strong { font-size:26px; font-variant-numeric:tabular-nums; } .tile small { font-size:12.5px; color:var(--dim); }
.tile.is-bad { border-color:var(--bad); } .tile.is-bad strong { color:var(--bad); } .tile.is-warn { border-color:var(--warn); }
.panel { background:var(--panel); border:1px solid var(--line); border-radius:6px; padding:14px 16px; }
.go { margin-bottom:12px; } .go-head { display:flex; flex-wrap:wrap; gap:4px 12px; align-items:baseline; } .go-head strong { margin-left:auto; font-variant-numeric:tabular-nums; } .go-head em { font-style:normal; color:var(--dim); font-size:13px; min-width:70px; text-align:right; }
.go-track { height:10px; border-radius:5px; background:#2c251c; margin-top:6px; overflow:hidden; } .go-track span { display:block; height:100%; background:var(--gold); border-radius:5px; }
.go.is-met .go-track span { background:var(--good); } .go.is-met em { color:var(--good); }
table { width:100%; border-collapse:collapse; font-size:14px; } th,td { padding:7px 8px; border-bottom:1px solid var(--line); text-align:left; } th { color:var(--dim); font-weight:600; font-size:12.5px; } .n { text-align:right; font-variant-numeric:tabular-nums; }
a { color:var(--gold); } .two { display:grid; grid-template-columns:1fr 1fr; gap:14px; } @media (max-width:760px) { .two { grid-template-columns:1fr; } }
.chart { width:100%; height:auto; display:block; } .axis { stroke:var(--line); } .bar { fill:var(--gold); } .line { fill:none; stroke:var(--gold); stroke-width:2; } .dot { fill:var(--gold); stroke:var(--panel); stroke-width:2; }
.tick { fill:var(--dim); font-size:11px; } .value { fill:var(--ink); font-size:12px; font-weight:700; } .empty, .later { color:var(--dim); font-size:14px; } .later { border:1px dashed var(--line); border-radius:6px; padding:12px 14px; }
</style></head><body><main>
<h1>Guild March 운영 계기판</h1>
<p class="meta">${stamp(now)} 기준(한국 시간) · 매일 08:00 갱신 뒤 다시 만듭니다 · 본인만 보는 페이지</p>

<h2>12/3 Go/No-Go (셋 중 둘)</h2>
<div class="panel">
${goBar("등록 길드", live.length, GO.guilds, (n) => `${num(n)}곳`)}
${goBar("다음 주차 재방문", null, GO.revisit, (n) => pct(n), "2단계: 방문 분석 연결 뒤")}
${goBar("주간 방문자", d.visits.length ? weekVisitors : null, GO.visitors, (n) => `${num(n)}명`, "방문 기록 표를 만든 뒤부터")}
</div>

<h2>방문</h2>
<div class="two"><div class="panel"><p class="meta">하루 방문자(최근 30일, 쿠키 없는 하루 고유 수)</p>${bars(visitBars)}</div>
<div class="panel"><p class="meta">많이 본 길드(최근 7일, 방문자 수)</p><table><tbody>${topRows || `<tr><td class="empty">아직 기록이 없습니다.</td></tr>`}</tbody></table></div></div>

<h2>오늘 상태</h2>
<div class="grid">
${tile("등록 길드", `${num(live.length)}곳`, `최근 7일 +${lastWeekRegs} · 추적 중 ${tracked}`)}
${tile("추적 캐릭터", num(d.chars), "명단에서 30일 지나면 삭제")}
${tile("마지막 수집", lastRun ? stamp(lastRun.finished_at) : "없음", stale ? "26시간 넘게 성공 없음" : "정상", stale ? "is-bad" : "")}
${tile("어제 수집 실패율", lastHealth ? pct(lastHealth.value) : "—", unfinished ? `끝나지 않은 수집 ${unfinished}건` : "호출 대비 실패", (lastHealth?.value ?? 0) > 0.05 || unfinished ? "is-warn" : "")}
${tile("확인 대기 요청", `${waitingGuild}건`, `길드 제외·정정 · 처리 완료 ${handled}건`, waitingGuild ? "is-warn" : "")}
</div>

<h2>등록 추이</h2>
<div class="two"><div class="panel"><p class="meta">누적 등록 길드</p>${line(cumulative)}</div>
<div class="panel"><p class="meta">일별 등록(최근 30일)</p>${bars(daily)}</div></div>

<h2>등록 길드 분포</h2>
<div class="panel"><table><thead><tr><th>지역</th><th>룰셋</th><th>진영</th><th class="n">길드</th></tr></thead><tbody>${splitRows || `<tr><td colspan="4" class="empty">없음</td></tr>`}</tbody></table></div>

<h2>주차와 리그</h2>
<div class="panel"><table><thead><tr><th>지역</th><th>주차</th><th class="n">소 리그</th><th class="n">중 리그</th><th class="n">대 리그</th><th class="n">인원 부족</th><th class="n">집계 대기</th></tr></thead><tbody>${weekRows || `<tr><td colspan="7" class="empty">아직 주차가 없습니다(첫 주차 11/19).</td></tr>`}</tbody></table>
<p class="meta">리그마다 길드가 몇 곳 안 되면 리그 통합(R-3)을 검토합니다.</p></div>

<h2>영토</h2>
<div class="panel"><table><thead><tr><th>지도</th><th>최근 마감</th><th class="n">찬 땅</th><th class="n">영주 지역</th><th class="n">새로 차지</th><th class="n">빼앗음</th></tr></thead><tbody>${mapRows || `<tr><td colspan="6" class="empty">첫 마감(11/26) 뒤에 생깁니다.</td></tr>`}</tbody></table></div>

<h2>수집 건강</h2>
<div class="panel"><p class="meta">일별 호출 대비 실패율(최근 30일). 막대에 마우스를 올리면 호출 수와 걸린 시간이 보입니다.</p>${bars(health.map((h) => ({ ...h, value: Math.round(h.value * 1000) / 10 })))}</div>

<h2>커뮤니티 글 반응</h2>
<div class="panel"><table><thead><tr><th>날짜</th><th>게시판</th><th>글</th><th class="n">조회</th><th class="n">추천</th><th class="n">댓글</th></tr></thead><tbody>${posts || `<tr><td colspan="6" class="empty">아직 올린 글이 없습니다. ops/community.json에 적으면 여기에 나옵니다.</td></tr>`}</tbody></table></div>

<h2>2단계에서 붙일 것</h2>
<div class="later">주간 방문자·유입 경로·길드 페이지 재방문(Cloudflare Web Analytics), 검색어 묶음별 노출·클릭과 실제 색인 수(Search Console), AI 답변 언급·근거·인용(Gemini). 계정이 준비되면 이 자리에 들어옵니다.</div>
</main></body></html>`;
  mkdirSync(OUT, { recursive: true });
  writeFileSync(new URL("index.html", OUT), html);
  writeFileSync(new URL("robots.txt", OUT), "User-agent: *\nDisallow: /\n");
  // The password gate; with _worker.js in the folder, Pages runs it in front of every file
  copyFileSync(new URL("./worker.js", import.meta.url), new URL("_worker.js", OUT));
  console.log(`ops: ${live.length} guilds, ${d.runs.length} runs in 30 days`);
}

await main();
