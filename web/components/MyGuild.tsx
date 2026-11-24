"use client";

import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

// "My guild" (roadmap 4): the guilds this browser looked at most recently, newest first, kept in
// localStorage so there is no login. The guild page remembers itself; the home page shows them on
// top with the guild's share card, which the daily build redraws, so it is always this week's.
type Seen = { region: string; id: string; name: string };
const KEY = "guildmarch:guilds";
const KEEP = 3;

function read(): Seen[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => x && typeof x.id === "string" && typeof x.region === "string").slice(0, KEEP) : [];
  } catch {
    return [];
  }
}

function write(list: Seen[]) {
  try {
    if (list.length) localStorage.setItem(KEY, JSON.stringify(list.slice(0, KEEP)));
    else localStorage.removeItem(KEY);
  } catch {
    // Private windows and blocked storage: the page works without it
  }
}

// On a guild page: move this guild to the front of the list
export function RememberGuild({ region, id, name }: Seen) {
  useEffect(() => {
    write([{ region, id, name }, ...read().filter((x) => !(x.region === region && x.id === id))]);
  }, [region, id, name]);
  return null;
}

// On the home page: nothing until the browser has looked at a guild
export function MyGuild({ lang }: { lang: Lang }) {
  const d = t(lang).myGuild;
  const [list, setList] = useState<Seen[]>([]);
  useEffect(() => setList(read()), []);
  if (!list.length) return null;

  const [first, ...rest] = list;
  const href = (g: Seen) => `/${lang}/guild/${g.region}/${g.id}/`;
  const forget = (g: Seen) => {
    const next = list.filter((x) => x !== g);
    write(next);
    setList(next);
  };
  // A guild that left the site has no card any more; drop it quietly
  const gone = (g: Seen) => forget(g);

  return (
    <section className="my-guild" aria-labelledby="my-guild-title">
      <h2 id="my-guild-title" className="my-guild-title">{d.title}</h2>
      <a className="my-guild-card" href={href(first)}>
        <img src={`/og/guild/${first.region}/${first.id}/${lang}.jpg`} alt={d.alt(first.name)} width={1200} height={630} onError={() => gone(first)} />
      </a>
      <div className="my-guild-side">
        <a className="my-guild-name" href={href(first)}>{first.name}</a>
        <p className="my-guild-note">{d.note}</p>
        {rest.length > 0 && (
          <ul className="my-guild-more" aria-label={d.recent}>
            {rest.map((g) => (
              <li key={`${g.region}/${g.id}`}>
                <a href={href(g)}>{g.name}</a>
                <button type="button" className="my-guild-forget" onClick={() => forget(g)} aria-label={d.forgetOne(g.name)}>×</button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="link-quiet my-guild-clear" onClick={() => forget(first)}>{d.forget}</button>
      </div>
    </section>
  );
}
