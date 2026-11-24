import { t, type Lang } from "@/lib/i18n";
import { leagues, type RankView } from "@/lib/data";
import { BadgeIcon } from "./BadgeIcon";

// One hanging banner per league for last week's first-place guild; nothing until a week has closed
export function Champions({ lang, view, sample }: { lang: Lang; view: RankView; sample: boolean }) {
  const dict = t(lang);
  const d = dict.champions;
  if (view.championWeek === null || !leagues.some((l) => view.champions[l])) return null;

  return (
    <section className="champions" aria-labelledby="champions-title">
      <h2 id="champions-title">{d.title}</h2>
      <p className="champions-sample">{sample ? d.sample(view.championWeek) : d.live(view.championWeek)}</p>
      <ol className="champion-row">
        {leagues.map((league) => {
          const guild = view.champions[league];
          if (!guild) return null;
          const extra = guild.badges.filter((b) => b !== "rank-1");
          return (
            <li className="champion" key={league}>
              <div className="champion-cloth">
                <img className="champion-medal" src="/images/badges/badge-rank-1-320.webp" alt={dict.badges["rank-1"]} />
                <p className="champion-league">{d.league[league]}</p>
                <h3 className="champion-name">{guild.name}</h3>
                <p className="champion-score">
                  <strong>{guild.perMember.toFixed(1)}</strong>
                  <span>{d.score}</span>
                </p>
                {extra.length > 0 && (
                  <ul className="champion-badges" aria-label={d.earned}>
                    {extra.map((b) => (
                      <li key={b}><BadgeIcon id={b} label={dict.badges[b]} size={64} /></li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
