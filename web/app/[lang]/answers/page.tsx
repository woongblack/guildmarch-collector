import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import { answerBySlug, answerCategories } from "@/lib/answers";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/answers/", `${d.meta.pageTitles.answers} · ${d.siteName}`, d.answers.meta);
}

export default async function Answers({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = t(lang).answers;

  return (
    <SiteShell lang={lang} path="/answers/" scene="crossroads-waystone">
      <main className="page page-narrow">
        <PageHead title={d.title} lead={d.lead} />
        {answerCategories.map((c) => (
          <section key={c.id} className="answer-group" aria-labelledby={`cat-${c.id}`}>
            <h2 className="answer-group-title" id={`cat-${c.id}`}>
              <img src={`/images/glossary/cat-${c.id}-64.webp`} srcSet={`/images/glossary/cat-${c.id}-128.webp 2x`} alt="" width={44} height={44} />
              {d.categories[c.id]}
            </h2>
            <ul className="answer-list">
              {c.slugs.map((slug) => answerBySlug(slug)!).map((a) => (
                <li key={a.slug} className="frame">
                  <h3><Link href={`/${lang}/answers/${a.slug}/`}>{a.text[lang].title}</Link></h3>
                  <p>{a.text[lang].summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </SiteShell>
  );
}
