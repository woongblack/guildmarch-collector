import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { FactionSplit, pct } from "@/components/PopulationCharts";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, locales, t, type Lang } from "@/lib/i18n";
import { boards, factions, lastRun, population } from "@/lib/data";
import { pageMeta, SITE_URL } from "@/lib/site";
import type { PopulationGroup } from "@/lib/site-data";

type Props = { params: Promise<{ lang: string; board: string }> };

// Same floor as the main population page: below it one guild swings the numbers
const MIN_CHARACTERS = 100;

export const dynamicParams = false;

export function generateStaticParams() {
  return boards().map((b) => ({ board: b.slug }));
}

function groupOf(board: string) {
  const b = boards().find((x) => x.slug === board);
  if (!b) return null;
  const g = population().find((p) => p.region === b.region && p.ruleset === b.ruleset);
  return { ...b, group: g && g.characters >= MIN_CHARACTERS ? g : null };
}

const whereOf = (lang: Lang, g: { region: PopulationGroup["region"]; ruleset: PopulationGroup["ruleset"] }) => {
  const d = t(lang).population;
  return d.boardWhere(d.regionNames[g.region], t(lang).join.rulesets[g.ruleset]);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, board } = await params;
  const b = groupOf(board);
  if (!isLang(lang) || !b) return {};
  const d = t(lang).population;
  const where = whereOf(lang, b);
  const g = b.group;
  return pageMeta(lang, `/population/${board}/`, `${d.boardTitle(where)} · ${t(lang).siteName}`,
    g ? d.boardMeta(where, pct(g.horde, g.characters), g.characters.toLocaleString(locales[lang].intl)) : d.tooFew,
    { noindex: !g });
}

// One region and ruleset of the population page (R-47), for searches like "wow forever eu horde or
// alliance": the faction split up top, then levels, honor and logins, next to the other ruleset
export default async function PopulationBoard({ params }: Props) {
  const { lang, board } = await params;
  const b = groupOf(board);
  if (!isLang(lang) || !b) notFound();
  const dict = t(lang);
  const d = dict.population;
  const k = d.keys;
  const num = (n: number) => n.toLocaleString(locales[lang].intl);
  const where = whereOf(lang, b);
  const g = b.group;
  const other = population().find((p) => p.region === b.region && p.ruleset !== b.ruleset && p.characters >= MIN_CHARACTERS) ?? null;
  const at = lastRun();
  const date = at ? new Intl.DateTimeFormat(locales[lang].intl, { year: "numeric", month: "long", day: "numeric", timeZone: locales[lang].zone }).format(new Date(at)) : null;
  // Every other region and ruleset with numbers, for the links at the bottom
  const siblings = boards().map((x) => groupOf(x.slug)!).filter((x) => x.group && x.slug !== board);

  let summary: string[] = [];
  if (g) {
    const horde = g.horde / g.characters;
    const big = Math.max(horde, 1 - horde) / Math.max(0.001, Math.min(horde, 1 - horde));
    const f = dict.join.factions;
    summary = [
      d.boardSummary(where, pct(g.horde, g.characters), pct(g.characters - g.horde, g.characters)),
      big < 1.1 ? d.even : horde > 0.5 ? d.ratio(f.horde, f.alliance, big.toFixed(1)) : d.ratio(f.alliance, f.horde, big.toFixed(1)),
      other ? d.compare(whereOf(lang, other), pct(other.horde, other.characters)) : "",
      d.levelLine(g.levelMedian, pct(g.levels[6], g.characters)),
    ].filter(Boolean);
  }
  const bands = [d.under10, "10–19", "20–29", "30–39", "40–49", "50–59", "60"];
  const url = `${SITE_URL}/${lang}/population/${board}/`;
  const ld = g && {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: d.boardTitle(where),
    description: d.boardMeta(where, pct(g.horde, g.characters), num(g.characters)),
    url,
    inLanguage: locales[lang].hreflang,
    ...(at ? { dateModified: new Date(at).toISOString() } : {}),
    isAccessibleForFree: true,
    creator: { "@id": `${SITE_URL}/#org` },
    isPartOf: `${SITE_URL}/${lang}/population/`,
    variableMeasured: ["faction share", "character level", "honorable kills", "recent logins"],
  };

  return (
    <SiteShell lang={lang} path={`/population/${board}/`} scene="stone-bridge-clash" breadcrumb={d.boardTitle(where)}>
      {ld && <JsonLd data={ld} />}
      <main className="page page-narrow insight-page">
        <p className="page-kicker"><Link href={`/${lang}/population/`}>{d.title}</Link></p>
        <PageHead title={d.boardTitle(where)} lead={g ? d.boardLead(num(g.characters), num(g.guilds)) : d.tooFew} />
        {g && (
          <article className="questlog guide">
            <div className="questlog-binding" aria-hidden="true" />
            <div className="questlog-page">
              {date && <p className="page-kicker">{d.updated(date)}</p>}
              <section>
                <h2>{d.key}</h2>
                <dl className="pop-board-keys">
                  <div><dt>{k.horde}</dt><dd className="faction-horde">{pct(g.horde, g.characters)}</dd></div>
                  <div><dt>{k.alliance}</dt><dd className="faction-alliance">{pct(g.characters - g.horde, g.characters)}</dd></div>
                  <div><dt>{k.characters}</dt><dd>{num(g.characters)}</dd></div>
                  <div><dt>{k.guilds}</dt><dd>{num(g.guilds)}</dd></div>
                  <div><dt>{k.median}</dt><dd>{g.levelMedian}</dd></div>
                  <div><dt>{k.at60}</dt><dd>{pct(g.levels[6], g.characters)}</dd></div>
                  <div><dt>{k.honorMedian}</dt><dd>{num(g.honorMedian)}</dd></div>
                  <div><dt>{k.active7}</dt><dd>{pct(g.active7, g.loginRead)}</dd></div>
                </dl>
                <p className="answer-text">{summary.join(lang === "zh-tw" ? "" : " ")}</p>
              </section>
              <section>
                <h2>{d.qFactions(where)}</h2>
                <p className="answer-text">{summary.slice(0, 2).join(lang === "zh-tw" ? "" : " ")}</p>
                <FactionSplit lang={lang} groups={other ? [g, other] : [g]} />
              </section>
              <section>
                <h2>{d.qLevels(where)}</h2>
                <p className="answer-text">{d.levelLine(g.levelMedian, pct(g.levels[6], g.characters))}</p>
                <div className="pop-scroll">
                  <table className="pop-table">
                    <thead>
                      <tr><th scope="col">{d.band}</th><th scope="col" className="num">{where}</th>{other && <th scope="col" className="num">{whereOf(lang, other)}</th>}</tr>
                    </thead>
                    <tbody>
                      {bands.map((band, i) => (
                        <tr key={band}>
                          <th scope="row">{band}</th>
                          <td className="num">{pct(g.levels[i], g.characters)}</td>
                          {other && <td className="num">{pct(other.levels[i], other.characters)}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section>
                <h2>{d.qHonor(where)}</h2>
                <p className="answer-text">{d.honorLine(num(g.honorMedian), pct(g.active7, g.loginRead))}</p>
                <div className="pop-scroll">
                  <table className="pop-table">
                    <thead>
                      <tr>
                        <th scope="col">{d.cols.group}</th>
                        <th scope="col" className="num">{d.cols.honorMedian}</th>
                        <th scope="col" className="num">{d.cols.honor100}</th>
                        <th scope="col" className="num">{d.cols.honorMax}</th>
                        <th scope="col" className="num">{d.cols.active2}</th>
                        <th scope="col" className="num">{d.cols.active7}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(other ? [g, other] : [g]).map((x) => (
                        <tr key={x.ruleset}>
                          <th scope="row">{whereOf(lang, x)}</th>
                          <td className="num">{num(x.honorMedian)}</td>
                          <td className="num">{pct(x.honor100, x.honorRead)}</td>
                          <td className="num">{num(x.honorMax)}</td>
                          <td className="num">{pct(x.active2, x.loginRead)}</td>
                          <td className="num">{pct(x.active7, x.loginRead)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section>
                <h2>{d.boardsH}</h2>
                <ul className="answer-links">
                  <li><Link href={`/${lang}/ranks/${board}/`}>{d.toRanks}</Link></li>
                  {factions.map((f) => <li key={f}><Link href={`/${lang}/ranks/${board}/${f}/`}>{d.toSide(dict.join.factions[f])}</Link></li>)}
                  {siblings.map((x) => <li key={x.slug}><Link href={`/${lang}/population/${x.slug}/`}>{d.boardTitle(whereOf(lang, x))}</Link></li>)}
                  <li><Link href={`/${lang}/population/`}>{d.toAll}</Link></li>
                </ul>
              </section>
              <section className="insight-method">
                <h2>{d.method}</h2>
                <ul>{d.methodList.map((m) => <li key={m}>{m}</li>)}</ul>
                <p className="insight-source">{d.source}</p>
              </section>
            </div>
          </article>
        )}
      </main>
    </SiteShell>
  );
}
