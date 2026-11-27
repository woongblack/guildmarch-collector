import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InsightChart } from "@/components/InsightCharts";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { isLang, locales, t } from "@/lib/i18n";
import { insightBySlug, insights, surveyTotals } from "@/lib/insights";
import { pageMeta, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return insights.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const x = insightBySlug(slug);
  if (!isLang(lang) || !x) return {};
  const text = x.text[lang];
  return pageMeta(lang, `/insights/${slug}/`, `${text.title} · ${t(lang).siteName}`, text.description, {
    image: `/og/${lang}/insights/${slug}.jpg`,
    article: { published: x.date, modified: x.updated },
  });
}

// A data report (owner's choice: content on the site, not forum posts)
export default async function InsightPage({ params }: Props) {
  const { lang, slug } = await params;
  const x = insightBySlug(slug);
  if (!isLang(lang) || !x) notFound();
  const dict = t(lang);
  const d = dict.insights;
  const text = x.text[lang];
  const data = x.file ? surveyTotals(x.file) : null;
  const url = `${SITE_URL}/${lang}/insights/${slug}/`;
  const date = new Intl.DateTimeFormat(locales[lang].intl, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(x.date));
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: text.title,
        description: text.description,
        inLanguage: locales[lang].hreflang,
        datePublished: x.date,
        dateModified: x.updated ?? x.date,
        image: `${SITE_URL}/og/${lang}/insights/${slug}.jpg`,
        mainEntityOfPage: url,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      // Each section heading is a question and its paragraphs the answer, as on the answer pages (R-48)
      {
        "@type": "FAQPage",
        inLanguage: locales[lang].hreflang,
        mainEntity: text.sections.map((s) => ({ "@type": "Question", name: s.h, acceptedAnswer: { "@type": "Answer", text: s.p.join(lang === "zh-tw" ? "" : " ") } })),
      },
    ],
  };

  return (
    <SiteShell lang={lang} path={`/insights/${slug}/`} scene="lore-archive-raid" breadcrumb={text.title}>
      <JsonLd data={ld} />
      <main className="page page-narrow insight-page">
        <div className="page-head">
          <p className="page-kicker"><Link href={`/${lang}/insights/`}>{d.title}</Link> · {d.published(date)}</p>
          <h1>{text.title}</h1>
          <p className="page-lead">{text.lead}</p>
        </div>
        <article className="questlog guide">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            {text.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.chart && data && <InsightChart lang={lang} kind={s.chart} data={data} />}
                {s.p.map((p) => <p key={p} className="answer-text">{p}</p>)}
                {s.table && (
                  <div className="pop-scroll">
                    <table className="pop-table">
                      <thead><tr>{s.table.head.map((c, i) => <th key={c} scope="col" className={i ? "num" : undefined}>{c}</th>)}</tr></thead>
                      <tbody>
                        {s.table.rows.map((row) => (
                          <tr key={row[0]}>{row.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i} className="num">{c}</td>))}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
            <section>
              {text.close.map((p) => <p key={p} className="answer-text">{p}</p>)}
            </section>
            <section className="insight-method">
              <h2>{d.method}</h2>
              <ul>{text.method.map((m) => <li key={m}>{m}</li>)}</ul>
              <p className="insight-source">{d.source}</p>
            </section>
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
