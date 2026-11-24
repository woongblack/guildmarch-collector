import { t, type Lang } from "@/lib/i18n";
import type { PopulationGroup } from "@/lib/site-data";

// Share as a percent: one decimal under 10%, whole numbers above, so small shares stay readable
export const pct = (n: number, of: number) => {
  const p = of ? (n / of) * 100 : 0;
  return `${p < 10 ? p.toFixed(1) : Math.round(p)}%`;
};

// Horde and Alliance on one bar per group, so a 50% line splits every row the same way
export function FactionSplit({ lang, groups }: { lang: Lang; groups: PopulationGroup[] }) {
  const dict = t(lang);
  const f = dict.join.factions;
  return (
    <figure className="pop-split">
      <figcaption>
        <span className="pop-key is-horde">{f.horde}</span>
        <span className="pop-key is-alliance">{f.alliance}</span>
      </figcaption>
      <ul>
        {groups.map((g) => {
          const horde = (g.horde / g.characters) * 100;
          return (
            <li key={g.region + g.ruleset}>
              <span className="pop-split-label">
                {dict.join.regions[g.region]} · {dict.join.rulesets[g.ruleset]}
                <small>{dict.population.cols.characters} {g.characters.toLocaleString()}</small>
              </span>
              <span className="pop-split-value">{pct(g.horde, g.characters)}</span>
              <span className="pop-split-track" role="img" aria-label={`${f.horde} ${pct(g.horde, g.characters)}, ${f.alliance} ${pct(g.characters - g.horde, g.characters)}`}>
                <span className="pop-split-bar is-horde" style={{ width: `${horde}%` }} />
                <span className="pop-split-bar is-alliance" style={{ width: `${100 - horde}%` }} />
              </span>
              <span className="pop-split-value">{pct(g.characters - g.horde, g.characters)}</span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
