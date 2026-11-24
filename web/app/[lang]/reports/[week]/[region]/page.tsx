import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chronicleLine, ChronicleList } from "@/components/Chronicle";
import { CopyText } from "@/components/CopyText";
import { EmptyState } from "@/components/EmptyState";
import { GuildBanner } from "@/components/GuildBanner";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { TierIcon } from "@/components/TierIcon";
import { guildColorOf, isSample, type Region } from "@/lib/data";
import { isLang, locales, t } from "@/lib/i18n";
import { leagues } from "@/lib/league";
import { regionNames } from "@/lib/map-regions";
import { reportList, reportNotes, weekReport, type ReportGuild } from "@/lib/report";
import { pageMeta, SITE_URL } from "@/lib/site";
import { weekRange } from "@/lib/weeks";

type Props = { params: Promise<{ lang: string; week: string; region: string }> };

export const dynamicParams = false;

// Static export needs at least one page, so week 1 in Korea stands in (empty, unindexed) until it closes
export function generateStaticParams() {
  const list = reportList();
  return (list.length ? list : [{ week: 1, region: "kr" as Region }]).map((r) => ({ week: String(r.week), region: r.region }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, week, region } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  const where = d.join.regions[region as Region];
  const w = Number(week);
  // Indexed only with the owner's notes: without them the page repeats the rank tables
  const notes = reportNotes(w, region as Region, lang);
  return pageMeta(lang, `/reports/${week}/${region}/`, `${d.reports.reportTitle(w, where)} · ${d.siteName}`, d.reports.reportMeta(w, where), {
    noindex: isSample() || !weekReport(region as Region, w) || !notes.length,
  });
}

export default async function ReportPage({ params }: Props) {
  const { lang, week, region: r } = await params;
  if (!isLang(lang)) notFound();
  const region = r as Region;
  const w = Number(week);
  const dict = t(lang);
  const d = dict.reports;
  const where = dict.join.regions[region];
  const report = weekReport(region, w);
  const notes = reportNotes(w, region, lang);
  const title = d.reportTitle(w, where);
  const url = `${SITE_URL}/${lang}/reports/${week}/${region}/`;
  const places = regionNames(lang);
  const num = (n: number) => n.toLocaleString(locales[lang].intl);
  const pm = (n: number) => n.toFixed(1);
  const guildLink = (g: ReportGuild) => `/${lang}/guild/${region}/${g.id}/`;

  if (!report) {
    return (
      <SiteShell lang={lang} path={`/reports/${week}/${region}/`} scene="lore-archive-raid">
        <main className="page page-narrow">
          <div className="page-head"><h1>{title}</h1></div>
          <div className="frame"><EmptyState text={d.none} /></div>
        </main>
      </SiteShell>
    );
  }

  // The same report as a plain forum post: numbers, notes, then the link once at the end
  const post = [
    title,
    weekRange(lang, w),
    "",
    ...notes.flatMap((p) => [p, ""]),
    `■ ${d.numbers}`,
    `${d.stat.guilds} ${num(report.totals.guilds)} · ${d.stat.ranked} ${num(report.totals.ranked)} · ${d.stat.active} ${num(report.totals.active)}`,
    "",
    `■ ${d.podium}`,
    ...leagues.flatMap((l) => (report.podium[l].length ? [`${dict.rank.leagues[l]}: ${report.podium[l].map((g) => `${g.rank}. ${g.name} (${d.perMember(pm(g.perMember))})`).join(" · ")}`] : [])),
    ...(report.climbers.length ? ["", `■ ${d.climbers}`, ...report.climbers.map((g) => `${g.name} ${d.up(g.up)} → ${dict.guild.rankIn(dict.rank.leagues[g.league], g.rank)}`)] : []),
    ...(report.factions.length ? ["", `■ ${d.factions}`, ...report.factions.map((f) => `${dict.join.rulesets[f.ruleset]} ${dict.join.factions[f.faction]}: ${d.factionLine(f.guilds, f.active, pm(f.perMember))}`)] : []),
    ...(report.maps.length ? ["", `■ ${d.territory}`, ...report.maps.flatMap((m) => [
      `${dict.join.rulesets[m.ruleset as keyof typeof dict.join.rulesets]}: ${d.mapLine(m.lords, m.claimed, m.captured)}`,
      ...m.items.slice(0, 3).map((i) => `- ${chronicleLine(lang, i, m.names, places)}`),
    ])] : []),
    "",
    `${d.more}: ${url}`,
    d.source,
  ].join("\n");

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: d.reportMeta(w, where),
    inLanguage: locales[lang].hreflang,
    mainEntityOfPage: url,
    author: { "@id": `${SITE_URL}/#org` },
    publisher: { "@id": `${SITE_URL}/#org` },
  };

  return (
    <SiteShell lang={lang} path={`/reports/${week}/${region}/`} scene="lore-archive-raid">
      <JsonLd data={ld} />
      <main className="page report-page">
        <div className="page-head chronicle">
          <p className="page-kicker"><Link href={`/${lang}/reports/`}>{d.title}</Link></p>
          <h1>{title}</h1>
          <p className="chronicle-range">{weekRange(lang, w)}</p>
          {isSample() && <p className="page-sample">{dict.site.sample}</p>}
        </div>

        {notes.length > 0 && (
          <section className="frame report-notes" aria-labelledby="notes-title">
            <h2 className="frame-plate" id="notes-title">{d.notes}</h2>
            {notes.map((p) => <p key={p}>{p}</p>)}
          </section>
        )}

        <section className="frame" aria-labelledby="numbers-title">
          <h2 className="frame-plate" id="numbers-title">{d.numbers}</h2>
          <dl className="report-stats">
            {(["guilds", "ranked", "active", "levels", "achievements", "honor"] as const).map((k) => (
              <div key={k}><dt>{d.stat[k]}</dt><dd>{num(report.totals[k])}</dd></div>
            ))}
          </dl>
        </section>

        <section className="frame" aria-labelledby="podium-title">
          <h2 className="frame-plate" id="podium-title">{d.podium}</h2>
          <div className="report-podium">
            {leagues.filter((l) => report.podium[l].length).map((l) => (
              <div key={l}>
                <h3>{dict.rank.leagues[l]}</h3>
                <ol>
                  {report.podium[l].map((g) => (
                    <li key={g.id}>
                      <GuildBanner id={g.id} color={guildColorOf(g.id)} size={28} />
                      <Link href={guildLink(g)}>{g.name}</Link>
                      <span className="report-pm">{d.perMember(pm(g.perMember))}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {(report.climbers.length > 0 || report.newcomers.length > 0 || report.topTiers.length > 0) && (
          <section className="frame report-moves" aria-label={d.climbers}>
            {report.climbers.length > 0 && (
              <>
                <h3>{d.climbers}</h3>
                <ul>{report.climbers.map((g) => <li key={g.id}><Link href={guildLink(g)}>{g.name}</Link> <b className="report-up">{d.up(g.up)}</b> {dict.guild.rankIn(dict.rank.leagues[g.league], g.rank)}</li>)}</ul>
              </>
            )}
            {report.newcomers.length > 0 && (
              <>
                <h3>{d.newcomers}</h3>
                <ul>{report.newcomers.map((g) => <li key={g.id}><Link href={guildLink(g)}>{g.name}</Link> · {dict.guild.rankIn(dict.rank.leagues[g.league], g.rank)}</li>)}</ul>
              </>
            )}
            {report.topTiers.length > 0 && (
              <>
                <h3>{d.topTiers}</h3>
                <ul>{report.topTiers.map((g) => <li key={g.id}><TierIcon tier={g.tier!} label="" size={64} /> <Link href={guildLink(g)}>{g.name}</Link> · {dict.tiers.names[g.tier! - 1]}</li>)}</ul>
              </>
            )}
          </section>
        )}

        {report.factions.length > 0 && (
          <section className="frame" aria-labelledby="factions-title">
            <h2 className="frame-plate" id="factions-title">{d.factions}</h2>
            <ul className="report-factions">
              {report.factions.map((f) => (
                <li key={`${f.ruleset}-${f.faction}`}>
                  <strong className={`faction-${f.faction}`}>{dict.join.rulesets[f.ruleset]} {dict.join.factions[f.faction]}</strong> {d.factionLine(f.guilds, f.active, pm(f.perMember))}
                </li>
              ))}
            </ul>
          </section>
        )}

        {report.maps.length > 0 && (
          <section className="frame" aria-labelledby="territory-title">
            <h2 className="frame-plate" id="territory-title">{d.territory}</h2>
            {report.maps.map((m) => (
              <div key={m.ruleset} className="report-map">
                <h3>{dict.join.rulesets[m.ruleset as keyof typeof dict.join.rulesets]} · {d.mapLine(m.lords, m.claimed, m.captured)}</h3>
                <ChronicleList lang={lang} items={m.items} names={m.names} places={places} open={5} />
                <p className="finder-foot"><Link href={`/${lang}/map/${region}-${m.ruleset}/`}>{dict.mapPage.viewOnMap}</Link></p>
              </div>
            ))}
          </section>
        )}

        <section className="frame report-copy" aria-labelledby="copy-title">
          <h2 className="frame-plate" id="copy-title">{d.copy}</h2>
          <p className="share-lead">{d.copyNote}</p>
          <CopyText text={post} label={d.copy} done={d.copied} failed={d.copyFailed} />
          <p className="finder-foot">
            <Link href={`/${lang}/weeks/${week}/`}>{d.fullTable}</Link> · <Link href={`/${lang}/reports/`}>{d.allReports}</Link>
          </p>
        </section>
      </main>
    </SiteShell>
  );
}
