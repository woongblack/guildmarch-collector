import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, locales, t } from "@/lib/i18n";
import { insights } from "@/lib/insights";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/insights/", `${d.meta.pageTitles.insights} · ${d.siteName}`, d.insights.meta);
}

// All data reports, newest first
export default async function Insights({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = t(lang).insights;
  const fmt = new Intl.DateTimeFormat(locales[lang].intl, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <SiteShell lang={lang} path="/insights/" scene="lore-archive-raid">
      <main className="page page-narrow">
        <PageHead title={d.title} lead={d.lead} />
        {[...insights].sort((a, b) => b.date.localeCompare(a.date)).map((x) => (
          <article key={x.slug} className="frame insight-card">
            <p className="page-kicker">{d.published(fmt.format(new Date(x.date)))}</p>
            <h2><Link href={`/${lang}/insights/${x.slug}/`}>{x.text[lang].title}</Link></h2>
            <p>{x.text[lang].lead}</p>
            <p><Link className="link-quiet" href={`/${lang}/insights/${x.slug}/`}>{d.read} →</Link></p>
          </article>
        ))}
      </main>
    </SiteShell>
  );
}
