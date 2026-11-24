import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeIcon } from "@/components/BadgeIcon";
import { ChronicleList } from "@/components/Chronicle";
import { Countdown } from "@/components/Countdown";
import { GuildBanner } from "@/components/GuildBanner";
import { DiscordForm } from "@/components/Interactive";
import { JsonLd } from "@/components/JsonLd";
import { MemberTable } from "@/components/MemberTable";
import { RememberGuild } from "@/components/MyGuild";
import { ShareCard } from "@/components/ShareCard";
import { SiteShell } from "@/components/SiteShell";
import { TierIcon } from "@/components/TierIcon";
import { isLang, t, updatedAt } from "@/lib/i18n";
import { regionNames } from "@/lib/map-regions";
import { guildColorOf, guildDetail, guildIds, guildIndexable, guildMembers, guildNeighbours, guildProfile, guildsSample, guildTerritory, guildWar, type WeekResult } from "@/lib/data";
import { guildChange } from "@/lib/digest";
import { pageMeta, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ lang: string; region: string; id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return guildIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, region, id } = await params;
  const g = guildDetail(id);
  if (!isLang(lang) || !g) return {};
  const j = t(lang).join;
  const where = `${j.regions[g.region]} ${j.rulesets[g.ruleset]} ${j.factions[g.faction]}`;
  return pageMeta(lang, `/guild/${region}/${id}/`, `${g.name} · ${where} · ${t(lang).siteName}`, t(lang).meta.guild(g.name, where), {
    noindex: !guildIndexable(id),
    image: `/og/guild/${region}/${id}/${lang}.jpg`,
  });
}

export default async function GuildPage({ params }: Props) {
  const { lang, region, id } = await params;
  const g = guildDetail(id);
  if (!isLang(lang) || !g || g.region !== region) notFound();
  const dict = t(lang);
  const d = dict.guild;
  const j = dict.join;
  const now = g.now;
  const ranked = now.status === "ranked" && now.league && now.rank;
  const parts = [now.parts.levels, now.parts.reached60, now.parts.achievements, now.parts.honor];
  // A guild with no week yet is waiting for week one, not in the middle of it
  const weekLabel = (w: WeekResult) => (w.closed ? d.weekClosed(w.week) : g.weeks.length ? d.weekLive(w.week) : d.beforeStart);
  const tierName = (tier: number) => dict.tiers.names[tier - 1];
  const land = guildTerritory(g.id);
  const moved = guildChange(g.region, g.id);
  const war = guildWar(g.id);
  const lastTier = [...g.weeks].reverse().find((w) => w.closed)?.tier ?? null;
  const a = d.about;
  const profile = guildProfile(g.id);
  const near = guildNeighbours(g.id);
  const where = `${j.regions[g.region]} ${j.rulesets[g.ruleset]}`;
  const side = `${where} ${j.factions[g.faction]}`;
  // The About text: who the guild is, how its week is going, its levels, where the points came from
  const about = [
    [
      a.intro(g.name, side),
      now.status === "pending" ? (now.members > 0 ? a.pending(now.members) : null) : now.members > 0 ? a.roster(now.week, now.members, now.active, now.closed) : null,
      ranked && profile?.of ? a.standing(now.rank!, profile.of, dict.rank.leagues[now.league!], now.perMember.toFixed(1), now.closed) : null,
    ],
    [
      profile && profile.median !== null && profile.leveled >= 3 ? a.levels(profile.leveled, profile.bands[5], profile.median) : null,
      profile?.peer && profile.leveled >= 3 ? a.peer(where, (profile.peer[5] * 100).toFixed(1)) : null,
    ],
    [
      profile?.topPart ? a.points(a.parts[profile.topPart], now.parts[profile.topPart], now.total) : null,
      profile?.top ? a.top(profile.top.name, profile.top.total) : null,
    ],
  ].map((p) => p.filter(Boolean).join(" ")).filter(Boolean);
  const bandMax = profile ? Math.max(...profile.bands.map((n) => n / Math.max(1, profile.leveled)), ...(profile.peer ?? [])) : 0;

  function reason(w: WeekResult) {
    if (w.status === "too-few-active") return d.reason["too-few-active"](w.active);
    if (w.status === "pending") return d.reason.pending;
    if (w.status === "not-found") return d.reason["not-found"];
    return null;
  }

  // Home > Find a guild > this guild, the same trail the page's kicker link shows
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.siteName, item: `${SITE_URL}/${lang}/` },
      { "@type": "ListItem", position: 2, name: dict.guilds.title, item: `${SITE_URL}/${lang}/guilds/` },
      { "@type": "ListItem", position: 3, name: g.name, item: `${SITE_URL}/${lang}/guild/${region}/${id}/` },
    ],
  };

  return (
    <SiteShell lang={lang} path={`/guild/${region}/${id}/`} scene="harbor-dock-raid" guild={id} breadcrumb={false}>
      <JsonLd data={breadcrumb} />
      <RememberGuild region={region} id={id} name={g.name} />
      <main className="page guild-page">
        <div className="page-head">
          <p className="page-kicker">
            <Link href={`/${lang}/guilds/`}>{dict.guilds.title}</Link>
          </p>
          <h1 className="guild-title">
            <GuildBanner id={g.id} color={guildColorOf(g.id)} size={64} />
            {g.name}
          </h1>
          <p className="tags guild-tags">
            {j.regions[g.region]} · {j.rulesets[g.ruleset]} · <span className={`faction-${g.faction}`}>{j.factions[g.faction]}</span>
          </p>
          <p className="guild-fix">
            <Link href={`/${lang}/opt-out/`}>{d.wrongInfo}</Link>
          </p>
          {guildsSample() && <p className="page-sample">{dict.site.sample}</p>}
        </div>

        <div className="guild-grid">
          <section className={`frame standing${ranked ? "" : " is-out"}`} aria-labelledby="standing-title">
            <h2 className="frame-plate" id="standing-title">{weekLabel(now)}</h2>
            {ranked ? (
              <div className="standing-main">
                {now.rank! <= 3 && <BadgeIcon id={`rank-${now.rank}`} label="" size={320} />}
                <div>
                  <p className="standing-rank">{d.rankIn(dict.rank.leagues[now.league!], now.rank!)}</p>
                  <p className="standing-score"><strong>{now.perMember.toFixed(1)}</strong> {d.perMember}</p>
                </div>
              </div>
            ) : (
              <div className="standing-main">
                <div>
                  <p className="standing-rank">{dict.status[now.status]}</p>
                  <p className="standing-reason">{reason(now)}</p>
                </div>
              </div>
            )}
            {moved && (moved.rank || moved.perMember !== 0 || moved.cells !== 0) && (
              <p className="standing-moved">
                {dict.digest.guildLine}:{" "}
                {[
                  moved.rank && dict.digest.rankMove(moved.rank.from, moved.rank.to),
                  moved.perMember !== 0 && dict.digest.perMember(moved.perMember),
                  moved.cells !== 0 && dict.digest.cells(moved.cells),
                ].filter(Boolean).join(" · ")}
              </p>
            )}
            <dl className="standing-stats">
              <div><dt>{g.weeks.length ? d.roster : d.rosterNow}</dt><dd>{now.members}</dd></div>
              <div><dt>{d.active}</dt><dd>{now.active}</dd></div>
              <div><dt>{d.perMember}</dt><dd>{now.active ? now.perMember.toFixed(1) : "–"}</dd></div>
            </dl>
            {lastTier && (
              <p className="standing-tier">
                <TierIcon tier={lastTier} label="" size={128} />
                <span>{dict.tiers.last}<strong>{tierName(lastTier)}</strong></span>
              </p>
            )}
            {land && land.cells > 0 && (
              <p className="guild-territory">
                {dict.mapPage.onGuild(land.cells)} ·{" "}
                <Link href={`/${lang}/map/?ruleset=${land.ruleset}&guild=${g.id}`}>{dict.mapPage.viewOnMap}</Link>
              </p>
            )}
            {land && land.regions.length > 0 && (
              <ul className="guild-lordships" aria-label={dict.mapPage.lordOf}>
                {land.regions.map((r) => <li key={r}>{dict.mapPage.lordTitle(regionNames(lang)[r])}</li>)}
              </ul>
            )}
            {now.excluded > 0 && <p className="standing-note">{d.excluded(now.excluded)}</p>}
            {g.final && <p className="standing-note">{d.newWeek(now.week + 1)}</p>}
          </section>

          <section className="tooltip breakdown" aria-labelledby="breakdown-title">
            <p className="tooltip-name" id="breakdown-title">{g.final ? d.breakdownClosed(now.week) : d.breakdown}</p>
            <dl className="tooltip-rows">
              {dict.score.items.map((item, i) => (
                <div key={item.name}>
                  <dt>{item.name}</dt>
                  <dd>+{parts[i].toLocaleString()}</dd>
                </div>
              ))}
              <div className="tooltip-total">
                <dt>{d.total}</dt>
                <dd>{now.total.toLocaleString()}</dd>
              </div>
            </dl>
            <p className="tooltip-foot">{dict.rank.perActive(now.active)}: <strong>{now.active ? now.perMember.toFixed(1) : "–"}</strong></p>
          </section>
        </div>

        <section className="frame guild-about" aria-labelledby="about-title">
          <h2 className="frame-plate" id="about-title">{a.title}</h2>
          {about.map((p) => <p key={p}>{p}</p>)}
          {profile && profile.leveled >= 3 && (
            <>
              <h3 className="guild-war-sub">{a.levelsTitle}</h3>
              <ol className="level-bands">
                {profile.bands.map((n, i) => {
                  const label = i === 5 ? "60" : `${(i + 1) * 10}–${(i + 1) * 10 + 9}`;
                  const share = n / profile.leveled;
                  const peer = profile.peer?.[i];
                  return (
                    <li key={label} aria-label={`${label}: ${a.members(n)} (${Math.round(share * 100)}%)${peer !== undefined ? ` · ${a.peerLabel(where)} ${Math.round(peer * 100)}%` : ""}`}>
                      <span className="band-label">{label}</span>
                      <span className="band-bar" aria-hidden="true">
                        <span className="band-fill" style={{ width: `${(share / bandMax) * 100}%` }} />
                        {peer !== undefined && <span className="band-peer" style={{ left: `${(peer / bandMax) * 100}%` }} />}
                      </span>
                      <span className="band-n num" aria-hidden="true">{n}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="band-legend" aria-hidden="true">
                <span className="band-key is-guild" />{a.thisGuild}
                {profile.peer && <><span className="band-key is-peer" />{a.peerLabel(where)}</>}
              </p>
            </>
          )}
          {near.rows.length > 0 && (
            <>
              <h3 className="guild-war-sub">{near.league ? a.nearLeague(dict.rank.leagues[near.league]) : a.nearSize}</h3>
              <ul className="near-list">
                {near.rows.map((c) => (
                  <li key={c.id}>
                    <Link href={`/${lang}/guild/${c.region}/${c.id}/`}>
                      <GuildBanner id={c.id} color={guildColorOf(c.id)} size={22} />
                      {c.name}
                    </Link>
                    <span className="near-meta">
                      {near.league ? a.near(c.now.rank!, c.now.perMember.toFixed(1)) : a.members(c.now.members)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="finder-foot">
            <Link href={`/${lang}/ranks/${g.region}-${g.ruleset}/${g.faction}/`}>{a.sideAll(side)}</Link>
          </p>
        </section>

        <MemberTable lang={lang} members={guildMembers(g.id)} week={weekLabel(now)} />

        <ShareCard lang={lang} name={g.name} url={`${SITE_URL}/${lang}/guild/${region}/${id}/`} image={`${SITE_URL}/og/guild/${region}/${id}/${lang}.jpg`} />

        {!guildsSample() && <DiscordForm lang={lang} guild={id} />}

        {war && (war.items.length > 0 || war.forecast || war.sieges.attacking.length > 0 || war.sieges.defending.length > 0) && (
          <section className="frame guild-war" aria-labelledby="war-title">
            <h2 className="frame-plate" id="war-title">{war.forecast ? dict.war.forecastTitle : dict.war.chronicleTitle(war.week)}</h2>
            {war.forecast && (
              <div className="guild-forecast">
                <p>
                  <strong>{dict.war.forecastTab(war.forecast.week)}</strong> · {dict.war.guildForecast(war.forecast.gain, war.forecast.loss)}
                  {war.forecast.threat && <> {dict.war.threat(war.forecast.threat, war.forecast.threatCells)}</>}
                </p>
                <p className="guild-forecast-note"><Countdown lang={lang} closesAt={war.closesAt} /> · {dict.war.forecastNote(war.asOf ? updatedAt(lang, war.asOf) : null)}</p>
              </div>
            )}
            {(["defending", "attacking"] as const).map((side) => war.sieges[side].length > 0 && (
              <div key={side} className={`guild-sieges is-${side}`}>
                <h3 className="guild-war-sub">{side === "defending" ? dict.war.besieged : dict.war.besieging}</h3>
                <ul className="chronicle-list">
                  {war.sieges[side].map((s) => (
                    <li key={s.region} className={s.lord ? "chronicle-lord" : "chronicle-capture"}>
                      <GuildBanner id={s.attacker.id} color={s.attacker.color} size={22} />
                      {dict.war.siegeLine(regionNames(lang)[s.region], s.attacker.name, s.defender.name, s.cells, s.lord)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {war.items.length > 0 && (
              <>
                <h3 className="guild-war-sub">{dict.war.guildChronicle} · {dict.war.chronicleTitle(war.week)}</h3>
                <ChronicleList lang={lang} items={war.items} names={war.names} places={regionNames(lang)} open={6} />
              </>
            )}
            <p className="finder-foot">
              <Link href={`/${lang}/map/?ruleset=${war.ruleset}&guild=${g.id}`}>{dict.mapPage.viewOnMap}</Link>
            </p>
          </section>
        )}

        <section className="frame history" aria-labelledby="history-title">
          <h2 className="frame-plate" id="history-title">{d.history}</h2>
          <ol className="history-rows">
            <li className="history-head" aria-hidden="true">
              <span>{d.week}</span>
              <span>{d.result}</span>
              <span>{dict.tiers.title}</span>
              <span className="num">{d.active}</span>
              <span className="num">{d.perMember}</span>
              <span>{d.badges}</span>
            </li>
            {[...g.weeks].reverse().map((w) => (
              <li key={w.week} className="history-row">
                <span>{d.weekShort(w.week)}{!w.closed && <small> · {d.live}</small>}</span>
                <span className={w.status === "ranked" ? "" : "is-out"}>
                  {w.status === "ranked" ? d.rankIn(dict.rank.leagues[w.league!], w.rank!) : dict.status[w.status]}
                </span>
                <span className="history-tier">
                  {w.tier ? <><TierIcon tier={w.tier} label="" />{tierName(w.tier)}</> : <span className="is-out">–</span>}
                </span>
                <span className="num">{w.active}</span>
                <span className="num history-score">{w.status === "ranked" ? w.perMember.toFixed(1) : "–"}</span>
                <span className="history-badges">
                  {w.badges.map((b) => <BadgeIcon key={b} id={b} label={dict.badges[b]} size={64} />)}
                </span>
              </li>
            ))}
          </ol>
          {g.weeks.every((w) => !w.badges.length) && <p className="history-empty">{d.noBadges}</p>}
        </section>
      </main>
    </SiteShell>
  );
}
