// Prints the words the preview images need, per language, as JSON for scripts/make_images.py.
// Run from web/: node scripts/og-text.ts > /tmp/og-text.json
import { answers, categoryOf } from "../lib/answers.ts";
import { terms } from "../lib/glossary.ts";
import { langs, t } from "../lib/i18n.ts";
import { RULES, tierSlugs } from "../lib/league.ts";
import { regionNames, regionSlugs } from "../lib/map-regions.ts";
import { marchesFor } from "../lib/territory.ts";

const weekly = ["rank-1", "rank-2", "rank-3", "streak", "climber", "newcomer", "levels", "achievements", "honor"] as const;

const out = Object.fromEntries(langs.map((lang) => {
  const d = t(lang);
  return [lang, {
    siteName: d.siteName,
    tagline: d.meta.homeTitle.split(" — ")[1],
    kickers: { answers: d.answers.title, glossary: d.glossaryPage.title, tiers: d.honors.tiersTitle, badges: d.honors.badgesTitle, map: d.mapPage.title },
    tiers: tierSlugs.map((slug, i) => ({
      slug,
      name: d.tiers.names[i],
      sub: `${i === 0 ? d.tiers.rest : d.tiers.top(Math.round(RULES.tierCuts[i] * 100))} · ${d.honors.marchShort(marchesFor(i + 1))}`,
    })),
    badges: [
      ...weekly.map((b) => ({ id: b, name: d.badges[b], sub: d.guidePage.badgeRules[b] })),
      ...d.mapPage.seasonRewards.map((r) => ({ id: r.id, name: r.name, sub: r.rule })),
    ],
    answers: answers.map((a) => ({ slug: a.slug, title: a.text[lang].title, category: categoryOf(a.slug) })),
    terms: terms.map((x) => ({ slug: x.slug, title: x.text[lang].term, sub: x.text[lang].short })),
    regions: regionNames(lang).map((name, i) => ({ slug: regionSlugs[i], name })),
  }];
}));
console.log(JSON.stringify(out));
