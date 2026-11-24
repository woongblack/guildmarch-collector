import { guildCards, type Region } from "@/lib/data";
import { regionDigest, type DigestItem } from "@/lib/digest";
import { t, updatedAt, type Lang } from "@/lib/i18n";
import { regionNames } from "@/lib/map-regions";

// "Since the last update" under a region's rank window (roadmap 5). Nothing until a build has the
// previous update's summary to compare with.
export function Digest({ lang, region }: { lang: Lang; region: Region }) {
  const { since, items } = regionDigest(region);
  if (!items.length) return null;
  const dict = t(lang);
  const d = dict.digest;
  const names = new Map(guildCards().map((g) => [g.id, g.name]));
  const name = (id: string) => names.get(id) ?? "?";
  const places = regionNames(lang);
  const ruleset = (r: string) => dict.join.rulesets[r as keyof typeof dict.join.rulesets] ?? r;
  const line = (i: DigestItem) => {
    switch (i.kind) {
      case "newWeek": return d.newWeek(i.week);
      case "climb": return d.climb(name(i.id), dict.rank.leagues[i.league as keyof typeof dict.rank.leagues], i.from, i.to);
      case "siege": return d.siege(ruleset(i.ruleset), places[i.place], name(i.attacker), name(i.defender));
      case "lord": return d.lord(ruleset(i.ruleset), places[i.place], name(i.id));
    }
  };
  return (
    <section className="digest" aria-label={d.title}>
      <h2 className="digest-title">{d.title}</h2>
      <ul className="digest-list">
        {items.map((i, k) => <li key={k} className={`digest-${i.kind}`}>{line(i)}</li>)}
      </ul>
      {since && <p className="digest-since">{d.since(updatedAt(lang, since))}</p>}
    </section>
  );
}
