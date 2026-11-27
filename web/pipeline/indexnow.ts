// After a deploy, tell IndexNow search engines (Bing, Naver, Yandex, Seznam and others share one
// endpoint) which pages are new or changed, so they crawl them within days instead of waiting for
// the sitemap. Google doesn't take IndexNow; it reads the sitemap.
// Changed means: in the new sitemap but not in the one live before this deploy, or with a newer
// lastmod. scripts/release.sh saves the old one to data/live-sitemap.xml before deploying.
//   node pipeline/indexnow.ts        changed pages only (run by release.sh)
//   node pipeline/indexnow.ts all    every page in out/sitemap.xml (once, by hand)
// The key is public by design: the engines fetch public/<key>.txt to check this site sent the list.
// Never fails the update.
import { existsSync, readFileSync } from "node:fs";

const KEY = "3d2a01c837dd8ea77ea40363d19fceb6";
const HOST = "guildmarch.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
// IndexNow takes up to 10,000 URLs per request
const BATCH = 10_000;

const OUT = new URL("../out/sitemap.xml", import.meta.url);
const LIVE = new URL("../data/live-sitemap.xml", import.meta.url);
const KEY_FILE = new URL(`../out/${KEY}.txt`, import.meta.url);

// loc -> lastmod ("" when the entry has none)
export function parseSitemap(xml: string) {
  const pages = new Map<string, string>();
  for (const [, body] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = body.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    if (loc) pages.set(loc, body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? "");
  }
  return pages;
}

export function changedPages(next: Map<string, string>, live: Map<string, string>) {
  return [...next].filter(([loc, mod]) => !live.has(loc) || (mod !== "" && mod > live.get(loc)!)).map(([loc]) => loc);
}

async function main() {
  const all = process.argv[2] === "all";
  if (!existsSync(OUT)) return console.log("indexnow: no out/sitemap.xml");
  if (!existsSync(KEY_FILE)) return console.log("indexnow: key file missing from out/, nothing sent");
  const next = parseSitemap(readFileSync(OUT, "utf8"));
  let urls: string[];
  if (all) urls = [...next.keys()];
  else if (!existsSync(LIVE)) return console.log("indexnow: no copy of the previous sitemap, nothing sent");
  else urls = changedPages(next, parseSitemap(readFileSync(LIVE, "utf8")));
  urls = urls.filter((u) => new URL(u).host === HOST);
  if (!urls.length) return console.log("indexnow: no changed pages");

  for (let i = 0; i < urls.length; i += BATCH) {
    const urlList = urls.slice(i, i + BATCH);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(30_000),
    });
    // 200 and 202 are both accepted; 202 means the key check is still pending
    console.log(`indexnow: ${urlList.length} pages, ${res.status} ${res.ok ? "accepted" : (await res.text()).slice(0, 200)}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => console.log("indexnow: failed", (e as Error).message));
}
