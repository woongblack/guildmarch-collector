import type { Dict } from "@/lib/i18n";
import type { Faction, FactionRow, FactionWeek, Ruleset } from "@/lib/data";

// Our own banners, red for the Horde columns and blue for the Alliance ones; no faction crests
export function FactionBanner({ faction, size = 120 }: { faction: Faction; size?: 120 | 240 }) {
  const color = faction === "horde" ? "red" : "blue";
  return <img className={`faction-banner faction-banner-${size}`} src={`/images/factions/${color}-${size}.webp`} alt="" />;
}

const metrics = ["rankedGuilds", "active", "levels", "perMember"] as const;

function format(m: (typeof metrics)[number], row: FactionRow, d: Dict["factionsPage"]) {
  if (m === "perMember") return row.perMember.toFixed(1);
  if (m === "rankedGuilds") return d.guildsUnit(row.rankedGuilds);
  if (m === "active") return d.peopleUnit(row.active);
  return row.levels.toLocaleString();
}

// Horde reads from the left, Alliance from the right, and each bar shows its share of the pair
function Bar({ share }: { share: number }) {
  return (
    <span className="versus-bar" aria-hidden="true">
      <span className="versus-bar-horde" style={{ width: `${share}%` }} />
    </span>
  );
}

// land: cells each faction's guilds held on the territory map when the week closed
export function Versus({ week, ruleset, dict, land }: { week: FactionWeek; ruleset: Ruleset; dict: Dict; land?: Record<Faction, number> }) {
  const d = dict.factionsPage;
  const horde = week.rows.find((r) => r.ruleset === ruleset && r.faction === "horde")!;
  const alliance = week.rows.find((r) => r.ruleset === ruleset && r.faction === "alliance")!;
  const lead = horde.perMember === alliance.perMember ? null : horde.perMember > alliance.perMember ? "horde" : "alliance";

  return (
    <article className="versus">
      <header className="versus-head">
        <span className="faction-horde"><FactionBanner faction="horde" />{dict.join.factions.horde}</span>
        <h3>{d.ruleset[ruleset]}</h3>
        <span className="faction-alliance"><FactionBanner faction="alliance" />{dict.join.factions.alliance}</span>
      </header>
      <dl className="versus-rows">
        {metrics.map((m) => {
          const h = m === "perMember" ? horde.perMember : horde[m];
          const a = m === "perMember" ? alliance.perMember : alliance[m];
          const share = h + a ? (h / (h + a)) * 100 : 50;
          return (
            <div key={m} className="versus-row">
              <dd className="versus-value faction-horde">{format(m, horde, d)}</dd>
              <dt>
                {d.metrics[m]}
                <Bar share={share} />
              </dt>
              <dd className="versus-value faction-alliance">{format(m, alliance, d)}</dd>
            </div>
          );
        })}
        {land && land.horde + land.alliance > 0 && (
          <div className="versus-row">
            <dd className="versus-value faction-horde">{dict.mapPage.cells(land.horde)}</dd>
            <dt>
              {d.land}
              <Bar share={(land.horde / (land.horde + land.alliance)) * 100} />
            </dt>
            <dd className="versus-value faction-alliance">{dict.mapPage.cells(land.alliance)}</dd>
          </div>
        )}
      </dl>
      <p className={lead ? `versus-lead faction-${lead}` : "versus-lead"}>
        {lead ? d.ahead(dict.join.factions[lead]) : d.even}
      </p>
    </article>
  );
}
