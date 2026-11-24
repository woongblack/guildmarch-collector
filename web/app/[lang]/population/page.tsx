import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { FactionSplit, pct } from "@/components/PopulationCharts";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, locales, t } from "@/lib/i18n";
import { lastRun, population, regions } from "@/lib/data";
import { pageMeta, SITE_URL } from "@/lib/site";
import type { PopulationGroup } from "@/lib/site-data";

type Props = { params: Promise<{ lang: string }> };

// Groups this small swing on one guild, so they stay off the page
const MIN_CHARACTERS = 100;
const shown = () => population().filter((g) => g.characters >= MIN_CHARACTERS);
const total = (groups: PopulationGroup[]) => groups.reduce((n, g) => n + g.characters, 0);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang).population;
  const groups = shown();
  return pageMeta(lang, "/population/", `${d.title} · ${t(lang).siteName}`, d.meta(total(groups).toLocaleString(locales[lang].intl)), { noindex: !groups.length });
}

// R-36, brought forward for search (2026-11-19): the current members of registered guilds, counted
// every day, so the page has real numbers before the first week closes
export default async function Population({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.population;
  const num = (n: number) => n.toLocaleString(locales[lang].intl);
  // The reader's own region first, the rest in the usual order
  const order = [locales[lang].home, ...regions.filter((r) => r !== locales[lang].home)];
  const groups = shown().sort((a, b) => order.indexOf(a.region) - order.indexOf(b.region));
  const guilds = groups.reduce((n, g) => n + g.guilds, 0);
  const at = lastRun();
  const date = at ? new Intl.DateTimeFormat(locales[lang].intl, { year: "numeric", month: "long", day: "numeric", timeZone: locales[lang].zone }).format(new Date(at)) : null;
  const where = (g: PopulationGroup) => `${dict.join.regions[g.region]} ${dict.factionsPage.ruleset[g.ruleset]}`;
  // Level bands per region, both rulesets together
  const byRegion = order
    .map((region) => {
      const gs = groups.filter((g) => g.region === region);
      const levels = [0, 1, 2, 3, 4, 5, 6].map((i) => gs.reduce((n, g) => n + g.levels[i], 0));
      return { region, characters: total(gs), levels };
    })
    .filter((r) => r.characters > 0);
  const bands = [d.under10, "10–19", "20–29", "30–39", "40–49", "50–59", "60"];
  const c = d.cols;
  const url = `${SITE_URL}/${lang}/population/`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: d.title,
    description: d.meta(num(total(groups))),
    url,
    inLanguage: locales[lang].hreflang,
    ...(at ? { dateModified: new Date(at).toISOString() } : {}),
    isAccessibleForFree: true,
    creator: { "@id": `${SITE_URL}/#org` },
    variableMeasured: ["faction share", "character level", "honorable kills", "recent logins"],
  };

  return (
    <SiteShell lang={lang} path="/population/" scene="stone-bridge-clash">
      {groups.length > 0 && <JsonLd data={ld} />}
      <main className="page page-narrow insight-page">
        <PageHead title={d.title} lead={groups.length ? d.lead(num(total(groups)), num(guilds)) : d.lead("0", "0")} />
        {!groups.length ? (
          <p className="frame page-empty">{d.empty}</p>
        ) : (
          <article className="questlog guide">
            <div className="questlog-binding" aria-hidden="true" />
            <div className="questlog-page">
              {date && <p className="page-kicker">{d.updated(date)}</p>}
              <section>
                <h2>{d.key}</h2>
                <ul className="pop-keys">
                  {groups.map((g) => (
                    <li key={g.region + g.ruleset}>
                      <Link href={`/${lang}/population/${g.region}-${g.ruleset}/`}>{d.keyLine(where(g), pct(g.horde, g.characters), g.levelMedian, pct(g.levels[6], g.characters))}</Link>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2>{d.factionsH}</h2>
                <p className="answer-text">{d.factionsP}</p>
                <FactionSplit lang={lang} groups={groups} />
              </section>
              <section>
                <h2>{d.levelsH}</h2>
                <p className="answer-text">{d.levelsP}</p>
                <div className="pop-scroll">
                  <table className="pop-table">
                    <thead>
                      <tr><th scope="col">{d.band}</th>{byRegion.map((r) => <th key={r.region} scope="col" className="num">{dict.join.regions[r.region]}</th>)}</tr>
                    </thead>
                    <tbody>
                      <tr><th scope="row">{c.characters}</th>{byRegion.map((r) => <td key={r.region} className="num">{num(r.characters)}</td>)}</tr>
                      {bands.map((band, i) => (
                        <tr key={band}><th scope="row">{band}</th>{byRegion.map((r) => <td key={r.region} className="num">{pct(r.levels[i], r.characters)}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section>
                <h2>{d.rulesetsH}</h2>
                <p className="answer-text">{d.rulesetsP}</p>
                <div className="pop-scroll">
                  <table className="pop-table">
                    <thead>
                      <tr>
                        <th scope="col">{c.group}</th>
                        <th scope="col" className="num">{c.characters}</th>
                        <th scope="col" className="num">{c.median}</th>
                        <th scope="col" className="num">{c.at60}</th>
                        <th scope="col" className="num">{c.honorMedian}</th>
                        <th scope="col" className="num">{c.honor100}</th>
                        <th scope="col" className="num">{c.honorMax}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => (
                        <tr key={g.region + g.ruleset}>
                          <th scope="row">{where(g)}</th>
                          <td className="num">{num(g.characters)}</td>
                          <td className="num">{g.levelMedian}</td>
                          <td className="num">{pct(g.levels[6], g.characters)}</td>
                          <td className="num">{num(g.honorMedian)}</td>
                          <td className="num">{pct(g.honor100, g.honorRead)}</td>
                          <td className="num">{num(g.honorMax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section>
                <h2>{d.activityH}</h2>
                <p className="answer-text">{d.activityP}</p>
                <div className="pop-scroll">
                  <table className="pop-table">
                    <thead>
                      <tr><th scope="col">{c.group}</th><th scope="col" className="num">{c.active2}</th><th scope="col" className="num">{c.active7}</th></tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => (
                        <tr key={g.region + g.ruleset}>
                          <th scope="row">{where(g)}</th>
                          <td className="num">{pct(g.active2, g.loginRead)}</td>
                          <td className="num">{pct(g.active7, g.loginRead)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section>
                <h2>{d.boardsH}</h2>
                <ul className="answer-links">
                  {groups.map((g) => (
                    <li key={g.region + g.ruleset}>
                      <Link href={`/${lang}/population/${g.region}-${g.ruleset}/`}>{d.boardTitle(d.boardWhere(d.regionNames[g.region], dict.join.rulesets[g.ruleset]))}</Link>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="insight-method">
                <h2>{d.method}</h2>
                <ul>{d.methodList.map((m) => <li key={m}>{m}</li>)}</ul>
                <p className="insight-source">{d.source}</p>
                <p className="insight-source"><Link href={`/${lang}/factions/`}>{d.related}</Link></p>
              </section>
            </div>
          </article>
        )}
      </main>
    </SiteShell>
  );
}
