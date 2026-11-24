import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { isLang, locales, t } from "@/lib/i18n";
import { answerBySlug, answers, categoryOf } from "@/lib/answers";
import { pageMeta, pageName, SITE_URL } from "@/lib/site";

// Answers about how ranks work, where a link to the ranks themselves helps most
const RANK_QUESTIONS = new Set(["how-ranking-works", "small-guild-chance", "raise-weekly-score", "pvp-vs-normal-realms"]);

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return answers.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = answerBySlug(slug);
  if (!isLang(lang) || !a) return {};
  const x = a.text[lang];
  return pageMeta(lang, `/answers/${slug}/`, `${x.title} · ${t(lang).siteName}`, x.summary, { image: `/og/${lang}/answers/${slug}.jpg` });
}

// The answer comes first in a short paragraph, so search and answer engines can quote it whole
export default async function AnswerPage({ params }: Props) {
  const { lang, slug } = await params;
  const a = answerBySlug(slug);
  if (!isLang(lang) || !a) notFound();
  const dict = t(lang);
  const d = dict.answers;
  const x = a.text[lang];
  const url = `${SITE_URL}/${lang}/answers/${slug}/`;
  const updated = new Intl.DateTimeFormat(locales[lang].intl, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(a.updated));

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: x.title,
        description: x.summary,
        inLanguage: locales[lang].hreflang,
        datePublished: a.updated,
        dateModified: a.updated,
        mainEntityOfPage: url,
        image: `${SITE_URL}/og/${lang}/answers/${slug}.jpg`,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      // The page is a question and its answer, with each section a follow-up question (R-48)
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: x.title, acceptedAnswer: { "@type": "Answer", text: x.summary } },
          ...x.sections.map((s) => ({ "@type": "Question", name: s.h, acceptedAnswer: { "@type": "Answer", text: s.p.join(" ") } })),
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dict.siteName, item: `${SITE_URL}/${lang}/` },
          { "@type": "ListItem", position: 2, name: d.title, item: `${SITE_URL}/${lang}/answers/` },
          { "@type": "ListItem", position: 3, name: x.title, item: url },
        ],
      },
    ],
  };

  return (
    <SiteShell lang={lang} path={`/answers/${slug}/`} scene="crossroads-waystone" breadcrumb={false}>
      <JsonLd data={ld} />
      <main className="page page-narrow">
        <div className="page-head honor-head">
          <p className="page-kicker"><Link href={`/${lang}/answers/`}>{d.title}</Link> · {d.categories[categoryOf(slug)]}</p>
          <img className="honor-image honor-small" src={`/images/glossary/cat-${categoryOf(slug)}-128.webp`} alt="" width={64} height={64} />
          <h1>{x.title}</h1>
          <p className="page-lead">{x.summary}</p>
          <p className="answer-date"><time dateTime={a.updated}>{d.updated(updated)}</time></p>
          {/* People searching "guild ranks" land here; the ranks themselves are one click away */}
          {RANK_QUESTIONS.has(slug) && <p className="answer-cta"><Link className="btn" href={`/${lang}/`}>{d.seeRanks}</Link></p>}
        </div>
        <article className="questlog guide">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            {x.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p.map((p) => <p key={p} className="answer-text">{p}</p>)}
              </section>
            ))}
            <h2>{d.related}</h2>
            <ul className="answer-links">
              {a.related.map((p) => <li key={p}><Link href={`/${lang}${p}`}>{pageName(lang, p)}</Link></li>)}
              {answers.filter((o) => o.slug !== slug).map((o) => (
                <li key={o.slug}><Link href={`/${lang}/answers/${o.slug}/`}>{o.text[lang].title}</Link></li>
              ))}
            </ul>
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
