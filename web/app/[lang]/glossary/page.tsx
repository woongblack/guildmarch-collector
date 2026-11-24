import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, locales, t } from "@/lib/i18n";
import { terms } from "@/lib/glossary";
import { pageMeta, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/glossary/", `${d.glossaryPage.title} · ${d.siteName}`, d.glossaryPage.meta);
}

// Every term, sorted for the page's language
export default async function Glossary({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = t(lang).glossaryPage;
  const sorted = [...terms].sort((a, b) => a.text[lang].term.localeCompare(b.text[lang].term, locales[lang].intl));
  const ld = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}/${lang}/glossary/`,
    name: d.title,
    inLanguage: locales[lang].hreflang,
    hasDefinedTerm: sorted.map((x) => ({ "@type": "DefinedTerm", name: x.text[lang].term, url: `${SITE_URL}/${lang}/glossary/${x.slug}/` })),
  };

  return (
    <SiteShell lang={lang} path="/glossary/" scene="lore-archive-raid">
      <JsonLd data={ld} />
      <main className="page page-narrow">
        <PageHead title={d.title} lead={d.lead} />
        <ul className="answer-list">
          {sorted.map((x) => (
            <li key={x.slug} className="frame term-card">
              <img src={`/images/glossary/${x.slug}-64.webp`} srcSet={`/images/glossary/${x.slug}-128.webp 2x`} alt="" width={52} height={52} />
              <div>
                <h2><Link href={`/${lang}/glossary/${x.slug}/`}>{x.text[lang].term}</Link></h2>
                <p>{x.text[lang].short}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}
