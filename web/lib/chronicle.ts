// The war chronicle (R-30): a week's march log told as a few lines per guild and region.
// Works on the packed events of a TerritoryWeekView, so the browser and the server share it.
import { EV, type TerritoryWeekView } from "./territory-view.ts";

export type ChronicleItem =
  | { kind: "lord"; guild: number; region: number; prev: number }
  | { kind: "capture"; guild: number; from: number; cells: number; regions: number[] }
  | { kind: "holdCapital"; guild: number; from: number }
  | { kind: "holdCap"; guild: number; from: number; cells: number }
  | { kind: "expedition"; guild: number; cells: number; region: number }
  | { kind: "capital"; guild: number; region: number }
  | { kind: "grow"; guild: number; cells: number };

// Every guild named in an item, for the guild page filter
export const guildsOf = (i: ChronicleItem) => ("from" in i ? [i.guild, i.from] : "prev" in i && i.prev >= 0 ? [i.guild, i.prev] : [i.guild]);
// Every region named in an item, for the region page filter
export const regionsOf = (i: ChronicleItem) => ("regions" in i ? i.regions : "region" in i ? [i.region] : []);

const top = (counts: Map<number, number>, n: number) => [...counts].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);

// prev: the week before (null for the season's first week), for lord changes
export function chronicle(week: TerritoryWeekView, prev: TerritoryWeekView | null, regionOf: number[]): ChronicleItem[] {
  const e = week.events;
  const captures = new Map<string, { cells: number; regions: Map<number, number> }>();
  const holdCaps = new Map<string, number>();
  const holdCapitals = new Set<string>();
  const far = new Map<number, Map<number, number>>();
  const grow = new Map<number, number>();
  const capitals: ChronicleItem[] = [];
  for (let i = 0; i < e.length; i += 6) {
    const [, kind, g, cell, other] = e.slice(i, i + 6);
    const region = regionOf[cell];
    if (kind === EV.capital) capitals.push({ kind: "capital", guild: g, region });
    else if (kind === EV.capture || kind === EV.farCapture) {
      const key = `${g}:${other}`;
      const c = captures.get(key) ?? captures.set(key, { cells: 0, regions: new Map() }).get(key)!;
      c.cells++;
      c.regions.set(region, (c.regions.get(region) ?? 0) + 1);
    } else if (kind === EV.claim) grow.set(g, (grow.get(g) ?? 0) + 1);
    if (kind === EV.farClaim || kind === EV.farCapture) {
      const m = far.get(g) ?? far.set(g, new Map()).get(g)!;
      m.set(region, (m.get(region) ?? 0) + 1);
    }
    // Holds are told from the defender's side
    if (kind === EV.holdCapital) holdCapitals.add(`${other}:${g}`);
    if (kind === EV.holdCap) holdCaps.set(`${other}:${g}`, (holdCaps.get(`${other}:${g}`) ?? 0) + 1);
  }
  const pair = (k: string) => k.split(":").map(Number);
  const lords: ChronicleItem[] = week.regionLords.flatMap((g, r) => {
    const before = prev ? prev.regionLords[r] : -1;
    return g >= 0 && g !== before ? [{ kind: "lord" as const, guild: g, region: r, prev: before }] : [];
  });
  return [
    ...lords,
    ...[...captures].sort((a, b) => b[1].cells - a[1].cells).map(([k, c]) => {
      const [guild, from] = pair(k);
      return { kind: "capture" as const, guild, from, cells: c.cells, regions: top(c.regions, 2) };
    }),
    ...[...holdCapitals].map((k) => { const [guild, from] = pair(k); return { kind: "holdCapital" as const, guild, from }; }),
    ...[...holdCaps].sort((a, b) => b[1] - a[1]).map(([k, cells]) => { const [guild, from] = pair(k); return { kind: "holdCap" as const, guild, from, cells }; }),
    ...[...far].map(([guild, m]) => ({ kind: "expedition" as const, guild, cells: [...m.values()].reduce((a, b) => a + b, 0), region: top(m, 1)[0] })),
    ...capitals,
    ...[...grow].sort((a, b) => b[1] - a[1]).map(([guild, cells]) => ({ kind: "grow" as const, guild, cells })),
  ];
}

// R-31: what the forecast does to one guild, against the last closed week
export function forecastFor(forecast: TerritoryWeekView, guild: number) {
  const e = forecast.events;
  let gain = 0;
  let loss = 0;
  const threats = new Map<number, number>();
  for (let i = 0; i < e.length; i += 6) {
    const kind = e[i + 1];
    if (kind !== EV.claim && kind !== EV.capture && kind !== EV.farClaim && kind !== EV.farCapture) continue;
    if (e[i + 2] === guild) gain++;
    if (e[i + 4] === guild && (kind === EV.capture || kind === EV.farCapture)) {
      loss++;
      threats.set(e[i + 2], (threats.get(e[i + 2]) ?? 0) + 1);
    }
  }
  const [threat] = top(threats, 1);
  return { gain, loss, threat: threat ?? -1, threatCells: threat === undefined ? 0 : threats.get(threat)! };
}
