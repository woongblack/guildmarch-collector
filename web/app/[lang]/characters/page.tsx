import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterSearch } from "@/components/CharacterSearch";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { guildCards, guildsSample, shownRegions } from "@/lib/data";
import { isLang, t } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return pageMeta(lang, "/characters/", `${d.characters.title} · ${d.siteName}`, d.characters.meta, { noindex: guildsSample() });
}

// Roadmap 7: character search, so a member can find their own row on the guild page
export default async function Characters({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const guilds = Object.fromEntries(guildCards().map((g) => [g.id, { name: g.name, region: g.region }]));
  const regions = shownRegions().map((r) => ({ id: r, name: dict.join.regions[r] }));
  return (
    <SiteShell lang={lang} path="/characters/" scene="crossroads-waystone">
      <main className="page page-narrow">
        <PageHead title={dict.characters.title} lead={dict.characters.lead} sample={guildsSample() ? dict.site.sample : undefined} />
        <section className="frame">
          <CharacterSearch lang={lang} regions={regions} guilds={guilds} />
        </section>
      </main>
    </SiteShell>
  );
}
