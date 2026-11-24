import Link from "next/link";
import type { ReactNode } from "react";
import { langs, locales, t, type Lang } from "@/lib/i18n";
import { pageName, SITE_URL } from "@/lib/site";
import { JsonLd } from "./JsonLd";
import { ViewBeacon } from "./Live";

// The sixteen battle scenes in public/images/scenes; each page or page group has its own (see ASSETS.md)
export type Scene =
  | "fortress-gate-assault"
  | "stone-bridge-clash"
  | "forest-ambush"
  | "snow-pass-skirmish"
  | "harbor-dock-raid"
  | "canyon-banner-capture"
  | "ruined-courtyard-duel"
  | "camp-defense"
  | "island-guild-tournament"
  | "valley-guild-war"
  | "lore-archive-raid"
  | "crossroads-waystone"
  | "hall-of-banners"
  | "border-cairns"
  | "clocktower-square"
  | "river-ford-camps";

// Population is the page most searches land on, so it sits in the top bar too (R-48)
const menu = ["guilds", "map", "population", "factions", "insights", "guide"] as const;
// Footer: the reference pages, so every page links to every hub
const footerLinks = [
  ["guide", "guide"], ["answers", "answers"], ["glossary", "glossary"], ["tiers", "tiers"], ["badges", "badges"],
  ["boards", "ranks"], ["population", "population"], ["weeks", "weeks"], ["reports", "reports"], ["characters", "characters"], ["optOut", "opt-out"],
] as const;
// Second row: who runs the site and the policies (R-34)
const siteLinks = [["about", "about"], ["contact", "contact"], ["privacy", "privacy"], ["terms", "terms"]] as const;

// path is the page's path after the language segment, such as "/guide/"; guild is set on guild pages
// so the view counts for that guild in the live strip. breadcrumb names a page below a section for
// the BreadcrumbList; false leaves it to a page that writes its own
export function SiteShell({ lang, path, scene, dim = true, guild, breadcrumb, children }: {
  lang: Lang;
  path: string;
  scene: Scene;
  dim?: boolean;
  guild?: string;
  breadcrumb?: string | false;
  children: ReactNode;
}) {
  const d = t(lang);
  const here = (p: string) => (path === p ? "page" : undefined);
  // Home > section > page on every page, so search engines see the same structure as the menu
  const section = `/${path.split("/")[1]}/`;
  const sectionName = pageName(lang, section);
  const crumbs = breadcrumb === false || path === "/" || sectionName === section ? null : [
    { name: d.siteName, path: "/" },
    { name: sectionName, path: section },
    ...(path !== section && breadcrumb ? [{ name: breadcrumb, path }] : []),
  ];

  return (
    <>
      <ViewBeacon lang={lang} guild={guild} />
      {crumbs && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE_URL}/${lang}${c.path}` })),
        }} />
      )}
      <div
        className={dim ? "world is-dim" : "world"}
        style={{ backgroundImage: `url("/images/scenes/${scene}.webp")` }}
        aria-hidden="true"
      />
      <header className="topbar">
        <Link className="wordmark" href={`/${lang}/`}>
          <img className="wordmark-mark" src="/images/logo/logo-mark-96.webp" alt="" width={36} height={36} />
          {d.siteName}
        </Link>
        <nav className="sitenav" aria-label={d.site.menu}>
          <Link href={`/${lang}/`} aria-current={here("/")}>{d.site.home}</Link>
          {menu.map((m) => (
            <Link key={m} href={`/${lang}/${m}/`} aria-current={here(`/${m}/`)}>{d.site[m]}</Link>
          ))}
          <Link className="sitenav-cta" href={`/${lang}/register/`} aria-current={here("/register/")}>{d.site.register}</Link>
        </nav>
        <nav className="lang-links" aria-label={d.site.language}>
          {langs.filter((l) => l !== lang).map((l) => (
            <Link key={l} className="lang-link" href={`/${l}${path}`} hrefLang={locales[l].hreflang} lang={locales[l].html}>{locales[l].name}</Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="footer">
        <p>{d.footer}</p>
        <p>
          {d.credits.icons}: {d.credits.iconsBy} (<a href="https://game-icons.net">game-icons.net</a>,{" "}
          <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>) · {d.credits.textures}:{" "}
          <a href="https://polyhaven.com">Poly Haven</a> (CC0)
        </p>
        <p>{d.credits.art}</p>
        <p className="footer-links">
          {footerLinks.map(([label, slug], i) => (
            <span key={slug}>{i > 0 && " · "}<Link href={`/${lang}/${slug}/`}>{d.site[label]}</Link></span>
          ))}
        </p>
        <p className="footer-links">
          {siteLinks.map(([label, slug], i) => (
            <span key={slug}>{i > 0 && " · "}<Link href={`/${lang}/${slug}/`}>{d.site[label]}</Link></span>
          ))}
        </p>
      </footer>
    </>
  );
}

// Title block shared by the inner pages
export function PageHead({ title, lead, sample }: { title: string; lead: string; sample?: string }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      <p className="page-lead">{lead}</p>
      {sample && <p className="page-sample">{sample}</p>}
    </div>
  );
}
