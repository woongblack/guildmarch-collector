// Where the site lives and the metadata every page shares: its own canonical address, the
// language versions, and the link preview. Each page passes its own path, so no page inherits the home page's
// URL (a shared og:url made every shared link read as the home page on an earlier site).
import type { Metadata } from "next";
import { langs, locales, t, type Lang } from "./i18n.ts";

export const SITE_URL = "https://guildmarch.com";
// hreflang map for a path: every language version plus English as the default
export function languageAlternates(path: string, base = "") {
  return {
    ...Object.fromEntries(langs.map((l) => [locales[l].hreflang, `${base}/${l}${path}`])),
    "x-default": `${base}/en${path}`,
  };
}

// Link previews are 1200 x 630, made by scripts/make_images.py; each language has its own default
const ogImage = (url: string) => ({ url, width: 1200, height: 630 });

// path comes after the language segment and ends with a slash, like "/guide/"
export function pageMeta(
  lang: Lang,
  path: string,
  title: string,
  description: string,
  // article: dates of a dated article (the insights), the same strings as its Article JSON-LD
  opts: { noindex?: boolean; absoluteTitle?: boolean; image?: string; article?: { published: string; modified?: string } } = {},
): Metadata {
  const url = `/${lang}${path}`;
  const image = ogImage(opts.image ?? `/og/default-${lang}.jpg`);
  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    // hreflang only on indexable pages: an alternate set pointing at noindex pages sends mixed signals
    alternates: opts.noindex ? { canonical: url } : { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      ...(opts.article
        ? { type: "article" as const, publishedTime: opts.article.published, modifiedTime: opts.article.modified ?? opts.article.published }
        : { type: "website" as const }),
      url,
      title,
      description,
      siteName: t(lang).siteName,
      locale: locales[lang].og,
      alternateLocale: langs.filter((l) => l !== lang).map((l) => locales[l].og),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    // Indexed pages allow the large image preview: without it Discover and search show no big thumbnail
    robots: opts.noindex ? { index: false, follow: true } : { "max-image-preview": "large" },
  };
}

// Spellings people type for the name, so a one-word search still finds the site
const altNames = ["Guildmarch", "GuildMarch"];

// The site as an entity: the same name, logo and address everywhere. Google reads the site name
// and icon for the whole domain, so WebSite names the bare address rather than one language
export function siteJsonLd(lang: Lang) {
  const d = t(lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: "Guild March",
        alternateName: altNames,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo/logo-mark-512.webp`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: d.siteName,
        alternateName: altNames,
        url: `${SITE_URL}/`,
        inLanguage: langs.map((l) => locales[l].hreflang),
        description: d.meta.home,
        publisher: { "@id": `${SITE_URL}/#org` },
      },
    ],
  };
}

// Names for the related links: the menu label of each page
export function pageName(lang: Lang, path: string) {
  const s = t(lang).site;
  const names: Record<string, string> = {
    "/": s.home, "/guide/": s.guide, "/ranks/": s.boards, "/map/": s.map, "/factions/": s.factions,
    "/guilds/": s.guilds, "/register/": s.register, "/weeks/": s.weeks, "/opt-out/": s.optOut,
    "/glossary/": s.glossary, "/answers/": s.answers, "/reports/": s.reports, "/characters/": s.characters, "/insights/": s.insights, "/population/": s.population, "/tiers/": s.tiers, "/badges/": s.badges,
    "/about/": s.about, "/contact/": s.contact, "/privacy/": s.privacy, "/terms/": s.terms,
  };
  return names[path] ?? path;
}
