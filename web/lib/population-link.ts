import { population, type Region, type Ruleset } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

// Below this one guild swings the numbers, so a region and ruleset gets no page of its own (R-47)
export const POP_MIN = 100;

export const hasPopulationBoard = (region: Region, ruleset: Ruleset) =>
  population().some((g) => g.region === region && g.ruleset === ruleset && g.characters >= POP_MIN);

// Link to one region and ruleset's population page, titled the way people search, from the ranks,
// faction and guild pages; null while that group is too small to have one
export function populationLink(lang: Lang, region: Region, ruleset: Ruleset) {
  if (!hasPopulationBoard(region, ruleset)) return null;
  const d = t(lang).population;
  return {
    href: `/${lang}/population/${region}-${ruleset}/`,
    label: d.boardTitle(d.boardWhere(d.regionNames[region], t(lang).join.rulesets[ruleset])),
  };
}
