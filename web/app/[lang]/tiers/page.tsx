import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { TierIcon } from "@/components/TierIcon";
import { isLang, t } from "@/lib/i18n";
import { RULES, tierSlugs } from "@/lib/league";
import { marchesFor } from "@/lib/territory";
import { tierHolders } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/tiers/", `${d.honors.tiersTitle} · ${d.siteName}`, d.honors.tiersMeta);
}

// Highest tier first, the way the ladder reads
export default async function Tiers({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.honors;

  return (
    <SiteShell lang={lang} path="/tiers/" scene="hall-of-banners">
      <main className="page page-narrow">
        <PageHead title={d.tiersTitle} lead={d.tiersLead} />
        <ol className="frame honor-list">
          {tierSlugs.map((slug, i) => ({ slug, n: i + 1 })).reverse().map(({ slug, n }) => {
            const held = tierHolders(n).rows.length;
            return (
              <li key={slug}>
                <TierIcon tier={n} label="" />
                <div>
                  <Link href={`/${lang}/tiers/${slug}/`}>{dict.tiers.names[n - 1]}</Link>
                  <span>
                    {n === 1 ? dict.tiers.rest : dict.tiers.top(Math.round(RULES.tierCuts[n - 1] * 100))} · {d.marchShort(marchesFor(n))}
                    {held > 0 && <> · {dict.boards.ranked(held)}</>}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </main>
    </SiteShell>
  );
}
