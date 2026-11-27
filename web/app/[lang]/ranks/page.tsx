import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import { boardIndexable, boardView, regions, rulesets } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

const anyIndexable = () => regions.some((r) => rulesets.some((s) => boardIndexable(r, s)));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/ranks/", `${d.meta.pageTitles.ranks} · ${d.siteName}`, d.boards.hubMeta, { noindex: !anyIndexable() });
}

// The eight region and ruleset pages, grouped by region
export default async function Boards({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.boards;

  return (
    <SiteShell lang={lang} path="/ranks/" scene="river-ford-camps">
      <main className="page page-narrow">
        <PageHead title={d.hubTitle} lead={d.hubLead} />
        <div className="board-hub">
          {regions.map((region) => (
            <section key={region} className="frame" aria-labelledby={`hub-${region}`}>
              <h2 className="frame-plate" id={`hub-${region}`}>{dict.join.regions[region]}</h2>
              <ul>
                {rulesets.map((ruleset) => {
                  const n = boardView(region, ruleset)?.rows.length ?? 0;
                  return (
                    <li key={ruleset}>
                      <Link href={`/${lang}/ranks/${region}-${ruleset}/`}>{d.title(dict.join.regions[region], dict.factionsPage.ruleset[ruleset])}</Link>
                      <span>{n ? d.ranked(n) : d.noGuilds}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
