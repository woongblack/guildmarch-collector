import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegionPanel, RegionProvider, RegionTabs } from "@/components/RegionTabs";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { Versus } from "@/components/Versus";
import { isLang, locales, t } from "@/lib/i18n";
import { populationLink } from "@/lib/population-link";
import { pageMeta } from "@/lib/site";
import { factionTerritory, factionView, isSample, population, rulesets, shownRegions, type FactionWeek, type Region } from "@/lib/data";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/factions/", `${t(lang).meta.pageTitles.factions} · ${t(lang).siteName}`, t(lang).meta.factions) : {};
}

export default async function Factions({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.factionsPage;
  const sample = isSample();
  const shown = shownRegions();
  const initial: Region = shown.includes(locales[lang].home) ? locales[lang].home : shown[0];

  return (
    <SiteShell lang={lang} path="/factions/" scene="stone-bridge-clash">
      <main className="page">
        <PageHead title={d.title} lead={d.lead} sample={sample ? dict.site.sample : undefined} />
        <RegionProvider initial={initial}>
          <RegionTabs regions={shown} names={dict.join.regions} label={dict.site.region} />
          {shown.map((region) => {
            const view = factionView(region);
            // Right after the Thursday reset the new week is all zeros, so only the week that just closed shows
            const started = view?.now.rows.some((r) => r.rankedGuilds > 0);
            const weeks = view ? (started || !view.last ? [view.now, view.last] : [view.last]).filter((w): w is FactionWeek => w !== null) : [];
            return (
              <RegionPanel key={region} region={region}>
                {weeks.length === 0 && <p className="frame page-empty">{d.empty}</p>}
                {weeks.map((week) => (
                  <section key={week.week} className="frame factions" aria-labelledby={`factions-${region}-${week.week}`}>
                    <h2 className="frame-plate" id={`factions-${region}-${week.week}`}>
                      {dict.join.regions[region]} · {week.closed ? d.weekClosed(week.week) : d.weekLive(week.week)}
                    </h2>
                    <div className="versus-grid">
                      {/* A ruleset with no registered guilds would only show zeros */}
                      {rulesets
                        .filter((r) => week.rows.some((row) => row.ruleset === r && row.guilds > 0))
                        .map((r) => <Versus key={r} week={week} ruleset={r} dict={dict} land={factionTerritory(region, week.week)?.[r]} />)}
                    </div>
                  </section>
                ))}
                {(() => {
                  const pops = rulesets.map((r) => populationLink(lang, region, r)).filter((x) => x !== null);
                  return pops.length > 0 && (
                    <ul className="board-links-inline">
                      {pops.map((x) => <li key={x.href}><Link href={x.href}>{x.label}</Link></li>)}
                    </ul>
                  );
                })()}
              </RegionPanel>
            );
          })}
        </RegionProvider>
        <p className="page-note">
          {d.basis}{sample && ` ${d.regionNote}`}
          {/* Every registered guild's members by faction, before any week closes */}
          {population().length > 0 && <> <Link href={`/${lang}/population/`}>{dict.population.title}</Link></>}
        </p>
      </main>
    </SiteShell>
  );
}
