import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { RankList } from "@/components/RankList";
import { SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import { closedWeeks, isSample, shownRegions, weekArchive } from "@/lib/data";
import { pageMeta } from "@/lib/site";
import { weekRange } from "@/lib/weeks";

type Props = { params: Promise<{ lang: string; week: string }> };

export const dynamicParams = false;

// Static export needs at least one page, so week 1 stands in (as an empty, unindexed page) until it closes
export function generateStaticParams() {
  const weeks = closedWeeks();
  return (weeks.length ? weeks : [1]).map((w) => ({ week: String(w) }));
}

const closed = (week: number) => closedWeeks().includes(week);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, week } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  const w = Number(week);
  return pageMeta(lang, `/weeks/${week}/`, `${d.weeks.weekTitle(w)} · ${d.siteName}`, d.weeks.weekMeta(w, weekRange(lang, w)), {
    noindex: isSample() || !closed(w),
  });
}

export default async function Week({ params }: Props) {
  const { lang, week } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.weeks;
  const w = Number(week);
  const all = closedWeeks();
  const i = all.indexOf(w);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  const regions = shownRegions().flatMap((region) => {
    const a = weekArchive(region, w);
    return a ? [{ region, ...a }] : [];
  });

  return (
    <SiteShell lang={lang} path={`/weeks/${week}/`} scene="clocktower-square">
      <main className="page">
        <div className="page-head chronicle">
          <p className="page-kicker"><Link href={`/${lang}/weeks/`}>{d.title}</Link></p>
          <h1>{d.weekTitle(w)}</h1>
          <p className="chronicle-range">{weekRange(lang, w)}</p>
          {isSample() && i >= 0 && <p className="page-sample">{dict.site.sample}</p>}
        </div>

        {i < 0 && <div className="frame"><EmptyState text={d.notClosed} /></div>}
        {regions.map((r) => (
          <section key={r.region} className="frame" aria-labelledby={`week-${r.region}`}>
            <h2 className="frame-plate" id={`week-${r.region}`}>{dict.join.regions[r.region]}</h2>
            {r.rows.length ? <RankList lang={lang} region={r.region} rows={r.rows} linked={r.linked} /> : <p className="finder-empty">{d.none}</p>}
            {r.maps.map((m) => (
              <p key={m.ruleset} className="finder-foot">
                {dict.factionsPage.ruleset[m.ruleset]} · {dict.mapPage.stats(w, m.multiplier, m.claimed, m.captured)} · {dict.mapPage.lords(m.lords)}
              </p>
            ))}
          </section>
        ))}

        {(prev || next) && (
          <nav className="week-pager" aria-label={d.all}>
            {prev ? <Link href={`/${lang}/weeks/${prev}/`}>← {d.prev}</Link> : <span />}
            {next ? <Link href={`/${lang}/weeks/${next}/`}>{d.next} →</Link> : <span />}
          </nav>
        )}
      </main>
    </SiteShell>
  );
}
