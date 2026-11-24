import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionBar } from "@/components/ActionBar";
import { LiveStrip } from "@/components/Live";
import { Champions } from "@/components/Champions";
import { Digest } from "@/components/Digest";
import { JoinForm } from "@/components/Interactive";
import { MyGuild } from "@/components/MyGuild";
import { RankWindow } from "@/components/RankWindow";
import { RegionPanel, RegionProvider, RegionTabs } from "@/components/RegionTabs";
import { SiteShell } from "@/components/SiteShell";
import { isLang, locales, t, updatedAt } from "@/lib/i18n";
import { insights } from "@/lib/insights";
import { pageMeta } from "@/lib/site";
import { isSample, lastRun, rankView, shownRegions, type Region } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/", t(lang).meta.homeTitle, t(lang).meta.home, { absoluteTitle: true }) : {};
}

export default async function Landing({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = t(lang);
  const sample = isSample();
  const shown = shownRegions();
  // Each language opens on its readers' region: Korean on Korea, English on the Americas, Chinese on Taiwan
  const initial: Region = shown.includes(locales[lang].home) ? locales[lang].home : shown[0];
  const views = Object.fromEntries(shown.map((r) => [r, rankView(r)]));
  const week = views[initial]?.currentWeek ?? 1;
  const run = lastRun();
  const note = (r: Region) => {
    const v = views[r];
    const w = v?.tableWeek ?? 1;
    if (sample || run === null) return d.rank.sample(w);
    if (v?.final) return d.rank.final(w);
    const live = d.rank.live(w, updatedAt(lang, run));
    return v?.firstDay ? `${live} · ${d.rank.firstDay}` : live;
  };
  // The newest reports, so the guides are one click from the home page
  const reports = [...insights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  // The landing alternates between the two widest battle scenes, one per week
  const scene = week % 2 ? "fortress-gate-assault" : "valley-guild-war";

  return (
    <SiteShell lang={lang} path="/" scene={scene} dim={false}>
      <main>
        <MyGuild lang={lang} />
        <RegionProvider initial={initial}>
          {shown.map((r) => {
            const view = views[r];
            return <RegionPanel key={r} region={r}>{view && <Champions lang={lang} view={view} sample={sample} />}</RegionPanel>;
          })}

          <section className="hero" id="rank">
            <div className="hero-copy">
              <p className="hero-game">{d.hero.game}</p>
              <h1>{d.hero.title}</h1>
              <p className="hero-body">{d.hero.body}</p>
              <div className="hero-actions">
                <a className="btn" href="#join">{d.hero.cta}</a>
                <a className="link-quiet" href="#score">{d.hero.secondary}</a>
              </div>
            </div>
            <div>
              <RegionTabs regions={shown} names={d.join.regions} label={d.site.region} />
              {shown.map((r) => {
                const view = views[r];
                const empty = { small: [], medium: [], large: [] };
                return (
                  <RegionPanel key={r} region={r}>
                    <RankWindow lang={lang} table={view?.table ?? empty} note={note(r)} />
                    <Digest lang={lang} region={r} />
                  </RegionPanel>
                );
              })}
            </div>
          </section>
        </RegionProvider>

        <LiveStrip lang={lang} />

        <section className="questlog" id="score" aria-labelledby="score-title">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            <h2 id="score-title">{d.score.title}</h2>
            <p className="questlog-intro">{d.score.intro}</p>
            <h3>{d.score.log}</h3>
            <ul className="objectives">
              {d.score.items.map((item) => (
                <li key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail} · {item.cap}</span>
                  </div>
                  <b className="reward">{item.reward}</b>
                </li>
              ))}
              <li className="is-locked">
                <div>
                  <strong>{d.score.locked.name}</strong>
                  <span>{d.score.locked.detail}</span>
                </div>
                <b className="reward">{d.score.locked.reward}</b>
              </li>
            </ul>
            <p className="questlog-note">{d.score.note}</p>
          </div>
        </section>

        <section className="rules" id="rules" aria-labelledby="rules-title">
          <h2 id="rules-title">{d.rules.title}</h2>
          <dl className="rule-list">
            {d.rules.items.map((rule) => (
              <div key={rule.name}>
                <dt>{rule.name}</dt>
                <dd>{rule.body}</dd>
              </div>
            ))}
          </dl>
          <aside className="promise">
            <h3>{d.rules.promiseTitle}</h3>
            <ul>
              {d.rules.promises.map((text) => <li key={text}>{text}</li>)}
            </ul>
          </aside>
        </section>

        <section className="home-reports" aria-labelledby="reports-title">
          <h2 id="reports-title">{d.insights.homeKicker}</h2>
          <ul>
            {reports.map((x) => (
              <li key={x.slug}>
                <Link href={`/${lang}/insights/${x.slug}/`}>{x.text[lang].title}</Link>
                <p>{x.text[lang].lead}</p>
              </li>
            ))}
          </ul>
          <Link className="link-quiet" href={`/${lang}/insights/`}>{d.insights.all} →</Link>
        </section>

        <section className="frame join" id="join" aria-labelledby="join-title">
          <h2 className="frame-plate" id="join-title">{d.join.title}</h2>
          <p className="join-body">{d.join.body}</p>
          <JoinForm lang={lang} />
        </section>
      </main>
      <ActionBar lang={lang} />
    </SiteShell>
  );
}
