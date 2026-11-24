import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JoinForm } from "@/components/Interactive";
import { PageHead, SiteShell } from "@/components/SiteShell";
import { isLang, t } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/register/", `${t(lang).registerPage.title} · ${t(lang).siteName}`, t(lang).meta.register) : {};
}

export default async function Register({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = t(lang);
  const d = dict.registerPage;

  return (
    <SiteShell lang={lang} path="/register/" scene="camp-defense">
      <main className="page page-narrow">
        <PageHead title={d.title} lead={d.lead} />
        <section className="frame join join-page" aria-labelledby="register-title">
          <h2 className="frame-plate" id="register-title">{dict.join.title}</h2>
          <p className="join-body">{dict.join.body}</p>
          <JoinForm lang={lang} />
        </section>
        <section className="page-section" aria-labelledby="steps-title">
          <h2 id="steps-title">{d.stepsTitle}</h2>
          <ol className="steps">
            {d.steps.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                <span>{s.body}</span>
              </li>
            ))}
          </ol>
        </section>
        <aside className="promise">
          <h3>{d.notesTitle}</h3>
          <ul>
            {d.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </aside>
      </main>
    </SiteShell>
  );
}
