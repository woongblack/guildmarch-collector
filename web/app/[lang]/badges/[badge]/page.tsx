import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { RankList } from "@/components/RankList";
import { SiteShell } from "@/components/SiteShell";
import { isLang, t, type Lang } from "@/lib/i18n";
import { badgeHolders, type Badge } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string; badge: string }> };

export const dynamicParams = false;

const weekly: Badge[] = ["rank-1", "rank-2", "rank-3", "streak", "climber", "newcomer", "levels", "achievements", "honor"];
const season = ["season-leader", "continent-ruler", "unbroken-hold", "comeback"] as const;

export function generateStaticParams() {
  return [...weekly, ...season].map((badge) => ({ badge }));
}

// Name, rule and image of a weekly badge or a season title
function info(lang: Lang, id: string) {
  const d = t(lang);
  if ((weekly as string[]).includes(id)) {
    const b = id as Badge;
    return { kind: "weekly" as const, name: d.badges[b], rule: d.guidePage.badgeRules[b], image: `/images/badges/badge-${b}-320.webp` };
  }
  const r = d.mapPage.seasonRewards.find((x) => x.id === id);
  if (!r) return null;
  const image = `/images/awards/${id}-192.webp`;
  return { kind: "season" as const, name: r.name, rule: r.rule, image };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, badge } = await params;
  if (!isLang(lang)) return {};
  const b = info(lang, badge);
  if (!b) return {};
  const d = t(lang);
  return pageMeta(lang, `/badges/${badge}/`, `${b.name} · ${d.honors.badgesTitle} · ${d.siteName}`, d.honors.badgeMeta(b.name, b.rule), {
    image: `/og/${lang}/badges/${badge}.jpg`,
  });
}

export default async function BadgePage({ params }: Props) {
  const { lang, badge } = await params;
  if (!isLang(lang)) notFound();
  const b = info(lang, badge);
  if (!b) notFound();
  const dict = t(lang);
  const d = dict.honors;
  const holders = b.kind === "weekly" ? badgeHolders(badge as Badge) : null;
  const all = [...weekly, ...season];
  const i = all.indexOf(badge as Badge);

  return (
    <SiteShell lang={lang} path={`/badges/${badge}/`} scene="hall-of-banners">
      <main className="page page-narrow">
        <div className="page-head honor-head">
          <p className="page-kicker"><Link href={`/${lang}/badges/`}>{d.badgesTitle}</Link></p>
          <img className="honor-image" src={b.image} alt="" width={128} height={128} />
          <h1>{b.name}</h1>
          <p className="page-lead">{b.rule}</p>
          <p className="answer-date">{b.kind === "weekly" ? d.weekly : d.season}</p>
        </div>
        <article className="questlog guide">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            <section>
              <h2>{d.howTitle}</h2>
              <p className="answer-text">{b.rule}</p>
              <p className="answer-text">{b.kind === "weekly" ? d.weeklyNote : d.seasonNote}</p>
              {b.kind === "season" && <p className="answer-text">{dict.mapPage.seasonNote}</p>}
            </section>
          </div>
        </article>

        <section className="frame" aria-labelledby="badge-holders">
          <h2 className="frame-plate" id="badge-holders">{d.badgeHolders}</h2>
          {!holders ? (
            <EmptyState text={d.seasonPending} />
          ) : holders.week === null ? (
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

        <nav className="week-pager" aria-label={d.allBadges}>
          {i > 0 ? <Link href={`/${lang}/badges/${all[i - 1]}/`}>← {info(lang, all[i - 1])!.name}</Link> : <span />}
          {i < all.length - 1 ? <Link href={`/${lang}/badges/${all[i + 1]}/`}>{info(lang, all[i + 1])!.name} →</Link> : <span />}
        </nav>
      </main>
    </SiteShell>
  );
}
