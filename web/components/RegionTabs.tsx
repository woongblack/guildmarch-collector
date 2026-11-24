"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Region } from "@/lib/site-data";

// One region choice shared by every panel on the page, so the champions and the rank table move together
const Picked = createContext<[Region, (r: Region) => void] | null>(null);

export function RegionProvider({ initial, children }: { initial: Region; children: ReactNode }) {
  const state = useState<Region>(initial);
  return <Picked.Provider value={state}>{children}</Picked.Provider>;
}

// Hidden when there is only one region to show (the mock season)
export function RegionTabs({ regions, names, label }: { regions: Region[]; names: Record<Region, string>; label: string }) {
  const [picked, pick] = useContext(Picked)!;
  if (regions.length < 2) return null;
  return (
    <div className="region-tabs" role="group" aria-label={label}>
      {regions.map((r) => (
        <button key={r} type="button" className={`region-tab${picked === r ? " is-active" : ""}`} aria-pressed={picked === r} onClick={() => pick(r)}>
          {names[r]}
        </button>
      ))}
    </div>
  );
}

export function RegionPanel({ region, children }: { region: Region; children: ReactNode }) {
  const [picked] = useContext(Picked)!;
  return picked === region ? <>{children}</> : null;
}
