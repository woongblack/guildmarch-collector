import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { isLang, locales, t } from "@/lib/i18n";
import { termBySlug, terms } from "@/lib/glossary";
import { pageMeta, pageName, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ lang: string; term: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return terms.map((x) => ({ term: x.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, term } = await params;
  const x = termBySlug(term);
  if (!isLang(lang) || !x) return {};
  const d = t(lang);
  return pageMeta(lang, `/glossary/${term}/`, `${x.text[lang].term} · ${d.glossaryPage.title} · ${d.siteName}`, x.text[lang].short, {
    image: `/og/${lang}/glossary/${term}.jpg`,
  });
}

// The definition first in one or two sentences, then how the rule works; DefinedTerm for search
export default async function TermPage({ params }: Props) {
  const { lang, term } = await params;
  const x = termBySlug(term);
  if (!isLang(lang) || !x) notFound();
  const dict = t(lang);
  const d = dict.glossaryPage;
  const text = x.text[lang];
  const url = `${SITE_URL}/${lang}/glossary/${term}/`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: text.term,
        description: text.short,
        url,
        inLanguage: locales[lang].hreflang,
        inDefinedTermSet: `${SITE_URL}/${lang}/glossary/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dict.siteName, item: `${SITE_URL}/${lang}/` },
          { "@type": "ListItem", position: 2, name: d.title, item: `${SITE_URL}/${lang}/glossary/` },
          { "@type": "ListItem", position: 3, name: text.term, item: url },
        ],
      },
    ],
  };

  return (
    <SiteShell lang={lang} path={`/glossary/${term}/`} scene="lore-archive-raid" breadcrumb={false}>
      <JsonLd data={ld} />
      <main className="page page-narrow">
        <div className="page-head honor-head">
          <p className="page-kicker"><Link href={`/${lang}/glossary/`}>{d.title}</Link></p>
          <img className="honor-image" src={`/images/glossary/${term}-128.webp`} alt="" width={96} height={96} />
          <h1>{text.term}</h1>
          <p className="page-lead">{text.short}</p>
        </div>
        <article className="questlog guide">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            <section>
              {text.body.map((p) => <p key={p} className="answer-text">{p}</p>)}
            </section>
            <h2>{d.related}</h2>
            <ul className="answer-links">
              {x.related.map((r) => termBySlug(r)).filter((r) => r !== null).map((r) => (
                <li key={r.slug}><Link href={`/${lang}/glossary/${r.slug}/`}>{r.text[lang].term}</Link></li>
              ))}
            </ul>
            <h2>{d.pages}</h2>
            <ul className="answer-links">
              {x.links.map((p) => <li key={p}><Link href={`/${lang}${p}`}>{pageName(lang, p)}</Link></li>)}
            </ul>
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
