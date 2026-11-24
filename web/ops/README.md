# 운영 계기판 (작성자 전용)

`Growth_Plan.md` 5장의 계기판. 매일 갱신 작업 끝에 DB에서 숫자를 읽어 HTML 한 장(`ops/out/index.html`)을 만들고, 공개 사이트와 다른 Cloudflare Pages 프로젝트에 올린다. 들어가면 브라우저가 아이디·비밀번호를 묻는다(geo.avatarcoach.kr의 nginx 기본 인증과 같은 방식, 서버 없이 `ops/worker.js`가 한다). 회사의 노출 계기판(`nscreen-geo`)과는 코드도 데이터도 나누어 둔다(개인 프로젝트).

- 만들기: `cd web && DATABASE_URL=... node ops/build.ts` (로컬 DB로도 된다)
- 배포: `scripts/release.sh`가 `OPS_PROJECT`가 있을 때만 만들고 올린다. 실패해도 사이트 갱신은 멈추지 않는다
- 커뮤니티 글 반응: `ops/community.json`에 손으로 적는다(목요일마다 조회·추천·댓글 갱신)

## 처음 한 번 (작성자)

1. Pages 프로젝트 만들기: `cd web && npx wrangler pages project create guildmarch-ops --production-branch main`
2. 비밀번호 넣기: `cd web && npx wrangler pages secret put OPS_PASSWORD --project-name guildmarch-ops` → 터미널에 직접 입력한다(채팅·파일에 적지 않는다)
3. (선택) 아이디 바꾸기: 기본 아이디는 `owner`. 바꾸려면 같은 방법으로 `OPS_USER`를 넣는다
4. GitHub 저장소 → Settings → Secrets and variables → Actions → Variables → **`OPS_PROJECT` = `guildmarch-ops`** 추가
5. Actions에서 Daily update를 한 번 손으로 돌리거나 다음 08:00를 기다린다. 주소는 `https://guildmarch-ops.pages.dev`

순서가 바뀌어도 공개되지 않는다: `OPS_PASSWORD`가 없으면 모든 주소가 잠김(503) 응답을 낸다. 비밀번호를 바꾸면 다음 배포부터 적용되므로, 바꾼 뒤 Daily update를 한 번 돌린다.

(선택) 사용자 지정 도메인 `ops.guildmarch.com`을 붙여도 같은 비밀번호가 걸린다.

## 검색·AI 노출은 여기 없다

검색어·색인·방문·AI 답변 지표는 작성자 맥의 `~/site-watch`(guildmarch·amacoffee 함께 보는 로컬 계기판)로 옮겼다(2026-11-15). 이 계기판은 운영 숫자만 맡는다.
