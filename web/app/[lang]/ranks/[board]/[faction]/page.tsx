import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeIcon } from "@/components/BadgeIcon";
import { SiteShell } from "@/components/SiteShell";
import { TierIcon } from "@/components/TierIcon";
import { FactionBanner } from "@/components/Versus";
import { isLang, t, type Lang } from "@/lib/i18n";
import { boards, factions, guildsSample, sideGuilds, sideIndexable, type Faction, type Region, type Ruleset } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string; board: string; faction: string }> };

export const dynamicParams = false;

// Every registered guild of one region, ruleset and faction, such as /ranks/kr-pvp/horde/
export function generateStaticParams() {
  return boards().flatMap((b) => factions.map((faction) => ({ board: b.slug, faction })));
}

function parse(board: string, faction: string): { region: Region; ruleset: Ruleset; faction: Faction } | null {
  const b = boards().find((x) => x.slug === board);
  return b && (factions as string[]).includes(faction) ? { region: b.region, ruleset: b.ruleset, faction: faction as Faction } : null;
}

const names = (lang: Lang, p: { region: Region; ruleset: Ruleset; faction: Faction }) =>
  [t(lang).join.regions[p.region], t(lang).factionsPage.ruleset[p.ruleset], t(lang).join.factions[p.faction]] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, board, faction } = await params;
  const p = parse(board, faction);
  if (!isLang(lang) || !p) return {};
  const d = t(lang);
  const [r, s, f] = names(lang, p);
  return pageMeta(lang, `/ranks/${board}/${faction}/`, `${d.boards.sideTitle(r, s, f)} · ${d.siteName}`, d.boards.sideMeta(r, s, f, sideGuilds(p.region, p.ruleset, p.faction).length), {
    noindex: !sideIndexable(p.region, p.ruleset, p.faction),
  });
}

export default async function Side({ params }: Props) {
  const { lang, board, faction } = await params;
  const p = parse(board, faction);
  if (!isLang(lang) || !p) notFound();
  const dict = t(lang);
  const d = dict.boards;
  const g = dict.guilds;
  const [r, s, f] = names(lang, p);
  const cards = sideGuilds(p.region, p.ruleset, p.faction);
  const other: Faction = p.faction === "horde" ? "alliance" : "horde";

  return (
    <SiteShell lang={lang} path={`/ranks/${board}/${faction}/`} scene="river-ford-camps">
      <main className="page">
        <div className="page-head side-head">
          <FactionBanner faction={p.faction} size={240} />
          <div>
            <p className="page-kicker"><Link href={`/${lang}/ranks/${board}/`}>{d.title(r, s)}</Link></p>
            <h1 className={`faction-${p.faction}`}>{d.sideTitle(r, s, f)}</h1>
            <p className="page-lead">{d.sideLead(r, s, f)}</p>
          </div>
          {guildsSample() && <p className="page-sample">{dict.site.sample}</p>}
        </div>

        <section className="frame" aria-labelledby="side-guilds">
          <h2 className="frame-plate" id="side-guilds">{d.sideCount(cards.length)}</h2>
          {cards.length ? (
            <ol className="finder-rows">
              <li className="finder-head" aria-hidden="true">
                <span>{g.columns.guild}</span>
                <span>{g.columns.standing}</span>
                <span className="num">{g.columns.active}</span>
                <span className="num">{g.columns.perMember}</span>
              </li>
              {cards.map((c) => {
                const n = c.now;
                const ranked = n.status === "ranked" && n.league && n.rank;
                return (
                  <li key={c.id}>
                    <Link className="finder-row" href={`/${lang}/guild/${c.region}/${c.id}/`}>
                      <span className="finder-name">
                        <strong>
                          {c.lastTier && <TierIcon tier={c.lastTier} label={dict.tiers.names[c.lastTier - 1]} />}
                          {c.name}
                        </strong>
                        {c.lords > 0 && <span className="tags"><span className="tag-lord">{dict.mapPage.lords(c.lords)}</span></span>}
                      </span>
                      <span className={ranked ? "finder-standing" : "finder-standing is-out"}>
                        {ranked && n.rank! <= 3 && <BadgeIcon id={`rank-${n.rank}`} label="" size={64} />}
                        {ranked ? g.rank(dict.rank.leagues[n.league!], n.rank!) : dict.status[n.status]}
                        {c.final && <small> · {g.lastWeek}</small>}
                      </span>
                      <span className="num">{n.status === "pending" ? g.roster(n.members) : n.active}</span>
                      <span className="num finder-score">{ranked ? n.perMember.toFixed(1) : "–"}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="finder-empty">{d.sideEmpty}</p>
          )}
          <p className="finder-foot">
            {g.notListed} <Link href={`/${lang}/register/`}>{dict.site.register}</Link>
          </p>
        </section>

        <nav className="board-links" aria-label={d.sides}>
          <ul>
            <li><Link href={`/${lang}/ranks/${board}/${other}/`}>{d.sideTitle(r, s, dict.join.factions[other])}</Link></li>
            <li><Link href={`/${lang}/ranks/${board}/`}>{d.title(r, s)}</Link></li>
          </ul>
        </nav>
      </main>
    </SiteShell>
  );
}
