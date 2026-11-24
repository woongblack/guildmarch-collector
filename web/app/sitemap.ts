import type { MetadataRoute } from "next";
import { answers } from "@/lib/answers";
import { insights } from "@/lib/insights";
import { reportList, reportNotes } from "@/lib/report";
import { guildsSample, population, boardIndexable, boards, closedWeeks, factions, guildIds, guildIndexable, isSample, lastRun, placeIndexable, sideIndexable } from "@/lib/data";
import { terms } from "@/lib/glossary";
import { tierSlugs } from "@/lib/league";
import { regionSlugs } from "@/lib/map-regions";
import { langs } from "@/lib/i18n";
import { languageAlternates, SITE_URL } from "@/lib/site";

// Written at build time with each daily deploy. lastmod is the day a page's content last changed:
// the last run for data pages, the article date for reports and answers, and left out for pages
// whose text only changes with a code edit, so the daily build doesn't stamp every page as new.
export const dynamic = "force-static";

const badges = ["rank-1", "rank-2", "rank-3", "streak", "climber", "newcomer", "levels", "achievements", "honor", "season-leader", "continent-ruler", "unbroken-hold", "comeback"];
const pages = ["/", "/guilds/", "/map/", "/factions/", "/guide/", "/register/", "/opt-out/", "/answers/", "/about/", "/contact/", "/privacy/", "/terms/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const run = new Date(lastRun() ?? Date.now());
  // Each entry lists every language version, matching the hreflang links on the page
  const entry = (path: string, lastModified?: Date) =>
    langs.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: languageAlternates(path, SITE_URL) },
    }));
  const newest = (dates: string[]) => new Date(dates.reduce((a, b) => (a > b ? a : b)));
  const guilds = guildIds().filter((g) => guildIndexable(g.id)).map((g) => `/guild/${g.region}/${g.id}/`);
  // Data pages (regions, factions, past weeks, map regions) join once real data fills them; until then
  // they are noindex. Rules pages (answers, glossary, tiers, badges) are always listed.
  const ranked = boards().filter((b) => boardIndexable(b.region, b.ruleset)).map((b) => `/ranks/${b.slug}/`);
  const weeks = isSample() ? [] : closedWeeks().map((w) => `/weeks/${w}/`);
  // Reports join with the owner's notes (in any language); without them they repeat the tables
  const reports = isSample() ? [] : reportList().filter((r) => langs.some((l) => reportNotes(r.week, r.region, l).length)).map((r) => `/reports/${r.week}/${r.region}/`);
  const placed = boards().flatMap((b) => {
    const ruled = regionSlugs.filter((_, i) => placeIndexable(b.region, b.ruleset, i));
    return ruled.length ? [`/map/${b.slug}/`, ...ruled.map((x) => `/map/${b.slug}/${x}/`)] : [];
  });
  const data = [
    "/", "/guilds/", "/map/", "/factions/",
    ...(guildsSample() ? [] : ["/characters/"]),
    ...(population().some((g) => g.characters >= 100) ? ["/population/"] : []),
    ...population().filter((g) => g.characters >= 100).map((g) => `/population/${g.region}-${g.ruleset}/`),
    ...(reportList().length && !isSample() ? ["/reports/", ...reports] : []),
    ...(ranked.length ? ["/ranks/", ...ranked] : []),
    ...(weeks.length ? ["/weeks/", ...weeks] : []),
    ...boards().flatMap((b) => factions.filter((f) => sideIndexable(b.region, b.ruleset, f)).map((f) => `/ranks/${b.slug}/${f}/`)),
    ...placed,
    ...guilds,
  ];
  const fixed = [
    ...pages.filter((p) => !data.includes(p) && p !== "/answers/"),
    "/glossary/",
    ...terms.map((x) => `/glossary/${x.slug}/`),
    "/tiers/",
    ...tierSlugs.map((x) => `/tiers/${x}/`),
    "/badges/",
    ...badges.map((x) => `/badges/${x}/`),
  ];
  return [
    ...data.map((p) => entry(p, run)),
    ...entry("/insights/", newest(insights.map((x) => x.date))),
    ...insights.map((x) => entry(`/insights/${x.slug}/`, new Date(x.date))),
    ...entry("/answers/", newest(answers.map((a) => a.updated))),
    ...answers.map((a) => entry(`/answers/${a.slug}/`, new Date(a.updated))),
    ...fixed.map((p) => entry(p)),
  ].flat();
}
