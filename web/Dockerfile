# The site image. Building it runs the checks and a mock-season build, so nothing broken ships;
# running it does the data step, the real build and the Cloudflare Pages deploy (scripts/release.sh).
# Used by .github/workflows/deploy.yml and daily.yml; the same image runs locally:
#   docker build -t guild-weekly-site web
#   docker run --rm -e DATABASE_URL -e PIPELINE=export -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID -e PAGES_PROJECT=guildmarch guild-weekly-site
FROM node:26.13.0-slim AS build
# Korean, Chinese and Japanese faces for the guild share cards drawn at build time (R-6)
RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-noto-cjk \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# A failing check stops the build; next build also type-checks
RUN node scripts/test-api.ts \
 && node scripts/test-territory.ts \
 && npm run build

FROM build AS deploy
ENV WRANGLER_SEND_METRICS=false
CMD ["sh", "scripts/release.sh"]
