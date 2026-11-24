import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isSample } from "@/lib/data";
import { isLang, t } from "@/lib/i18n";
import { reportList } from "@/lib/report";
import { pageMeta } from "@/lib/site";
import { weekRange } from "@/lib/weeks";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/reports/", `${d.reports.title} · ${d.siteName}`, d.reports.meta, { noindex: isSample() || !reportList().length });
}

// Every weekly report, newest week first (R-35)
export default async function Reports({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.reports;
  const list = reportList();
  const weeks = [...new Set(list.map((r) => r.week))].sort((a, b) => b - a);

  return (
    <SiteShell lang={lang} path="/reports/" scene="lore-archive-raid">
      <main className="page page-narrow">
        <PageHead title={d.title} lead={d.lead} sample={isSample() ? dict.site.sample : undefined} />
        {!weeks.length && <div className="frame"><EmptyState text={d.none} /></div>}
        {weeks.map((w) => (
          <section key={w} className="frame report-week">
            <h2 className="frame-plate">{dict.weeks.weekTitle(w)}</h2>
            <p className="chronicle-range">{weekRange(lang, w)}</p>
            <ul className="report-links">
              {list.filter((r) => r.week === w).map((r) => (
                <li key={r.region}><Link href={`/${lang}/reports/${w}/${r.region}/`}>{d.reportTitle(w, dict.join.regions[r.region])}</Link></li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </SiteShell>
  );
}
