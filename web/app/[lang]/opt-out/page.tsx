import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OptOutForm } from "@/components/Interactive";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/opt-out/", `${t(lang).optOutPage.title} · ${t(lang).siteName}`, t(lang).meta.optOut) : {};
}

export default async function OptOut({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.optOutPage;

  return (
    <SiteShell lang={lang} path="/opt-out/" scene="snow-pass-skirmish">
      <main className="page page-narrow">
        <PageHead title={d.title} lead={d.lead} />
        <section className="frame join join-page" aria-labelledby="optout-title">
          <h2 className="frame-plate" id="optout-title">{d.title}</h2>
          <OptOutForm lang={lang} />
        </section>
        <aside className="promise">
          <h3>{d.whatTitle}</h3>
          <ul>
            {d.what.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </aside>
      </main>
    </SiteShell>
  );
}
