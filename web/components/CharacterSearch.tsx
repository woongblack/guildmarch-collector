"use client";

import { useEffect, useMemo, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

type Entry = { n: string; c: string; g: string; l: number | null };
const SHOW = 30;

// Roadmap 7: find a character by name and jump to its row on the guild page. The region's index
// is fetched on first use; guild names come with the page.
export function CharacterSearch({ lang, regions, guilds }: { lang: Lang; regions: { id: string; name: string }[]; guilds: Record<string, { name: string; region: string }> }) {
  const d = t(lang).characters;
  const [region, setRegion] = useState(regions[0]?.id ?? "kr");
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Record<string, Entry[] | "loading" | "failed">>({});
  const list = index[region];

  useEffect(() => {
    if (q.trim().length < 2 || list) return;
    setIndex((x) => ({ ...x, [region]: "loading" }));
    fetch(`/data/characters/${region}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Entry[]) => setIndex((x) => ({ ...x, [region]: data })))
      .catch(() => setIndex((x) => ({ ...x, [region]: "failed" })));
  }, [q, region, list]);

  const hits = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2 || !Array.isArray(list)) return [];
    return list
      .filter((e) => e.n.toLowerCase().includes(term))
      .sort((a, b) => Number(!b.n.toLowerCase().startsWith(term)) - Number(!a.n.toLowerCase().startsWith(term)) || a.n.localeCompare(b.n));
  }, [q, list]);

  return (
    <div className="char-search">
      <div className="char-search-row">
        <label>
          <span>{d.region}</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label className="char-search-name">
          <span>{d.label}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.placeholder} autoComplete="off" />
        </label>
      </div>
      <div role="status" className="char-search-status">
        {list === "loading" && d.loading}
        {list === "failed" && d.failed}
        {Array.isArray(list) && q.trim().length >= 2 && !hits.length && d.none}
        {hits.length > SHOW && d.many(hits.length)}
      </div>
      {hits.length > 0 && (
        <ul className="char-results">
          {hits.slice(0, SHOW).map((e) => {
            const g = guilds[e.g];
            return (
              <li key={e.c}>
                <a href={`/${lang}/guild/${g?.region ?? region}/${e.g}/#c-${encodeURIComponent(e.c)}`}>
                  <strong>{e.n}</strong>
                  {e.l !== null && <span className="char-level">Lv {e.l}</span>}
                  <span className="char-guild">{d.result(g?.name ?? "")}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
