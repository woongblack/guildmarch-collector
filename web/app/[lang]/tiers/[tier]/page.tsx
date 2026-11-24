import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { RankList } from "@/components/RankList";
import { SiteShell } from "@/components/SiteShell";
import { TierIcon } from "@/components/TierIcon";
import { isLang, t, type Lang } from "@/lib/i18n";
import { RULES, tierSlugs } from "@/lib/league";
import { marchesFor } from "@/lib/territory";
import { tierHolders } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string; tier: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return tierSlugs.map((tier) => ({ tier }));
}

// 1-based tier from its slug, null when unknown
const tierOf = (slug: string) => {
  const i = (tierSlugs as readonly string[]).indexOf(slug);
  return i < 0 ? null : i + 1;
};

// "Top 22% of the league", or "every other ranked guild" for the lowest tier
const cutText = (lang: Lang, tier: number) => (tier === 1 ? t(lang).tiers.rest : t(lang).tiers.top(Math.round(RULES.tierCuts[tier - 1] * 100)));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, tier } = await params;
  const n = tierOf(tier);
  if (!isLang(lang) || !n) return {};
  const d = t(lang);
  const name = d.tiers.names[n - 1];
  return pageMeta(lang, `/tiers/${tier}/`, `${name} · ${d.tiers.title} · ${d.siteName}`, d.honors.tierMeta(name, cutText(lang, n), marchesFor(n)), {
    image: `/og/${lang}/tiers/${tier}.jpg`,
  });
}

export default async function TierPage({ params }: Props) {
  const { lang, tier } = await params;
  const n = tierOf(tier);
  if (!isLang(lang) || !n) notFound();
  const dict = t(lang);
  const d = dict.honors;
  const name = dict.tiers.names[n - 1];
  const holders = tierHolders(n);
  const notes = [n === 9 && d.overlordNote, n === RULES.winnerFloor && d.winnerFloor, n === 1 && d.lowestNote].filter(Boolean) as string[];

  return (
    <SiteShell lang={lang} path={`/tiers/${tier}/`} scene="hall-of-banners">
      <main className="page page-narrow">
        <div className="page-head honor-head">
          <p className="page-kicker"><Link href={`/${lang}/tiers/`}>{d.tiersTitle}</Link></p>
          <TierIcon tier={n} label="" size={128} />
          <h1>{name}</h1>
          <p className="page-lead">{d.tierLead(name)}</p>
          <p className="answer-date">{d.step(n)}</p>
        </div>
        <article className="questlog guide">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            <section>
              <h2>{d.howTitle}</h2>
              <p className="answer-text"><strong>{cutText(lang, n)}</strong></p>
              <p className="answer-text">{d.position}</p>
              {notes.map((x) => <p key={x} className="answer-text">{x}</p>)}
            </section>
            <section>
              <h2>{d.mapTitle}</h2>
              <p className="answer-text">{d.marches(marchesFor(n))}</p>
            </section>
          </div>
        </article>

        <section className="frame" aria-labelledby="tier-holders">
          <h2 className="frame-plate" id="tier-holders">{d.holdersTitle}</h2>
          {holders.week === null ? (
            <EmptyState text={d.noHolders} />
          ) : holders.rows.length ? (
            <>
              <p className="finder-count">{d.holdersWeek(holders.week)}</p>
              <RankList lang={lang} rows={holders.rows} linked={holders.linked} />
            </>
          ) : (
            <p className="finder-empty">{d.noneThisWeek}</p>
          )}
        </section>

        <nav className="week-pager" aria-label={d.allTiers}>
          {n > 1 ? <Link href={`/${lang}/tiers/${tierSlugs[n - 2]}/`}>← {d.lower}: {dict.tiers.names[n - 2]}</Link> : <span />}
          {n < 9 ? <Link href={`/${lang}/tiers/${tierSlugs[n]}/`}>{d.higher}: {dict.tiers.names[n]} →</Link> : <span />}
        </nav>
      </main>
    </SiteShell>
  );
}
