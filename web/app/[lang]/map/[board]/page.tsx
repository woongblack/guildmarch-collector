import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { isLang, t, type Lang } from "@/lib/i18n";
import { regionNames, regionSlugs } from "@/lib/map-regions";
import { boards, isSample, placeIndexable, placeView, type Region, type Ruleset } from "@/lib/data";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string; board: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return boards().map((b) => ({ board: b.slug }));
}

const parse = (board: string) => boards().find((x) => x.slug === board) ?? null;
const boardName = (lang: Lang, region: Region, ruleset: Ruleset) => `${t(lang).join.regions[region]} ${t(lang).factionsPage.ruleset[ruleset]}`;
const anyLord = (region: Region, ruleset: Ruleset) => regionSlugs.some((_, i) => placeIndexable(region, ruleset, i));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, board } = await params;
  const b = parse(board);
  if (!isLang(lang) || !b) return {};
  const d = t(lang);
  const name = boardName(lang, b.region, b.ruleset);
  return pageMeta(lang, `/map/${board}/`, `${d.places.mapTitle(name)} · ${d.siteName}`, d.places.mapMeta(name), { noindex: !anyLord(b.region, b.ruleset) });
}

// The 37 regions of one map as a list, alphabetical in the page's language, with each region's lord
export default async function MapBoard({ params }: Props) {
  const { lang, board } = await params;
  const b = parse(board);
  if (!isLang(lang) || !b) notFound();
  const dict = t(lang);
  const d = dict.places;
  const name = boardName(lang, b.region, b.ruleset);
  const names = regionNames(lang);
  const order = names.map((n, i) => ({ n, i })).sort((x, y) => x.n.localeCompare(y.n, lang));

  return (
    <SiteShell lang={lang} path={`/map/${board}/`} scene="border-cairns">
      <main className="page page-narrow">
        <div className="page-head">
          <p className="page-kicker"><Link href={`/${lang}/map/?ruleset=${b.ruleset}`}>{dict.mapPage.title}</Link></p>
          <h1>{d.mapTitle(name)}</h1>
          <p className="page-lead">{d.mapLead(name)}</p>
          {isSample() && <p className="page-sample">{dict.site.sample}</p>}
        </div>
        <ul className="frame week-list">
          {order.map(({ n, i }) => {
            const v = placeView(b.region, b.ruleset, i);
            return (
              <li key={i}>
                <Link href={`/${lang}/map/${board}/${regionSlugs[i]}/`}>{n}</Link>
                <span>{dict.mapPage.cells(v.cells)}{v.lord && <> · {dict.mapPage.lordOf}: {v.lord.name}</>}</span>
              </li>
            );
          })}
        </ul>
        <nav className="board-links" aria-label={dict.boards.others}>
          <ul>
            {boards().filter((o) => o.slug !== board).map((o) => (
              <li key={o.slug}><Link href={`/${lang}/map/${o.slug}/`}>{d.mapTitle(boardName(lang, o.region, o.ruleset))}</Link></li>
            ))}
          </ul>
        </nav>
      </main>
    </SiteShell>
  );
}
