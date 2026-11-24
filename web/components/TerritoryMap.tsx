"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { chronicle, guildsOf } from "@/lib/chronicle";
import { t, updatedAt, type Lang } from "@/lib/i18n";
import { EV, type TerritoryMap } from "@/lib/territory-view";
import { ChronicleList } from "./Chronicle";
import { Countdown } from "./Countdown";
import { GuildBanner } from "./GuildBanner";
import { TierIcon } from "./TierIcon";

const W = 1672;
const H = 941;
const MAX_ZOOM = 6;
// Map width on screen, in px, below which labels thin out: lords only, then none
const LABELS_ALL = 1100;
const LABELS_LORDS = 640;

// cells.png holds cell id + 1 in red (high byte) and green (low byte); 0 is sea
type Pixels = { cell: Int16Array; cellEdge: Uint8Array; regionEdge: Uint8Array };

async function loadPixels(regions: number[]): Promise<Pixels> {
  const blob = await (await fetch("/images/territory/cells.png")).blob();
  // No colour management, so the encoded ids survive exactly
  const bitmap = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  const data = ctx.getImageData(0, 0, W, H).data;
  const cell = new Int16Array(W * H);
  for (let p = 0; p < W * H; p++) cell[p] = ((data[p * 4] << 8) | data[p * 4 + 1]) - 1;
  const cellEdge = new Uint8Array(W * H);
  const regionEdge = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      const c = cell[p];
      if (c < 0) continue;
      for (const q of [x + 1 < W ? p + 1 : -1, y + 1 < H ? p + W : -1]) {
        if (q < 0) continue;
        const d = cell[q];
        if (d >= 0 && d !== c) {
          cellEdge[p] = 1;
          if (regions[d] !== regions[c]) regionEdge[p] = 1;
        }
      }
    }
  }
  return { cell, cellEdge, regionEdge };
}

// One arrow on the war overlay, in map pixels. n: how many moves it stands for (aggregated views)
type Arrow = { x1: number; y1: number; x2: number; y2: number; guild: number; capture: boolean; far: boolean; n: number };
type Shield = { cell: number; until: number };
// One capture or expedition, kept for a few turns so the replay shows a front pushing forward
type Move = { at: number; guild: number; from: number; cell: number; src: number; far: boolean };
// Replay state that changes every turn; kept in a ref and redrawn on each step
type Play = { owner: number[]; fresh: Set<number>; moves: Move[]; bursts: { cell: number; guild: number }[]; arrows: Arrow[]; shields: Shield[] };
// Turns a capture stays on the overlay as part of a push arrow
const TRAIL = 6;
// Sieges drawn on the map at once; more turn it into noise
const SIEGES_ON_MAP = 6;
type Replay = { rounds: number[]; at: number; playing: boolean; speed: number };
const isMove = (kind: number) => kind >= EV.claim && kind <= EV.farCapture;
const isCapture = (kind: number) => kind === EV.capture || kind === EV.farCapture;
const isFar = (kind: number) => kind === EV.farClaim || kind === EV.farCapture;

// Moves summed by attacker, defender, region and kind: one arrow each from where they came from to
// where they landed. A one-cell step is too short to see, so a push reads as one thick arrow.
function groupMoves(moves: Move[], centres: [number, number][], regionOf: number[]): Arrow[] {
  const groups = new Map<string, Arrow>();
  for (const m of moves) {
    const key = `${m.guild}:${m.from}:${regionOf[m.cell]}:${m.far}`;
    const a = groups.get(key) ?? groups.set(key, { x1: 0, y1: 0, x2: 0, y2: 0, guild: m.guild, capture: m.from >= 0, far: m.far, n: 0 }).get(key)!;
    a.x1 += centres[m.src][0]; a.y1 += centres[m.src][1]; a.x2 += centres[m.cell][0]; a.y2 += centres[m.cell][1];
    a.n++;
  }
  return [...groups.values()].map((a) => {
    const x1 = a.x1 / a.n, y1 = a.y1 / a.n, x2 = a.x2 / a.n, y2 = a.y2 / a.n;
    // Stretch short pushes backwards so the arrow is long enough to read
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const k = len < 90 ? 90 / len : 1;
    return { ...a, x1: x2 - (x2 - x1) * k, y1: y2 - (y2 - y1) * k, x2, y2 };
  });
}

const movesOf = (events: number[], at = 0): Move[] => {
  const out: Move[] = [];
  for (let i = 0; i < events.length; i += 6) {
    const [, kind, guild, cell, from, src] = events.slice(i, i + 6);
    if (isCapture(kind) || isFar(kind)) out.push({ at, guild, from, cell, src, far: isFar(kind) });
  }
  return out;
};

// A whole week at a glance (the forecast, and the replay when motion is reduced): only the biggest
// pushes, since dozens of arrows bury the map. Expeditions are left to the animated replay.
const AT_A_GLANCE = 10;
const aggregate = (events: number[], centres: [number, number][], regionOf: number[]) =>
  groupMoves(movesOf(events).filter((m) => !m.far && m.from >= 0), centres, regionOf).sort((a, b) => b.n - a.n).slice(0, AT_A_GLANCE);

// moving: a banner token marches along the arrow and the dashes flow, unless motion is reduced
function ArrowShape({ a, colour, dim, token, moving }: { a: Arrow; colour: string; dim: boolean; token?: string; moving: boolean }) {
  const dx = a.x2 - a.x1;
  const dy = a.y2 - a.y1;
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  const width = (a.capture ? 9 : 6) + Math.min(a.n, 12) * 0.7;
  const head = Math.min(len * 0.55, 16 + width * 2);
  const bx = a.x2 - ux * head;
  const by = a.y2 - uy * head;
  const points = `${a.x2},${a.y2} ${bx - uy * head * 0.55},${by + ux * head * 0.55} ${bx + uy * head * 0.55},${by - ux * head * 0.55}`;
  const dash = a.far ? "14 10" : undefined;
  return (
    <g className={dim ? "war-arrow is-dim" : "war-arrow"}>
      <line x1={a.x1} y1={a.y1} x2={bx} y2={by} stroke="#120a04" strokeWidth={width + 4} strokeDasharray={dash} strokeLinecap="round" />
      <line x1={a.x1} y1={a.y1} x2={bx} y2={by} stroke={colour} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={points} fill={colour} stroke="#120a04" strokeWidth={3} strokeLinejoin="round" />
      {moving && <line className="war-flow" x1={a.x1} y1={a.y1} x2={bx} y2={by} strokeWidth={Math.max(2, width * 0.35)} />}
      {moving && token && (
        <g className="war-token">
          <g transform="translate(-13 -40)"><GuildBanner id={token} color={colour} size={34} /></g>
          <animateMotion dur={`${Math.min(3.2, 1.2 + len / 220)}s`} repeatCount="indefinite" path={`M${a.x1} ${a.y1} L${bx} ${by}`} />
        </g>
      )}
    </g>
  );
}

// A region under siege in the forecast: rings pulsing in the attacker's colour round the region,
// and the attacker's banner planted at its edge
function SiegeShape({ x, y, colour, token, moving }: { x: number; y: number; colour: string; token: string; moving: boolean }) {
  return (
    <g className={moving ? "war-siege is-moving" : "war-siege"} transform={`translate(${x} ${y})`}>
      <circle className="siege-ring" r={52} stroke={colour} />
      <circle className="siege-ring is-late" r={52} stroke={colour} />
      <g className="siege-flag" transform="translate(30 -74)"><GuildBanner id={token} color={colour} size={40} /></g>
    </g>
  );
}

// A heater shield where an attack was stopped (capital or weekly loss cap)
function ShieldShape({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="war-shield" d="M-16 -19h32v14c0 15-16 24-16 24c0 0-16-9-16-24z" />
    </g>
  );
}

function rgb(hsl: string): [number, number, number] {
  const [h, s, l] = hsl.match(/[\d.]+/g)!.map(Number);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

export function TerritoryMapView({ lang, maps, regions, regionNames, labels, centres }: {
  lang: Lang;
  maps: TerritoryMap[];
  regions: number[];
  regionNames: string[];
  labels: [number, number][];
  // Centre of each cell in map pixels, for arrows and shields
  centres: [number, number][];
}) {
  const dict = t(lang);
  const d = dict.mapPage;
  const [mapIndex, setMapIndex] = useState(0);
  const map = maps[mapIndex];
  const w_ = t(lang).war;
  // Closed weeks, then the forecast for the open week when there is one (R-31)
  const views = useMemo(() => (map.forecast ? [...map.weeks, map.forecast] : map.weeks), [map]);
  // The map opens on the forecast when there is one: it is the live state of the war
  const [weekIndex, setWeekIndex] = useState(map.forecast ? map.weeks.length : map.weeks.length - 1);
  const [still, setStill] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(q.matches);
    const on = () => setStill(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  const wi = Math.min(weekIndex, views.length - 1);
  const week = views[wi];
  const prevWeek = wi > 0 ? views[wi - 1] : null;
  const forecastShown = map.forecast !== null && wi === views.length - 1;
  const [replay, setReplay] = useState<Replay | null>(null);
  const replayRef = useRef<Replay | null>(null);
  replayRef.current = replay;
  const play = useRef<Play | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; cell: number } | null>(null);
  const [pixels, setPixels] = useState<Pixels | null>(null);
  const [failed, setFailed] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const view = useRef({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: number; dist: number } | null>(null);
  const colours = useMemo(() => map.guilds.map((g) => rgb(g.color)), [map]);

  useEffect(() => {
    loadPixels(regions).then(setPixels, () => setFailed(true));
  }, [regions]);

  // ?ruleset=pvp&guild=id opens a map with one guild picked out
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m = maps.findIndex((x) => x.ruleset === q.get("ruleset"));
    const mi = m >= 0 ? m : 0;
    if (m >= 0) setMapIndex(m);
    const gi = maps[mi].guilds.findIndex((g) => g.id === q.get("guild"));
    if (gi >= 0) setFocus(gi);
  }, [maps]);

  // The forecast lights up the cells that would change hands (R-31)
  const changed = useMemo(() => {
    if (!forecastShown || !prevWeek) return new Set<number>();
    return new Set(week.owner.flatMap((o, c) => (o !== prevWeek.owner[c] ? [c] : [])));
  }, [forecastShown, week, prevWeek]);

  useEffect(() => {
    if (!pixels || !canvas.current) return;
    const ctx = canvas.current.getContext("2d")!;
    const img = ctx.createImageData(W, H);
    const out = img.data;
    const { cell, cellEdge, regionEdge } = pixels;
    const capital = new Set(week.capitals.filter((c) => c >= 0));
    const owners = replay && play.current ? play.current.owner : week.owner;
    const lit = replay && play.current ? play.current.fresh : changed;
    for (let p = 0; p < W * H; p++) {
      const c = cell[p];
      if (c < 0) continue;
      const o = owners[c];
      const i = p * 4;
      if (regionEdge[p]) {
        out[i] = 20; out[i + 1] = 12; out[i + 2] = 4; out[i + 3] = 190;
        continue;
      }
      if (o < 0) {
        if (cellEdge[p]) { out[i] = 30; out[i + 1] = 20; out[i + 2] = 10; out[i + 3] = 45; }
        continue;
      }
      const [r, g, b] = colours[o];
      out[i] = r; out[i + 1] = g; out[i + 2] = b;
      const dim = focus !== null && focus !== o;
      out[i + 3] = dim ? (cellEdge[p] ? 40 : 18) : capital.has(c) || lit.has(c) ? 235 : cellEdge[p] ? 170 : 105;
      // A cell taken this turn flashes with a light edge
      if (lit.has(c) && cellEdge[p] && !dim) { out[i] = 255; out[i + 1] = 244; out[i + 2] = 200; }
    }
    ctx.putImageData(img, 0, 0);
  }, [pixels, week, colours, focus, replay, changed]);

  // R-30 replay: start from each cell's owner before the march, then apply one turn at a time
  const reduced = () => still;
  function startReplay() {
    const e = week.events;
    if (!e.length) return;
    const before = new Map<number, number>();
    for (let i = 0; i < e.length; i += 6) {
      const [, kind, , cell, from] = e.slice(i, i + 6);
      if ((kind === EV.capital || isMove(kind)) && !before.has(cell)) before.set(cell, kind === EV.capital ? -1 : from);
    }
    const owner = week.owner.map((o, c) => (before.has(c) ? before.get(c)! : o));
    const rounds = [...new Set(Array.from({ length: e.length / 6 }, (_, k) => e[k * 6]))].sort((a, b) => a - b);
    play.current = { owner, fresh: new Set(), moves: [], bursts: [], arrows: [], shields: [] };
    if (reduced()) {
      // No motion: the week's end state at once, with the captures summed into a few arrows
      play.current = { owner: week.owner.slice(), fresh: new Set(before.keys()), moves: [], bursts: [], arrows: aggregate(e, centres, regions), shields: holdCells(e, rounds.length) };
      setReplay({ rounds, at: rounds.length - 1, playing: false, speed: 1 });
      return;
    }
    setReplay({ rounds, at: -1, playing: true, speed: replay?.speed ?? 1 });
  }

  // At a glance only capitals that held; the replay shows every stopped attack as it happens
  const holdCells = (e: number[], until: number): Shield[] => {
    const seen = new Set<number>();
    for (let i = 0; i < e.length; i += 6) if (e[i + 1] === EV.holdCapital) seen.add(e[i + 3]);
    return [...seen].map((cell) => ({ cell, until }));
  };

  const advance = useCallback(() => {
    const r = replayRef.current;
    const p = play.current;
    if (!r || !p) return;
    if (r.at >= r.rounds.length - 1) { setReplay({ ...r, playing: false }); return; }
    const at = r.at + 1;
    const round = r.rounds[at];
    const e = week.events;
    p.fresh = new Set();
    p.bursts = [];
    p.moves = p.moves.filter((m) => m.at > at - TRAIL);
    for (let i = 0; i < e.length; i += 6) {
      if (e[i] !== round) continue;
      const [, kind, g, cell, from, src] = e.slice(i, i + 6);
      if (kind === EV.capital || isMove(kind)) { p.owner[cell] = g; p.fresh.add(cell); }
      if ((isCapture(kind) || isFar(kind)) && src >= 0) {
        p.moves.push({ at, guild: g, from, cell, src, far: isFar(kind) });
        if (isCapture(kind)) p.bursts.push({ cell, guild: g });
      }
      if (kind === EV.holdCapital || kind === EV.holdCap) p.shields.push({ cell, until: at + 4 });
    }
    p.arrows = groupMoves(p.moves, centres, regions);
    p.shields = p.shields.filter((s) => s.until >= at);
    setReplay({ ...r, at, playing: r.playing && at < r.rounds.length - 1 });
  }, [week, centres, regions]);

  useEffect(() => {
    if (!replay?.playing) return;
    // About fifteen seconds for a whole week at 1x, however many turns it has
    const ms = Math.max(40, Math.min(450, 15000 / replay.rounds.length)) / replay.speed;
    const id = setInterval(advance, ms);
    return () => clearInterval(id);
  }, [replay?.playing, replay?.speed, replay?.rounds.length, advance]);

  // Another map or week ends the replay
  useEffect(() => { setReplay(null); play.current = null; }, [mapIndex, wi]);

  const arrows = replay && play.current ? play.current.arrows : forecastShown ? aggregate(week.events, centres, regions) : [];
  const shields = replay && play.current ? play.current.shields : forecastShown ? holdCells(week.events, 0) : [];
  const items = useMemo(() => chronicle(week, prevWeek, regions), [week, prevWeek, regions]);
  const shownItems = focus === null ? items : items.filter((i) => guildsOf(i).includes(focus));
  // The map marks only the most important sieges (lordships first, then size); the list below has all
  const allSieges = forecastShown && !replay ? map.sieges : [];
  const sieges = allSieges.slice(0, SIEGES_ON_MAP);
  const besieged = new Map(sieges.map((x) => [x.region, x]));

  function apply() {
    const { s, x, y } = view.current;
    if (!stage.current || !viewport.current) return;
    stage.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    // Labels keep their on-screen size and show more as the map grows
    stage.current.style.setProperty("--unscale", String(1 / s));
    const width = viewport.current.getBoundingClientRect().width * s;
    viewport.current.dataset.labels = width >= LABELS_ALL ? "all" : width >= LABELS_LORDS ? "lords" : "none";
  }

  useEffect(() => {
    apply();
    const ro = new ResizeObserver(apply);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, []);

  function zoomAt(factor: number, cx?: number, cy?: number) {
    const box = viewport.current!.getBoundingClientRect();
    const v = view.current;
    const s = Math.min(MAX_ZOOM, Math.max(1, v.s * factor));
    const mx = cx ?? box.width / 2;
    const my = cy ?? box.height / 2;
    v.x = mx - ((mx - v.x) / v.s) * s;
    v.y = my - ((my - v.y) / v.s) * s;
    v.s = s;
    clamp();
    apply();
  }

  function clamp() {
    const box = viewport.current!.getBoundingClientRect();
    const v = view.current;
    v.x = Math.min(0, Math.max(box.width - box.width * v.s, v.x));
    v.y = Math.min(0, Math.max(box.height - box.height * v.s, v.y));
  }

  // Wheel zoom needs a non-passive listener to keep the page from scrolling
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const box = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - box.left, e.clientY - box.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  function cellAt(clientX: number, clientY: number) {
    if (!pixels || !stage.current) return -1;
    const r = stage.current.getBoundingClientRect();
    const x = Math.floor(((clientX - r.left) / r.width) * W);
    const y = Math.floor(((clientY - r.top) / r.height) * H);
    if (x < 0 || y < 0 || x >= W || y >= H) return -1;
    return pixels.cell[y * W + x];
  }

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    // The zoom buttons sit on the map; capturing their pointer would swallow the click
    if ((e.target as Element).closest("button")) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic or already-released pointers can't be captured; dragging still works
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pointers.current.values()];
    gesture.current = { moved: 0, dist: ps.length === 2 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0 };
  }

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    const box = viewport.current!.getBoundingClientRect();
    const prev = pointers.current.get(e.pointerId);
    if (!prev) {
      if (e.pointerType === "mouse") {
        const cell = cellAt(e.clientX, e.clientY);
        setHover(cell >= 0 ? { x: e.clientX - box.left, y: e.clientY - box.top, cell } : null);
      }
      return;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current!;
    const ps = [...pointers.current.values()];
    if (ps.length === 2) {
      const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (g.dist) zoomAt(dist / g.dist, (ps[0].x + ps[1].x) / 2 - box.left, (ps[0].y + ps[1].y) / 2 - box.top);
      g.dist = dist;
      g.moved += 10;
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    g.moved += Math.abs(dx) + Math.abs(dy);
    view.current.x += dx;
    view.current.y += dy;
    clamp();
    apply();
    setHover(null);
  }

  function onUp(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    // A press that barely moved is a tap: pick out the guild that holds that cell
    if (gesture.current && gesture.current.moved < 6 && pointers.current.size === 0) {
      const cell = cellAt(e.clientX, e.clientY);
      const o = cell >= 0 ? week.owner[cell] : -1;
      setFocus(o >= 0 && o !== focus ? o : null);
    }
    if (pointers.current.size === 0) gesture.current = null;
  }

  function reset() {
    view.current = { s: 1, x: 0, y: 0 };
    apply();
  }

  const order = map.guilds.map((_, i) => i).sort((a, b) => week.cells[b] - week.cells[a]);
  const hoverOwner = hover ? week.owner[hover.cell] : -1;
  const hoverRegion = hover ? regions[hover.cell] : -1;
  const hoverLord = hoverRegion >= 0 ? week.regionLords[hoverRegion] : -1;
  const focusRegions = focus === null ? [] : week.regionLords.flatMap((g, r) => (g === focus ? [regionNames[r]] : []));
  const factionCells = { horde: 0, alliance: 0 };
  map.guilds.forEach((g, i) => (factionCells[g.faction] += week.cells[i]));
  const held = factionCells.horde + factionCells.alliance;
  const hordeShare = held ? Math.round((factionCells.horde / held) * 100) : 50;

  return (
    <div className="tmap">
      <div className="tmap-controls">
        <div className="tmap-tabs" role="group" aria-label={d.rulesetLabel}>
          {maps.map((m, i) => (
            <button key={m.ruleset} type="button" className={i === mapIndex ? "tmap-tab is-active" : "tmap-tab"} aria-pressed={i === mapIndex}
              onClick={() => { setMapIndex(i); setWeekIndex(m.forecast ? m.weeks.length : m.weeks.length - 1); setFocus(null); }}>
              {dict.join.regions[m.region]} · {dict.factionsPage.ruleset[m.ruleset]}
            </button>
          ))}
        </div>
        <div className="tmap-tabs" role="group" aria-label={d.weekLabel}>
          {views.map((w, i) => {
            const ahead = map.forecast !== null && i === views.length - 1;
            return (
              <button key={ahead ? "forecast" : w.week} type="button" className={`tmap-tab${i === wi ? " is-active" : ""}${ahead ? " is-forecast" : ""}`}
                aria-pressed={i === wi} onClick={() => setWeekIndex(i)}>
                {ahead ? w_.forecastTab(w.week) : d.week(w.week)}
              </button>
            );
          })}
        </div>
      </div>

      {forecastShown
        ? <p className="tmap-stats tmap-forecast-note"><Countdown lang={lang} closesAt={map.closesAt} /> · {w_.forecastNote(map.asOf ? updatedAt(lang, map.asOf) : null)}</p>
        : <p className="tmap-stats">{d.stats(week.week, week.multiplier, week.claimed, week.captured)}</p>}

      <div className="tmap-war-bar" role="group" aria-label={w_.controls}>
        {!week.events.length ? (
          <span className="tmap-war-note">{w_.noLog}</span>
        ) : !replay ? (
          <button type="button" className="tmap-war-btn is-primary" onClick={startReplay}>▶ {w_.replay}</button>
        ) : (
          <>
            {replay.at < replay.rounds.length - 1 && (
              <button type="button" className="tmap-war-btn" onClick={() => setReplay({ ...replay, playing: !replay.playing })} aria-pressed={replay.playing}>
                {replay.playing ? `❚❚ ${w_.pause}` : `▶ ${w_.play}`}
              </button>
            )}
            {replay.at < replay.rounds.length - 1 && <button type="button" className="tmap-war-btn" onClick={() => { setReplay({ ...replay, playing: false }); advance(); }}>⏭ {w_.step}</button>}
            <span className="tmap-war-speed" role="group" aria-label={w_.speed}>
              {[1, 2, 4].map((x) => (
                <button key={x} type="button" className={replay.speed === x ? "tmap-war-btn is-on" : "tmap-war-btn"} aria-pressed={replay.speed === x}
                  onClick={() => setReplay({ ...replay, speed: x })}>{x}×</button>
              ))}
            </span>
            <span className="tmap-war-turn" aria-live="polite">{w_.turn(Math.max(0, replay.at + 1), replay.rounds.length)}</span>
            <button type="button" className="tmap-war-btn" onClick={() => { setReplay(null); play.current = null; }}>■ {w_.stop}</button>
          </>
        )}
        <span className="tmap-war-legend" aria-hidden="true">
          <span className="legend-capture">➜ {w_.legend.capture}</span>
          <span className="legend-far">⇢ {w_.legend.expedition}</span>
          <span className="legend-hold">⛨ {w_.legend.hold}</span>
        </span>
      </div>
      {held > 0 && (
        <div className="tmap-factions">
          <span className="tmap-factions-label">{d.factionShare}</span>
          <span className="faction-horde">{dict.join.factions.horde} {hordeShare}%</span>
          <span className="versus-bar" aria-hidden="true"><span className="versus-bar-horde" style={{ width: `${hordeShare}%` }} /></span>
          <span className="faction-alliance">{dict.join.factions.alliance} {100 - hordeShare}%</span>
          <small>{d.factionBasis}</small>
        </div>
      )}

      <div className="tmap-body">
        <div
          className="tmap-viewport frame"
          ref={viewport}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => setHover(null)}
        >
          <div className="tmap-stage" ref={stage}>
            <img src="/images/territory/azeroth-map.webp" alt="" draggable={false} />
            <canvas ref={canvas} width={W} height={H} role="img" aria-label={d.canvasLabel(week.week)} />
            <svg className="tmap-war" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {sieges.map((x) => (
                <SiegeShape key={x.region} x={labels[x.region][0]} y={labels[x.region][1]} colour={map.guilds[x.attacker].color} token={map.guilds[x.attacker].id} moving={!still} />
              ))}
              {arrows.map((a, k) => (
                <ArrowShape key={`${replay?.at ?? "f"}-${k}`} a={a} colour={map.guilds[a.guild].color} dim={focus !== null && a.guild !== focus}
                  token={a.capture || a.far ? map.guilds[a.guild].id : undefined} moving={!still} />
              ))}
              {replay && play.current?.bursts.map((b) => (
                <circle key={`${replay.at}-${b.cell}`} className="war-burst" cx={centres[b.cell][0]} cy={centres[b.cell][1]} r={28} stroke={map.guilds[b.guild].color} />
              ))}
              {shields.map((s) => <ShieldShape key={s.cell} x={centres[s.cell][0]} y={centres[s.cell][1]} />)}
            </svg>
            <div className="tmap-labels" aria-hidden="true">
              {labels.map(([x, y], r) => {
                const lord = week.regionLords[r];
                const siege = besieged.get(r);
                const cls = `tmap-label${lord >= 0 ? " has-lord" : ""}${siege ? " is-besieged" : ""}${focus !== null && lord !== focus && siege?.attacker !== focus ? " is-dim" : ""}`;
                return (
                  <span key={r} className={cls} style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}>
                    <span className="tmap-label-region">{regionNames[r]}</span>
                    {lord >= 0 && (
                      <span className="tmap-label-lord">
                        <GuildBanner id={map.guilds[lord].id} color={map.guilds[lord].color} size={15} />
                        {map.guilds[lord].name}
                      </span>
                    )}
                    {siege && <span className="tmap-label-siege">{w_.siegeTag(map.guilds[siege.attacker].name)}</span>}
                  </span>
                );
              })}
            </div>
          </div>
          {!pixels && <p className="tmap-loading">{failed ? d.failed : d.loading}</p>}
          {hover && (
            <div className="tooltip tmap-tip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
              <p className="tooltip-name">{hoverOwner >= 0 ? map.guilds[hoverOwner].name : d.unclaimed}</p>
              <p>{regionNames[hoverRegion]}{week.capitals.includes(hover.cell) ? ` · ${d.capital}` : ""}</p>
              {hoverLord >= 0 && <p className="tooltip-kicker">{d.lordOf}: {map.guilds[hoverLord].name}</p>}
            </div>
          )}
          <div className="tmap-zoom">
            <button type="button" onClick={() => zoomAt(1.5)} aria-label={d.zoomIn}>+</button>
            <button type="button" onClick={() => zoomAt(1 / 1.5)} aria-label={d.zoomOut}>−</button>
            <button type="button" onClick={reset} aria-label={d.reset}>⤢</button>
          </div>
        </div>

        <section className="tmap-legend frame" aria-labelledby="legend-title">
          <h2 className="frame-plate" id="legend-title">{d.legend}</h2>
          <ol>
            {order.map((i) => {
              const g = map.guilds[i];
              const tier = week.tiers[i];
              return (
                <li key={g.id}>
                  <button type="button" className={focus === i ? "tmap-guild is-focus" : "tmap-guild"} aria-pressed={focus === i}
                    onClick={() => setFocus(focus === i ? null : i)}>
                    <GuildBanner id={g.id} color={g.color} size={30} />
                    {tier > 0 ? <TierIcon tier={tier} label={dict.tiers.names[tier - 1]} /> : <span className="tier-icon" aria-hidden="true" />}
                    <span className="tmap-guild-name">
                      <strong>{g.name}</strong>
                      <small className={`faction-${g.faction}`}>{dict.join.factions[g.faction]}</small>
                    </span>
                    <span className="tmap-guild-count">
                      <strong>{d.cells(week.cells[i])}</strong>
                      {week.lords[i] > 0 && <small>{d.lords(week.lords[i])}</small>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {focus !== null && (
            <p className="tmap-focus">
              {focusRegions.length > 0 && <span className="tmap-focus-regions">{d.lordOf}: {focusRegions.join(", ")}</span>}
              {map.linked && (
                <>
                  <Link href={`/${lang}/guild/${map.region}/${map.guilds[focus].id}/`}>{d.guildPage(map.guilds[focus].name)}</Link>
                  {" · "}
                </>
              )}
              <button type="button" className="link-quiet" onClick={() => setFocus(null)}>{d.showAll}</button>
            </p>
          )}
        </section>
      </div>
      {allSieges.length > 0 && (
        <section className="frame tmap-sieges" aria-labelledby={`sieges-${map.ruleset}`}>
          <h2 className="frame-plate" id={`sieges-${map.ruleset}`}>{w_.siegesTitle}</h2>
          <ul className="chronicle-list">
            {allSieges.map((x) => (
              <li key={x.region} className={x.lord ? "chronicle-lord" : "chronicle-capture"}>
                <GuildBanner id={map.guilds[x.attacker].id} color={map.guilds[x.attacker].color} size={22} />
                {w_.siegeLine(regionNames[x.region], map.guilds[x.attacker].name, map.guilds[x.defender].name, x.cells, x.lord)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="frame tmap-chronicle" aria-labelledby={`chronicle-${map.ruleset}`}>
        <h2 className="frame-plate" id={`chronicle-${map.ruleset}`}>{forecastShown ? w_.forecastChronicle(week.week) : w_.chronicleTitle(week.week)}</h2>
        <ChronicleList key={`${mapIndex}-${wi}-${focus}`} lang={lang} items={shownItems} names={map.guilds.map((g) => g.name)} places={regionNames} />
      </section>
      <p className="tmap-hint">{d.hint}</p>
    </div>
  );
}
