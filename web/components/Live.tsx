"use client";

// The live strip (R-46): every page sends one view; the strip shows the guilds people opened lately
// and, once there are a few, how many people are on the site. Hidden until there is something to show.
import Link from "next/link";
import { useEffect, useState } from "react";
import { locales, t, type Lang } from "@/lib/i18n";
import type { LiveResult } from "@/server/live";

// Below this the count would make the site look empty rather than alive
const MIN_ONLINE = 3;
const POLL = 30_000;

export function ViewBeacon({ lang, guild }: { lang: Lang; guild?: string }) {
  useEffect(() => {
    if (navigator.webdriver) return;
    fetch("/api/view", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang, guild }) }).catch(() => {});
  }, [lang, guild]);
  return null;
}

function ago(lang: Lang, at: number, now: number) {
  const mins = Math.floor((now - at) / 60_000);
  if (mins < 1) return t(lang).live.justNow;
  const fmt = new Intl.RelativeTimeFormat(locales[lang].intl, { numeric: "always", style: "short" });
  return mins < 60 ? fmt.format(-mins, "minute") : fmt.format(-Math.floor(mins / 60), "hour");
}

export function LiveStrip({ lang }: { lang: Lang }) {
  const dict = t(lang);
  const [live, setLive] = useState<LiveResult | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let stop = false;
    const load = () => {
      if (document.hidden) return;
      fetch("/api/live")
        .then((r) => (r.ok ? (r.json() as Promise<LiveResult>) : null))
        .then((v) => { if (!stop && v) { setLive(v); setNow(Date.now()); } })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, POLL);
    document.addEventListener("visibilitychange", load);
    return () => { stop = true; clearInterval(timer); document.removeEventListener("visibilitychange", load); };
  }, []);

  if (!live || !live.recent.length) return null;
  return (
    <section className="frame live-strip" aria-labelledby="live-title">
      <h2 className="frame-plate" id="live-title"><span className="live-dot" aria-hidden="true" />{dict.live.title}</h2>
      {live.online >= MIN_ONLINE && <p className="live-online">{dict.live.online(live.online)}</p>}
      <ol className="live-list">
        {live.recent.map((g) => (
          <li key={g.id}>
            <span className={`live-faction faction-${g.faction}`} aria-hidden="true" />
            <Link href={`/${lang}/guild/${g.region}/${g.id}/`}>{g.name}</Link>
            <span className="live-region">{dict.join.regions[g.region as keyof typeof dict.join.regions] ?? g.region}</span>
            <span className="live-ago">{ago(lang, g.at, now)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
