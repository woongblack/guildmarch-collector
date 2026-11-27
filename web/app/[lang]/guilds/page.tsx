import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuildFinder } from "@/components/GuildFinder";
import { LiveStrip } from "@/components/Live";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { guildCards, guildsSample } from "@/lib/data";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/guilds/", `${t(lang).meta.pageTitles.guilds} · ${t(lang).siteName}`, t(lang).meta.guilds) : {};
}

export default async function Guilds({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = t(lang);

  return (
    <SiteShell lang={lang} path="/guilds/" scene="ruined-courtyard-duel">
      <main className="page">
        <PageHead title={d.guilds.title} lead={d.guilds.lead} sample={guildsSample() ? d.site.sample : undefined} />
        <GuildFinder lang={lang} cards={guildCards()} />
        <LiveStrip lang={lang} />
      </main>
    </SiteShell>
  );
}
