"use client";

import { useEffect, useState, type ReactNode } from "react";
import { t, type Lang } from "@/lib/i18n";

// Times are fixed to Korea time because the first week is announced in it.
const BAR_START = Date.parse("2026-11-06T00:00:00+09:00");
const WEEK_ONE = Date.parse("2026-11-19T08:00:00+09:00");
const WEEK = 7 * 86_400_000;

// game-icons.net glyphs, tinted through CSS masks. See ASSETS.md.
const icons: Record<string, ReactNode> = {
  rank: <span className="slot-icon slot-icon-rank" aria-hidden="true" />,
  score: <span className="slot-icon slot-icon-score" aria-hidden="true" />,
  rules: <span className="slot-icon slot-icon-rules" aria-hidden="true" />,
  join: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 21V3M6 4h13l-3 4 3 4H6M11 16h5M13.500 13.500v5" />
    </svg>
  ),
};

function scrollToSection(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function ActionBar({ lang }: { lang: Lang }) {
  const { nav, xp, actionBar: label } = t(lang);
  const slots = (["rank", "score", "rules", "join"] as const).map((id) => ({ id, text: nav[id] }));
  const [now, setNow] = useState<number | null>(null);
  const [active, setActive] = useState("rank");

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof Element && e.target.matches("input, select, textarea");
      if (e.metaKey || e.ctrlKey || e.altKey || typing) return;
      const slot = slots[Number(e.key) - 1];
      if (slot) scrollToSection(slot.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    slots.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // Section ids never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Before week one the bar counts down to it; after, to the close of the week in progress
  const started = now !== null && now >= WEEK_ONE;
  const week = started ? Math.floor((now - WEEK_ONE) / WEEK) + 1 : 0;
  const from = started ? WEEK_ONE + (week - 1) * WEEK : BAR_START;
  const to = started ? from + WEEK : WEEK_ONE;
  const progress = now === null ? 0 : Math.min(100, Math.max(0, ((now - from) / (to - from)) * 100));
  let status = "";
  if (now !== null) {
    const mins = Math.floor((to - now) / 60_000);
    const left = xp.remaining(Math.floor(mins / 1440), Math.floor((mins % 1440) / 60), mins % 60);
    status = started ? `${xp.live(week)} ${left}` : `${xp.label} ${left}`;
  }

  return (
    <nav className="hud" aria-label={label}>
      <div className="hud-xp">
        <div className="hud-xp-fill" style={{ width: `${progress}%` }} />
        <span className="hud-xp-text">{status || " "}</span>
      </div>
      <div className="hud-slots">
        {slots.map(({ id, text }, i) => (
          <a
            key={id}
            href={`#${id}`}
            className={`slot${active === id ? " is-active" : ""}`}
            aria-current={active === id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(id);
            }}
          >
            <kbd>{i + 1}</kbd>
            {icons[id]}
            <span>{text}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
