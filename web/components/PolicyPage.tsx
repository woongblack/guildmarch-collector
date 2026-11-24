import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { t, type Lang } from "@/lib/i18n";
import { policy, type PolicySlug } from "@/lib/policies";
import { SITE_URL } from "@/lib/site";

// [label](target) inside a paragraph: a site path gets the language prefix, anything else links out
function prose(lang: Lang, text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    out.push(text.slice(last, m.index));
    const [, label, href] = m;
    out.push(href.startsWith("/")
      ? <Link key={m.index} href={`/${lang}${href}`}>{label}</Link>
      : <a key={m.index} href={href} {...(href.startsWith("http") ? { rel: "noopener" } : {})}>{label}</a>);
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

// About, contact, privacy and terms share one parchment layout (R-34)
export function PolicyPage({ lang, slug }: { lang: Lang; slug: PolicySlug }) {
  const p = policy(lang, slug);
  const path = `/${slug}/`;
  const ld = {
    "@context": "https://schema.org",
    "@type": slug === "about" ? "AboutPage" : slug === "contact" ? "ContactPage" : "WebPage",
    name: p.title,
    description: p.description,
    url: `${SITE_URL}/${lang}${path}`,
    isPartOf: { "@id": `${SITE_URL}/#site` },
    publisher: { "@id": `${SITE_URL}/#org` },
  };
  return (
    <SiteShell lang={lang} path={path} scene="hall-of-banners">
      <JsonLd data={ld} />
      <main className="page page-narrow">
        <PageHead title={p.title} lead={p.lead} />
        <article className="questlog guide">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            {p.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p.map((x) => <p key={x} className="answer-text">{prose(lang, x)}</p>)}
              </section>
            ))}
          </div>
        </article>
      </main>
    </SiteShell>
  );
}

export const policyTitle = (lang: Lang, slug: PolicySlug) => `${policy(lang, slug).title} · ${t(lang).siteName}`;
