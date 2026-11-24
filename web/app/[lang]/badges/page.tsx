import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import type { Badge } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

const weekly: Badge[] = ["rank-1", "rank-2", "rank-3", "streak", "climber", "newcomer", "levels", "achievements", "honor"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/badges/", `${d.honors.badgesTitle} · ${d.siteName}`, d.honors.badgesMeta);
}

export default async function Badges({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.honors;

  return (
    <SiteShell lang={lang} path="/badges/" scene="hall-of-banners">
      <main className="page page-narrow">
        <PageHead title={d.badgesTitle} lead={d.badgesLead} />
        <section className="frame" aria-labelledby="weekly-badges">
          <h2 className="frame-plate" id="weekly-badges">{d.weekly}</h2>
          <ul className="honor-list">
            {weekly.map((b) => (
              <li key={b}>
                <img className="badge-icon" src={`/images/badges/badge-${b}-64.webp`} alt="" />
                <div>
                  <Link href={`/${lang}/badges/${b}/`}>{dict.badges[b]}</Link>
                  <span>{dict.guidePage.badgeRules[b]}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="frame" aria-labelledby="season-titles">
          <h2 className="frame-plate" id="season-titles">{d.season}</h2>
          <ul className="honor-list">
            {dict.mapPage.seasonRewards.map((r) => (
              <li key={r.id}>
                <img className="badge-icon" src={`/images/awards/${r.id}-96.webp`} alt="" />
                <div>
                  <Link href={`/${lang}/badges/${r.id}/`}>{r.name}</Link>
                  <span>{r.rule}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}
