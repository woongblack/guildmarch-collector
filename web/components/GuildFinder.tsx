"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { GuildCard, Status } from "@/lib/data";
import { BadgeIcon } from "./BadgeIcon";
import { TierIcon } from "./TierIcon";

const statusOrder: Status[] = ["ranked", "too-few-active", "pending", "not-found"];
const leagueOrder = { large: 0, medium: 1, small: 2 };

function Filter({ label, value, onChange, options, all }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Record<string, string>;
  all: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{all}</option>
        {Object.entries(options).map(([v, text]) => <option key={v} value={v}>{text}</option>)}
      </select>
    </label>
  );
}

export function GuildFinder({ lang, cards }: { lang: Lang; cards: GuildCard[] }) {
  const dict = t(lang);
  const d = dict.guilds;
  const j = dict.join;
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [ruleset, setRuleset] = useState("");
  const [faction, setFaction] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards
      .filter((c) => (!q || c.name.toLowerCase().includes(q))
        && (!region || c.region === region)
        && (!ruleset || c.ruleset === ruleset)
        && (!faction || c.faction === faction))
      .sort((a, b) =>
        statusOrder.indexOf(a.now.status) - statusOrder.indexOf(b.now.status)
        || (a.now.league && b.now.league ? leagueOrder[a.now.league] - leagueOrder[b.now.league] : 0)
        // Ties keep registration order; localeCompare differs between server and browser
        || (a.now.rank ?? 0) - (b.now.rank ?? 0));
  }, [cards, query, region, ruleset, faction]);

  return (
    <section className="frame finder" aria-labelledby="finder-title">
      <h2 className="frame-plate" id="finder-title">{d.title}</h2>
      <div className="finder-filters">
        <label className="finder-search">
          <span>{d.search}</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={d.searchPlaceholder} autoComplete="off" />
        </label>
        <Filter label={j.region} value={region} onChange={setRegion} options={j.regions} all={d.all} />
        <Filter label={j.ruleset} value={ruleset} onChange={setRuleset} options={j.rulesets} all={d.all} />
        <Filter label={j.faction} value={faction} onChange={setFaction} options={j.factions} all={d.all} />
      </div>
      <p className="finder-count" role="status">{d.count(rows.length)}</p>
      {rows.length ? (
        <ol className="finder-rows">
          <li className="finder-head" aria-hidden="true">
            <span>{d.columns.guild}</span>
            <span>{d.columns.standing}</span>
            <span className="num">{d.columns.active}</span>
            <span className="num">{d.columns.perMember}</span>
          </li>
          {rows.map((c) => {
            const n = c.now;
            const ranked = n.status === "ranked" && n.league && n.rank;
            return (
              <li key={c.id}>
                <Link className="finder-row" href={`/${lang}/guild/${c.region}/${c.id}/`}>
                  <span className="finder-name">
                    <strong>
                      {c.lastTier && <TierIcon tier={c.lastTier} label={dict.tiers.names[c.lastTier - 1]} />}
                      {c.name}
                    </strong>
                    <span className="tags">
                      {j.regions[c.region]} · {j.rulesets[c.ruleset]} · <span className={`faction-${c.faction}`}>{j.factions[c.faction]}</span>
                      {c.lords > 0 && <> · <span className="tag-lord">{dict.mapPage.lords(c.lords)}</span></>}
                    </span>
                  </span>
                  <span className={ranked ? "finder-standing" : "finder-standing is-out"}>
                    {ranked && n.rank! <= 3 && <BadgeIcon id={`rank-${n.rank}`} label="" size={64} />}
                    {ranked ? d.rank(dict.rank.leagues[n.league!], n.rank!) : dict.status[n.status]}
                    {c.final && <small> · {d.lastWeek}</small>}
                  </span>
                  {/* A guild waiting for week one shows its roster instead of an empty active count */}
                  <span className="num">{n.status === "pending" ? d.roster(n.members) : n.active}</span>
                  <span className="num finder-score">{ranked ? n.perMember.toFixed(1) : "–"}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="finder-empty">{d.empty}</p>
      )}
      <p className="finder-foot">
        {d.notListed} <Link href={`/${lang}/register/`}>{dict.site.register}</Link>
      </p>
    </section>
  );
}
