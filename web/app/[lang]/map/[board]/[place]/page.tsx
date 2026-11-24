import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChronicleList } from "@/components/Chronicle";
import { Countdown } from "@/components/Countdown";
import { GuildBanner } from "@/components/GuildBanner";
import { EmptyState } from "@/components/EmptyState";
import { SiteShell } from "@/components/SiteShell";
import { isLang, t, type Lang } from "@/lib/i18n";
import { regionNames, regionSlugs } from "@/lib/map-regions";
import { boards, isSample, placeIndexable, placeNeighbours, placeView, placeWar, type Region, type Ruleset } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string; board: string; place: string }> };

export const dynamicParams = false;

// One page per terrain region on each map: 37 regions x 8 maps, such as /map/kr-pvp/burning-mountain/
export function generateStaticParams() {
  return boards().flatMap((b) => regionSlugs.map((place) => ({ board: b.slug, place })));
}

function parse(board: string, place: string): { region: Region; ruleset: Ruleset; place: number } | null {
  const b = boards().find((x) => x.slug === board);
  const i = regionSlugs.indexOf(place);
  return b && i >= 0 ? { region: b.region, ruleset: b.ruleset, place: i } : null;
}

const boardName = (lang: Lang, region: Region, ruleset: Ruleset) => `${t(lang).join.regions[region]} ${t(lang).factionsPage.ruleset[ruleset]}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, board, place } = await params;
  const p = parse(board, place);
  if (!isLang(lang) || !p) return {};
  const d = t(lang);
  const name = regionNames(lang)[p.place];
  const b = boardName(lang, p.region, p.ruleset);
  const v = placeView(p.region, p.ruleset, p.place);
  return pageMeta(lang, `/map/${board}/${place}/`, `${d.places.title(name, b)} · ${d.siteName}`, d.places.meta(name, b, v.lord?.name ?? null), {
    noindex: !placeIndexable(p.region, p.ruleset, p.place),
    image: `/og/${lang}/map/${place}.jpg`,
  });
}

export default async function Place({ params }: Props) {
  const { lang, board, place } = await params;
  const p = parse(board, place);
  if (!isLang(lang) || !p) notFound();
  const dict = t(lang);
  const d = dict.places;
  const names = regionNames(lang);
  const name = names[p.place];
  const b = boardName(lang, p.region, p.ruleset);
  const v = placeView(p.region, p.ruleset, p.place);
  const guildLink = (id: string, text: string) =>
    v.linked ? <Link href={`/${lang}/guild/${p.region}/${id}/`}>{text}</Link> : <strong>{text}</strong>;

  return (
    <SiteShell lang={lang} path={`/map/${board}/${place}/`} scene="border-cairns">
      <main className="page page-narrow">
        <div className="page-head">
          <p className="page-kicker"><Link href={`/${lang}/map/${board}/`}>{d.mapTitle(b)}</Link></p>
          <h1>{name}</h1>
          <p className="page-lead">{d.lead(name, b, v.cells)}</p>
          <p className="answer-date">{d.need(Math.floor(v.cells / 2) + 1)}</p>
          {isSample() && v.week !== null && <p className="page-sample">{dict.site.sample}</p>}
        </div>

        <figure className="frame place-map">
          <img src={`/images/territory/regions/${place}.webp`} alt={dict.places.mapAlt(name)} width={960} height={540} />
        </figure>

        <section className="frame" aria-labelledby="place-lord">
          <h2 className="frame-plate" id="place-lord">{d.lordTitle}</h2>
          {v.week === null ? (
            <EmptyState text={dict.mapPage.empty} />
          ) : (
            <>
              <p className="finder-count">{d.lordAt(v.week)}</p>
              {v.lord ? (
                <p className="place-lord">
                  <span className={`faction-${v.lord.faction}`}>{dict.join.factions[v.lord.faction]}</span>
                  {guildLink(v.lord.id, v.lord.name)}
                  <span>{dict.mapPage.lordTitle(name)}</span>
                </p>
              ) : (
                <p className="finder-empty">{d.noLord}</p>
              )}
              <h3 className="place-sub">{d.holdingsTitle}</h3>
              <ul className="board-lords">
                {v.holdings.map((h) => (
                  <li key={h.id}>
                    {guildLink(h.id, h.name)}
                    <span>{dict.mapPage.cells(h.cells)} · {Math.round((h.cells / v.cells) * 100)}%</span>
                  </li>
                ))}
                <li><span>{dict.mapPage.unclaimed} · {dict.mapPage.cells(v.unclaimed)}</span></li>
              </ul>
            </>
          )}
        </section>

        {(() => {
          const war = placeWar(p.region, p.ruleset, p.place);
          if (!war || (!war.items.length && !war.forecast?.items.length && !war.siege)) return null;
          return (
            <section className="frame" aria-labelledby="place-war">
              <h2 className="frame-plate" id="place-war">{dict.war.placeChronicle}</h2>
              {war.siege && (
                <p className="place-siege">
                  <GuildBanner id={war.siege.attacker.id} color={war.siege.attacker.color} size={40} />
                  <span>
                    <strong>{dict.war.siegeHere(war.siege.attacker.name, war.siege.defender.name, war.siege.cells)}</strong>
                    <Countdown lang={lang} closesAt={war.closesAt} />
                  </span>
                </p>
              )}
              {war.items.length > 0 && (
                <>
                  <h3 className="place-sub">{dict.war.chronicleTitle(war.week)}</h3>
                  <ChronicleList lang={lang} items={war.items} names={war.names} places={names} open={6} />
                </>
              )}
              {war.forecast && war.forecast.items.length > 0 && (
                <>
                  <h3 className="place-sub">{dict.war.forecastChronicle(war.forecast.week)}</h3>
                  <ChronicleList lang={lang} items={war.forecast.items} names={war.names} places={names} open={6} />
                </>
              )}
            </section>
          );
        })()}

        {v.history.length > 0 && (
          <section className="frame" aria-labelledby="place-history">
            <h2 className="frame-plate" id="place-history">{d.historyTitle}</h2>
            <ul className="board-lords">
              {v.history.map((h) => (
                <li key={h.week}>
                  <strong>{dict.mapPage.week(h.week)}</strong>
                  <span>{h.lord ? h.lord.name : d.none}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="board-links" aria-label={d.neighboursTitle}>
          <h2>{d.neighboursTitle}</h2>
          <ul>
            {placeNeighbours(p.place).map((n) => (
              <li key={n}><Link href={`/${lang}/map/${board}/${regionSlugs[n]}/`}>{names[n]}</Link></li>
            ))}
          </ul>
        </nav>
      </main>
    </SiteShell>
  );
}
