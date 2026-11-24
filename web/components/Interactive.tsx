"use client";

import { useState, type FormEvent } from "react";
import { langs, locales, t, type Lang } from "@/lib/i18n";
import type { DiscordResult, OptOutResult, RegisterResult } from "@/server/types";

type Message = { text: string; isError: boolean } | null;

function Status({ message }: { message: Message }) {
  return (
    <p className={message?.isError ? "join-message is-error" : "join-message"} role="status">
      {message?.text}
    </p>
  );
}

function Choice({ label, name, options }: { label: string; name: string; options: Record<string, string> }) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} defaultValue={Object.keys(options)[0]}>
        {Object.entries(options).map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </label>
  );
}

// Posts to a Cloudflare Function; on the dev server there is none, which reads as an error
async function post<T>(path: string, data: Record<string, string>): Promise<T | null> {
  try {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Weeks start in Korea time, so the date is always the Korean calendar day (the same day in Taiwan)
function weekDate(lang: Lang, ms: number) {
  return new Intl.DateTimeFormat(locales[lang].intl, {
    timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short",
  }).format(ms);
}

export function JoinForm({ lang }: { lang: Lang }) {
  const d = t(lang).join;
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!form.name?.trim()) return setMessage({ text: d.empty, isError: true });
    setBusy(true);
    setMessage({ text: d.sending, isError: false });
    const r = await post<RegisterResult>("/api/register", form);
    setBusy(false);
    const res = d.results;
    if (r?.result === "added") {
      const text = res.added(r.name, res.members(r.members), weekDate(lang, r.countsFrom));
      setMessage({ text: r.factionFromGame ? `${text} ${res.factionFixed(d.factions[r.faction])}` : text, isError: false });
    } else if (r?.result === "exists") {
      setMessage({ text: res.exists(r.name, weekDate(lang, r.countsFrom)), isError: false });
    } else if (r?.result === "opted_out" || r?.result === "not_found" || r?.result === "invalid") {
      setMessage({ text: res[r.result], isError: true });
    } else {
      setMessage({ text: res.error, isError: true });
    }
  }

  return (
    <form className="join-form" onSubmit={submit} noValidate>
      <Choice label={d.region} name="region" options={d.regions} />
      <Choice label={d.ruleset} name="ruleset" options={d.rulesets} />
      <Choice label={d.faction} name="faction" options={d.factions} />
      <label className="join-name">
        <span>{d.name}</span>
        <input name="name" type="text" placeholder={d.placeholder} autoComplete="off" maxLength={24} />
      </label>
      <button type="submit" className="btn" disabled={busy}>{d.submit}</button>
      <Status message={message} />
    </form>
  );
}

export function OptOutForm({ lang }: { lang: Lang }) {
  const dict = t(lang);
  const d = dict.optOutPage;
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!form.name?.trim()) return setMessage({ text: d.empty, isError: true });
    setBusy(true);
    setMessage({ text: d.sending, isError: false });
    const r = await post<OptOutResult>("/api/opt-out", form);
    setBusy(false);
    // Only character requests are applied automatically; the others wait for the site owner
    if (r?.result === "received") setMessage({ text: form.kind === "character" ? d.results.received : d.results.review, isError: false });
    else setMessage({ text: r?.result === "invalid" ? d.results.invalid : d.results.error, isError: true });
  }

  return (
    <form className="join-form" onSubmit={submit} noValidate>
      <Choice label={d.kind} name="kind" options={d.kinds} />
      <Choice label={dict.join.region} name="region" options={dict.join.regions} />
      <label className="join-name">
        <span>{d.name}</span>
        <input name="name" type="text" placeholder={d.namePlaceholder} autoComplete="off" maxLength={40} />
      </label>
      <button type="submit" className="btn" disabled={busy}>{d.submit}</button>
      <Status message={message} />
    </form>
  );
}

// R-39: a guild's weekly result posted to a Discord channel through the channel's webhook
export function DiscordForm({ lang, guild }: { lang: Lang; guild: string }) {
  const d = t(lang).discord;
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const form = Object.fromEntries(new FormData(el)) as Record<string, string>;
    if (!form.url?.trim()) return setMessage({ text: d.results.invalid, isError: true });
    setBusy(true);
    setMessage({ text: d.sending, isError: false });
    const r = await post<DiscordResult>("/api/discord", { ...form, guild });
    setBusy(false);
    const ok = r?.result === "added" || r?.result === "exists";
    const key = r && r.result !== "forbidden" ? r.result : "error";
    setMessage({ text: d.results[key], isError: !ok });
    // The URL is the channel's posting key; don't leave it on screen
    if (r?.result === "added") el.reset();
  }

  return (
    <section className="frame discord-card" aria-labelledby="discord-title">
      <h2 className="frame-plate" id="discord-title">{d.title}</h2>
      <p className="share-lead">{d.lead}</p>
      <p className="share-note">{d.how}</p>
      <form className="join-form" onSubmit={submit} noValidate>
        <label className="join-name">
          <span>{d.url}</span>
          <input name="url" type="url" placeholder="https://discord.com/api/webhooks/…" autoComplete="off" spellCheck={false} />
        </label>
        <label>
          <span>{d.language}</span>
          <select name="lang" defaultValue={lang}>
            {langs.map((l) => <option key={l} value={l}>{locales[l].name}</option>)}
          </select>
        </label>
        <button type="submit" className="btn" disabled={busy}>{d.submit}</button>
        <Status message={message} />
      </form>
      <p className="share-note">{d.note}</p>
    </section>
  );
}
