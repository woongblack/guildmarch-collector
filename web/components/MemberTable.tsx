import Link from "next/link";
import { MemberFocus } from "@/components/MemberFocus";
import type { MemberRow } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

// R-14: who added what to the guild's score this week. Each row has an anchor (#c-<id>) so the
// character search can land on it; the targeted row is highlighted. No login times.
const OPEN = 15;

export function MemberTable({ lang, members, week }: { lang: Lang; members: MemberRow[]; week: string }) {
  if (!members.length) return null;
  const dict = t(lang);
  const d = dict.members;
  const cols = dict.score.items.map((i) => i.name);
  const row = (m: MemberRow, k: number) => (
    <tr key={m.id} id={`c-${m.id}`} className={m.total ? "" : "is-idle"}>
      <td className="num">{k + 1}</td>
      <th scope="row">{m.name}</th>
      <td className="num">{m.level ?? "–"}</td>
      <td className="num">{m.parts.levels || "–"}{m.capped.includes("levels") && <small title={d.capped}> ★</small>}</td>
      <td className="num">{m.parts.reached60 || "–"}</td>
      <td className="num">{m.parts.achievements || "–"}</td>
      <td className="num">{m.parts.honor || "–"}{m.capped.includes("honor") && <small title={d.capped}> ★</small>}</td>
      <td className="num member-total">{m.total || "–"}</td>
    </tr>
  );
  const head = (
    <thead>
      <tr>
        <th className="num">#</th>
        <th>{d.character}</th>
        <th className="num">{d.level}</th>
        {cols.map((c) => <th key={c} className="num">{c}</th>)}
        <th className="num">{d.total}</th>
      </tr>
    </thead>
  );
  return (
    <section className="frame members" aria-labelledby="members-title">
      <h2 className="frame-plate" id="members-title">{d.title}</h2>
      <p className="share-lead">{d.lead(week)} ★ = {d.capped}</p>
      <div className="members-scroll">
        <table className="member-table">
          {head}
          <tbody>{members.slice(0, OPEN).map(row)}</tbody>
        </table>
      </div>
      {members.length > OPEN && (
        <details className="members-more">
          <summary>{d.more(members.length - OPEN)}</summary>
          <div className="members-scroll">
            <table className="member-table">
              {head}
              <tbody>{members.slice(OPEN).map((m, k) => row(m, k + OPEN))}</tbody>
            </table>
          </div>
        </details>
      )}
      <p className="finder-foot"><Link href={`/${lang}/characters/`}>{d.find}</Link></p>
      <MemberFocus />
    </section>
  );
}
