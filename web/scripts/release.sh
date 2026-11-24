#!/bin/sh
# What the site image runs: the data step PIPELINE asks for, the static build, then the Pages deploy.
#   PIPELINE=daily   collect, score and export (the 08:00 job)
#   PIPELINE=export  export only, so a code deploy keeps the real standings
#   unset            no DB: the mock season, for before launch
# The deploy is skipped without CLOUDFLARE_API_TOKEN.
set -eu

case "${PIPELINE:-}" in
  daily) node pipeline/daily.ts ;;
  export) node pipeline/daily.ts export ;;
  "") ;;
  *) echo "Unknown PIPELINE=$PIPELINE" >&2; exit 1 ;;
esac

# The live site's standings summary, so this build can say what changed since the last update
# (lib/digest.ts). Missing on the first run or offline; the site then just shows no changes.
# (The slim image has no curl, so node fetches it.)
mkdir -p data
node -e 'fetch(process.argv[1], { signal: AbortSignal.timeout(20000) }).then((r) => r.ok ? r.text() : Promise.reject(r.status)).then((t) => require("fs").writeFileSync("data/yesterday.json", t)).catch((e) => { console.log("no yesterday summary:", e); require("fs").rmSync("data/yesterday.json", { force: true }); })' "${SITE_URL:-https://guildmarch.com}/data/today.json"

npm run build

if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
  npx wrangler pages deploy out --project-name "$PAGES_PROJECT" --branch "${PAGES_BRANCH:-main}" --commit-dirty=true
  # R-39: the weekly Discord posts, once the pages they link to are live. Never fails the update.
  if [ "${PIPELINE:-}" = "daily" ]; then
    node pipeline/daily.ts discord || echo "discord: posts failed"
  fi
else
  echo "No CLOUDFLARE_API_TOKEN: built, not deployed."
fi

# The owner's dashboard (web/ops): its own Pages project, behind the id/password gate in
# ops/worker.js (locked until OPS_PASSWORD is set on that project). Only when OPS_PROJECT is set.
# Deployed from ops/ so the site's functions/ folder isn't picked up. A failure here never fails
# the site update.
if [ -n "${OPS_PROJECT:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  if node ops/build.ts && [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
    (cd ops && npx wrangler pages deploy out --project-name "$OPS_PROJECT" --branch main --commit-dirty=true) || echo "ops: deploy failed"
  else
    echo "ops: dashboard not deployed"
  fi
fi
