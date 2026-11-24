import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import { closedWeeks, isSample } from "@/lib/data";
import { pageMeta } from "@/lib/site";
import { weekRange } from "@/lib/weeks";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/weeks/", `${d.weeks.title} · ${d.siteName}`, d.weeks.meta, { noindex: isSample() || !closedWeeks().length });
}

// Newest closed week first
export default async function Weeks({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.weeks;
  const weeks = [...closedWeeks()].reverse();

  return (
    <SiteShell lang={lang} path="/weeks/" scene="clocktower-square">
      <main className="page page-narrow">
        <div className="page-head chronicle">
          <h1>{d.title}</h1>
          <p className="chronicle-range">{d.lead}</p>
        </div>
        {isSample() && weeks.length > 0 && <p className="page-sample">{dict.site.sample}</p>}
        {weeks.length ? (
          <ul className="frame week-list">
            {weeks.map((w) => (
              <li key={w}>
                <Link href={`/${lang}/weeks/${w}/`}>{d.weekTitle(w)}</Link>
                <span>{weekRange(lang, w)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="frame"><EmptyState text={d.notClosed} /></div>
        )}
      </main>
    </SiteShell>
  );
}
