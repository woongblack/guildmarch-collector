import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RankList } from "@/components/RankList";
import { SiteShell } from "@/components/SiteShell";
import { Versus } from "@/components/Versus";
import { isLang, t, updatedAt, type Lang } from "@/lib/i18n";
import { regionNames } from "@/lib/map-regions";
import { boardIndexable, boards, boardView, factions, isSample, lastRun, type Region, type Ruleset } from "@/lib/data";
import { populationLink } from "@/lib/population-link";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string; board: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return boards().map((b) => ({ board: b.slug }));
}

function parse(board: string): { region: Region; ruleset: Ruleset } | null {
  return boards().find((b) => b.slug === board) ?? null;
}

const names = (lang: Lang, region: Region, ruleset: Ruleset) => [t(lang).join.regions[region], t(lang).factionsPage.ruleset[ruleset]] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, board } = await params;
  const b = parse(board);
  if (!isLang(lang) || !b) return {};
  const d = t(lang);
  const [region, ruleset] = names(lang, b.region, b.ruleset);
  return pageMeta(lang, `/ranks/${board}/`, `${d.boards.title(region, ruleset)} · ${d.siteName}`, d.boards.meta(region, ruleset), {
    noindex: !boardIndexable(b.region, b.ruleset),
  });
}

export default async function Board({ params }: Props) {
  const { lang, board } = await params;
  const b = parse(board);
  if (!isLang(lang) || !b) notFound();
  const dict = t(lang);
  const d = dict.boards;
  const [regionName, rulesetName] = names(lang, b.region, b.ruleset);
  const v = boardView(b.region, b.ruleset);
  const sample = isSample() && v !== null;
  const run = lastRun();
  const w = v?.view.tableWeek ?? 1;
  const note = !v ? null : sample || run === null ? dict.rank.sample(w) : v.view.final ? dict.rank.final(w) : dict.rank.live(w, updatedAt(lang, run));
  const firstDay = !sample && run !== null && v?.view.firstDay;
  const places = regionNames(lang);
  const pop = populationLink(lang, b.region, b.ruleset);

  return (
    <SiteShell lang={lang} path={`/ranks/${board}/`} scene="river-ford-camps">
      <main className="page">
        <div className="page-head">
          <p className="page-kicker"><Link href={`/${lang}/ranks/`}>{d.hubTitle}</Link></p>
          <h1>{d.title(regionName, rulesetName)}</h1>
          <p className="page-lead">{d.lead(regionName, rulesetName)}</p>
          {sample && <p className="page-sample">{dict.site.sample}</p>}
        </div>

        <section className="frame" aria-labelledby="board-ranks">
          <h2 className="frame-plate" id="board-ranks">{dict.rank.title}</h2>
          {note && <p className="finder-count">{note}</p>}
          {firstDay && <p className="finder-count">{dict.rank.firstDay}</p>}
          {v && v.rows.length ? (
            <RankList
              lang={lang}
              region={b.region}
              linked={v.linked}
              rows={v.rows.map((r) => ({ ...r, tier: r.lastTier, lords: r.lastLords }))}
            />
          ) : (
            <p className="finder-empty">{d.noGuilds}</p>
          )}
        </section>

        <section className="frame" aria-labelledby="board-lords">
          <h2 className="frame-plate" id="board-lords">{d.lordsTitle}</h2>
          {v && v.lords.length ? (
            <ul className="board-lords">
              {v.lords.map((l) => (
                <li key={l.id}>
                  {v.linked ? <Link href={`/${lang}/guild/${b.region}/${l.id}/`}>{l.name}</Link> : <strong>{l.name}</strong>}
                  <span>{l.regions.map((r) => dict.mapPage.lordTitle(places[r])).join(" · ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="finder-empty">{d.noLords}</p>
          )}
          <p className="finder-foot"><Link href={`/${lang}/map/?ruleset=${b.ruleset}`}>{dict.mapPage.viewOnMap}</Link></p>
        </section>

        {v?.faction && v.faction.rows.some((r) => r.ruleset === b.ruleset && r.guilds > 0) && (
          <section className="frame factions" aria-labelledby="board-factions">
            <h2 className="frame-plate" id="board-factions">{d.factionTitle}</h2>
            <div className="versus-grid versus-single">
              <Versus week={v.faction} ruleset={b.ruleset} dict={dict} land={v.land ?? undefined} />
            </div>
          </section>
        )}

        <nav className="board-links board-sides" aria-label={d.sides}>
          <h2>{d.sides}</h2>
          <ul>
            {factions.map((f) => (
              <li key={f}>
                <Link className={`faction-${f}`} href={`/${lang}/ranks/${board}/${f}/`}>{d.sideTitle(regionName, rulesetName, dict.join.factions[f])}</Link>
              </li>
            ))}
            {pop && <li><Link href={pop.href}>{pop.label}</Link></li>}
          </ul>
        </nav>

        <nav className="board-links" aria-label={d.others}>
          <h2>{d.others}</h2>
          <ul>
            {boards().filter((o) => o.slug !== board).map((o) => {
              const [r, s] = names(lang, o.region, o.ruleset);
              return <li key={o.slug}><Link href={`/${lang}/ranks/${o.slug}/`}>{d.title(r, s)}</Link></li>;
            })}
          </ul>
        </nav>
      </main>
    </SiteShell>
  );
}
