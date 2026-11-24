"use client";

import { useState } from "react";
import { t, type Dict, type Lang } from "@/lib/i18n";
import { leagues, type Badge, type Change as ChangeValue, type League } from "@/lib/league";
import type { RankRow } from "@/lib/data";
import { BadgeIcon } from "./BadgeIcon";
import { TierIcon } from "./TierIcon";

function Change({ value, d }: { value: ChangeValue; d: Dict["rank"] }) {
  if (value.kind === "new") return <span className="change change-new" title={d.isNew}>N<span className="sr">{d.isNew}</span></span>;
  if (value.kind === "back") return <span className="change change-new" title={d.back}>↺<span className="sr">{d.back}</span></span>;
  if (value.kind === "moved") {
    const label = d.moved(d.leagues[value.from]);
    return <span className="change change-new" title={label}>↕<span className="sr">{label}</span></span>;
  }
  const n = value.n;
  if (n === 0) return <span className="change" title={d.same}>–<span className="sr">{d.same}</span></span>;
  const up = n > 0;
  const label = up ? d.up(n) : d.down(-n);
  return (
    <span className={up ? "change change-up" : "change change-down"} title={label}>
      {up ? "▲" : "▼"}{Math.abs(n)}
      <span className="sr">{label}</span>
    </span>
  );
}

function Tooltip({ guild, d, labels, names, tiers, lords }: {
  guild: RankRow;
  d: Dict["rank"];
  labels: string[];
  names: Dict["badges"];
  tiers: Dict["tiers"];
  lords: Dict["mapPage"]["lords"];
}) {
  const p = guild.parts;
  const rows = [p.levels, p.reached60, p.achievements, p.honor];
  const earned: Badge[] = guild.lastBadges;
  return (
    <div className="tooltip" aria-live="polite">
      <p className="tooltip-name">{guild.name}</p>
      <p className="tooltip-kicker">{d.breakdown}</p>
      <dl className="tooltip-rows">
        {rows.map((value, i) => (
          <div key={labels[i]}>
            <dt>{labels[i]}</dt>
            <dd>+{value.toLocaleString()}</dd>
          </div>
        ))}
        <div className="tooltip-total">
          <dt>{d.total}</dt>
          <dd>{guild.total.toLocaleString()}</dd>
        </div>
      </dl>
      <p className="tooltip-foot">
        {d.perActive(guild.active)}: <strong>{guild.perMember.toFixed(1)}</strong>
      </p>
      {guild.lastTier && (
        <p className="tooltip-tier">
          <TierIcon tier={guild.lastTier} label="" />
          <span>{tiers.last} <strong>{tiers.names[guild.lastTier - 1]}</strong></span>
        </p>
      )}
      {guild.lastLords > 0 && <p className="tooltip-lords">{lords(guild.lastLords)}</p>}
      {earned.length > 0 && (
        <div className="tooltip-badges">
          <p className="tooltip-kicker">{d.badges}</p>
          <ul>
            {earned.map((b) => (
              <li key={b}>
                <BadgeIcon id={b} label="" size={64} />
                {names[b]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// note says what the table is: the example season, or the real week and when it was last updated
export function RankWindow({ lang, table, note }: { lang: Lang; table: Record<League, RankRow[]>; note: string }) {
  const d = t(lang).rank;
  const scoreLabels = t(lang).score.items.map((item) => item.name);
  const badgeNames = t(lang).badges;
  // Open on the first league that has guilds, so a region with no small guilds isn't blank
  const [league, setLeague] = useState<League>(() => leagues.find((l) => table[l].length) ?? "small");
  const [selected, setSelected] = useState(0);
  const rows = table[league];

  return (
    <section className="frame rank-window" aria-labelledby="rank-title">
      <h2 className="frame-plate" id="rank-title">{d.title}</h2>
      <p className="rank-sample">{note}</p>
      <div className="rank-head" aria-hidden="true">
        <span>{d.position}</span>
        <span>{d.guild}</span>
        <span className="num">{d.active}</span>
        <span className="num">{d.perMember}</span>
      </div>
      {rows.length === 0 ? (
        <p className="rank-empty">{d.empty}</p>
      ) : (
        <>
          <ol className="rank-rows">
            {rows.map((g, i) => (
              <li key={g.id}>
                <button
                  type="button"
                  className={`rank-row${selected === i ? " is-selected" : ""}`}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                >
                  <span className={`rank-pos rank-pos-${g.rank}`}>
                    {g.rank <= 3 ? <BadgeIcon id={`rank-${g.rank}`} label={String(g.rank)} size={64} /> : g.rank}
                  </span>
                  <span className="rank-name">
                    {g.lastTier && <TierIcon tier={g.lastTier} label={t(lang).tiers.names[g.lastTier - 1]} />}
                    {g.name}
                    {g.change && <Change value={g.change} d={d} />}
                  </span>
                  <span className="num">{d.members(g.active)}</span>
                  <span className="num rank-score">{g.perMember.toFixed(1)}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="rank-hint">{d.hint}</p>
          <Tooltip
            guild={rows[selected]}
            d={d}
            labels={scoreLabels}
            names={badgeNames}
            tiers={t(lang).tiers}
            lords={t(lang).mapPage.lords}
          />
        </>
      )}
      <div className="frame-tabs" role="group" aria-label={d.title}>
        {leagues.map((l) => (
          <button
            key={l}
            type="button"
            className={`frame-tab${league === l ? " is-active" : ""}`}
            aria-pressed={league === l}
            onClick={() => {
              setLeague(l);
              setSelected(0);
            }}
          >
            {d.leagues[l]}
            <small>{d.leagueRange[l]}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
