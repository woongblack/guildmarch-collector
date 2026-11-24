import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import type { Badge, Faction, League, Region, Ruleset } from "@/lib/data";
import { BadgeIcon } from "./BadgeIcon";
import { TierIcon } from "./TierIcon";

export type ListRow = {
  id: string;
  name: string;
  league: League;
  rank: number;
  active: number;
  perMember: number;
  tier: number | null;
  faction: Faction;
  // Set when one list mixes regions (the tier and badge pages)
  region?: Region;
  ruleset?: Ruleset;
  badges?: Badge[];
  lords?: number;
};

// A plain ranked list for the region and week pages: every league on the page at once, so the
// whole table is in the HTML (the landing's rank window shows one league at a time)
export function RankList({ lang, region, rows, linked }: { lang: Lang; region?: Region; rows: ListRow[]; linked: boolean }) {
  const dict = t(lang);
  const d = dict.guilds;
  const j = dict.join;
  return (
    <ol className="finder-rows">
      <li className="finder-head" aria-hidden="true">
        <span>{d.columns.guild}</span>
        <span>{dict.boards.leagueRank}</span>
        <span className="num">{d.columns.active}</span>
        <span className="num">{d.columns.perMember}</span>
      </li>
      {rows.map((r) => {
        const body = (
          <>
            <span className="finder-name">
              <strong>
                {r.tier && <TierIcon tier={r.tier} label={dict.tiers.names[r.tier - 1]} />}
                {r.name}
              </strong>
              <span className="tags">
                {r.region && <>{j.regions[r.region]} · </>}
                {r.ruleset && <>{j.rulesets[r.ruleset]} · </>}
                <span className={`faction-${r.faction}`}>{j.factions[r.faction]}</span>
                {r.lords ? <> · <span className="tag-lord">{dict.mapPage.lords(r.lords)}</span></> : null}
              </span>
            </span>
            <span className="finder-standing">
              {r.rank <= 3 && <BadgeIcon id={`rank-${r.rank}`} label="" size={64} />}
              {d.rank(dict.rank.leagues[r.league], r.rank)}
            </span>
            <span className="num">{r.active}</span>
            <span className="num finder-score">{r.perMember.toFixed(1)}</span>
            {r.badges && r.badges.some((b) => !b.startsWith("rank-")) && (
              <span className="list-badges">
                {r.badges.filter((b) => !b.startsWith("rank-")).map((b) => <BadgeIcon key={b} id={b} label={dict.badges[b]} size={64} />)}
              </span>
            )}
          </>
        );
        return (
          <li key={r.id}>
            {linked ? <Link className="finder-row" href={`/${lang}/guild/${r.region ?? region}/${r.id}/`}>{body}</Link> : <div className="finder-row">{body}</div>}
          </li>
        );
      })}
    </ol>
  );
}
