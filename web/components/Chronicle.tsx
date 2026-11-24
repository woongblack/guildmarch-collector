import { t, type Lang } from "@/lib/i18n";
import type { ChronicleItem } from "@/lib/chronicle";

// One chronicle line in words. names are the map's guild names by index, places the region names.
export function chronicleLine(lang: Lang, i: ChronicleItem, names: string[], places: string[]) {
  const d = t(lang).war;
  switch (i.kind) {
    case "lord": return d.lord(names[i.guild], places[i.region], i.prev >= 0 ? names[i.prev] : null);
    case "capture": return d.capture(names[i.guild], names[i.from], i.cells, i.regions.map((r) => places[r]).join(", "));
    case "holdCapital": return d.holdCapital(names[i.guild], names[i.from]);
    case "holdCap": return d.holdCap(names[i.guild], names[i.from], i.cells);
    case "expedition": return d.expedition(names[i.guild], i.cells, places[i.region]);
    case "capital": return d.capital(names[i.guild], places[i.region]);
    case "grow": return d.grow(names[i.guild], i.cells);
  }
}

// The first lines open, the rest folded away so a busy week doesn't push the page down
export function ChronicleList({ lang, items, names, places, open = 8 }: {
  lang: Lang;
  items: ChronicleItem[];
  names: string[];
  places: string[];
  open?: number;
}) {
  const d = t(lang).war;
  if (!items.length) return <p className="chronicle-empty">{d.none}</p>;
  const line = (i: ChronicleItem, k: number) => <li key={k} className={`chronicle-${i.kind}`}>{chronicleLine(lang, i, names, places)}</li>;
  return (
    <>
      <ul className="chronicle-list">{items.slice(0, open).map(line)}</ul>
      {items.length > open && (
        <details className="chronicle-more">
          <summary>{d.more(items.length - open)}</summary>
          <ul className="chronicle-list">{items.slice(open).map((i, k) => line(i, k + open))}</ul>
        </details>
      )}
    </>
  );
}
