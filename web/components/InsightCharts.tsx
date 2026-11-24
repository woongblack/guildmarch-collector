import { locales, t, type Lang } from "@/lib/i18n";
import type { SurveyTotals } from "@/lib/insights";

// Bar charts for the data reports, drawn in HTML so the words follow the page's language. One
// series per chart except factions, where Horde and Alliance are named on their own bars.
type Bar = { label: string; value: number; text: string; tone?: "horde" | "alliance" };

function Bars({ title, bars, max }: { title: string; bars: Bar[]; max: number }) {
  return (
    <figure className="ichart">
      <figcaption>{title}</figcaption>
      <ul>
        {bars.map((b) => (
          <li key={b.label + (b.tone ?? "")}>
            <span className="ichart-label">{b.label}</span>
            <span className="ichart-track">
              <span className={`ichart-bar${b.tone ? ` is-${b.tone}` : ""}`} style={{ width: `${Math.max(0.6, (b.value / max) * 100)}%` }} />
            </span>
            <span className="ichart-value">{b.text}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function InsightChart({ lang, kind, data }: { lang: Lang; kind: "levels" | "factions" | "sizes"; data: SurveyTotals }) {
  const d = t(lang).insights;
  const num = (n: number) => n.toLocaleString(locales[lang].intl);
  if (kind === "levels") {
    const total = data.members.total;
    const bars = Object.entries(data.members.levels)
      .sort(([a], [b]) => (a === "60" ? 1 : b === "60" ? -1 : parseInt(a) - parseInt(b)))
      .map(([label, n]) => {
        const p = (n / total) * 100;
        return { label, value: p, text: `${p < 1 ? p.toFixed(1) : Math.round(p)}%` };
      });
    return <Bars title={d.levelAxis} bars={bars} max={Math.max(...bars.map((b) => b.value))} />;
  }
  if (kind === "sizes") {
    const bars = Object.entries(data.guildSize.rosterBuckets).map(([label, n]) => ({ label, value: n, text: d.guildsUnit(n) }));
    return <Bars title={d.sizeAxis} bars={bars} max={Math.max(...bars.map((b) => b.value))} />;
  }
  const f = data.factions;
  const bars: Bar[] = [
    { label: `${d.horde} · ${d.roster}`, value: f.horde.roster, text: d.people(num(f.horde.roster)), tone: "horde" },
    { label: `${d.alliance} · ${d.roster}`, value: f.alliance.roster, text: d.people(num(f.alliance.roster)), tone: "alliance" },
    { label: `${d.horde} · ${d.active7}`, value: f.horde.active7, text: d.people(num(f.horde.active7)), tone: "horde" },
    { label: `${d.alliance} · ${d.active7}`, value: f.alliance.active7, text: d.people(num(f.alliance.active7)), tone: "alliance" },
  ];
  return <Bars title={`${d.horde} / ${d.alliance}`} bars={bars} max={Math.max(...bars.map((b) => b.value))} />;
}
