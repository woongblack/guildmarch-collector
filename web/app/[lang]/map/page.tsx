import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegionPanel, RegionProvider, RegionTabs } from "@/components/RegionTabs";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { TerritoryMapView } from "@/components/TerritoryMap";
import { isLang, locales, t } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { regionNames } from "@/lib/map-regions";
import { isSample, mapCentres, mapRegions, regionLabels, shownRegions, territoryView, type Region } from "@/lib/data";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/map/", `${t(lang).meta.pageTitles.map} · ${t(lang).siteName}`, t(lang).meta.map) : {};
}

export default async function MapPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.mapPage;
  const shown = shownRegions();
  const initial: Region = shown.includes(locales[lang].home) ? locales[lang].home : shown[0];

  return (
    <SiteShell lang={lang} path="/map/" scene="valley-guild-war">
      <main className="page page-wide">
        <PageHead title={d.title} lead={d.lead} sample={isSample() ? dict.site.sample : undefined} />
        <RegionProvider initial={initial}>
          <RegionTabs regions={shown} names={dict.join.regions} label={dict.site.region} />
          {shown.map((r) => {
            const maps = territoryView(r);
            return (
              <RegionPanel key={r} region={r}>
                {maps.length
                  ? <TerritoryMapView lang={lang} maps={maps} regions={mapRegions()} regionNames={regionNames(lang)} labels={regionLabels()} centres={mapCentres()} />
                  : <p className="frame page-empty">{d.empty}</p>}
              </RegionPanel>
            );
          })}
        </RegionProvider>

        {/* What a season's map hands out (R-21 rewards); shown before the first season so guilds know what the land is for */}
        <section className="frame season-rewards" aria-labelledby="season-title">
          <h2 className="frame-plate" id="season-title">{d.seasonTitle}</h2>
          <p className="season-lead">{d.seasonLead}</p>
          <ul className="season-list">
            {d.seasonRewards.map((r) => (
              <li key={r.id}>
                <img
                  src={`/images/awards/${r.id}-192.webp`}
                  alt=""
                  width={72}
                  height={72}
                />
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.rule}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="season-note">{d.seasonNote}</p>
        </section>
        <p className="page-note tmap-note">{d.note}</p>
      </main>
    </SiteShell>
  );
}
