import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeIcon } from "@/components/BadgeIcon";
import { JsonLd } from "@/components/JsonLd";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { TierIcon } from "@/components/TierIcon";
import { RULES } from "@/lib/league";
import { isLang, t } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import type { Badge } from "@/lib/data";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/guide/", `${t(lang).guidePage.title} · ${t(lang).siteName}`, t(lang).meta.guide) : {};
}

// The whole rulebook on one parchment page, so it reads like the quest log on the landing
export default async function Guide({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.guidePage;
  const badges = Object.keys(d.badgeRules) as Badge[];

  return (
    <SiteShell lang={lang} path="/guide/" scene="island-guild-tournament">
      <main className="page page-narrow">
        <PageHead title={d.title} lead={d.lead} />
        <article className="questlog guide">
          <div className="questlog-binding" aria-hidden="true" />
          <div className="questlog-page">
            <h2>{d.formulaTitle}</h2>
            <ul className="objectives">
              {dict.score.items.map((item) => (
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
                  <strong>{dict.score.locked.name}</strong>
                  <span>{dict.score.locked.detail}</span>
                </div>
                <b className="reward">{dict.score.locked.reward}</b>
              </li>
            </ul>
            <p className="questlog-note">{dict.score.note}</p>

            <h2>{d.leagueTitle}</h2>
            <dl className="guide-list">
              {dict.rules.items.map((r) => (
                <div key={r.name}>
                  <dt>{r.name}</dt>
                  <dd>{r.body}</dd>
                </div>
              ))}
            </dl>

            <h2>{d.badgesTitle}</h2>
            <ul className="guide-badges">
              {badges.map((b) => (
                <li key={b}>
                  <BadgeIcon id={b} label="" size={64} />
                  <div>
                    <strong>{dict.badges[b]}</strong>
                    <span>{d.badgeRules[b]}</span>
                  </div>
                </li>
              ))}
            </ul>

            <h2>{dict.tiers.title}</h2>
            <p className="guide-intro">{dict.tiers.intro}</p>
            <ol className="guide-tiers">
              {dict.tiers.names.map((name, i) => {
                const tier = dict.tiers.names.length - i;
                const cut = RULES.tierCuts[tier - 1];
                return (
                  <li key={name}>
                    <TierIcon tier={tier} label="" />
                    <strong>{dict.tiers.names[tier - 1]}</strong>
                    <span>{cut > 1 ? dict.tiers.rest : dict.tiers.top(Math.round(cut * 100))}</span>
                  </li>
                );
              })}
            </ol>
            <p className="questlog-note">{dict.tiers.note}</p>

            <h2>{d.casesTitle}</h2>
            <dl className="guide-list">
              {d.cases.map((c) => (
                <div key={c.name}>
                  <dt>{c.name}</dt>
                  <dd>{c.body}</dd>
                </div>
              ))}
            </dl>
            <p className="questlog-note">{d.casesNote}</p>

            <h2>{d.limitsTitle}</h2>
            <ul className="guide-bullets">
              {d.limits.map((l) => <li key={l}>{l}</li>)}
            </ul>

            <h2>{d.dataTitle}</h2>
            <ul className="guide-bullets">
              {d.data.map((l) => <li key={l}>{l}</li>)}
            </ul>

            <h2 id="faq">{d.faqTitle}</h2>
            <dl className="guide-list">
              {d.faq.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
            <p className="questlog-note guide-more-links">
              {(["answers", "glossary", "tiers", "badges"] as const).map((m) => (
                <Link key={m} className="guide-more" href={`/${lang}/${m}/`}>{dict.site[m]} →</Link>
              ))}
            </p>
          </div>
        </article>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      </main>
    </SiteShell>
  );
}
