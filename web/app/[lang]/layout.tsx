import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { isLang, langs, locales, t, type Lang } from "@/lib/i18n";
import { SITE_URL, siteJsonLd } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return langs.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return { metadataBase: new URL(SITE_URL), title: d.siteName, description: d.meta.home };
}

// Google Fonts sheets: 230KB for the Korean faces, 500KB with Traditional Chinese, because CJK fonts
// come in hundreds of unicode-range slices. As plain <link rel=stylesheet> they held back the first
// paint until they arrived, so the page sat blank on a first visit. Added from a script they no
// longer block: the page paints at once in fallback fonts and switches when the faces load (swap).
const fontSheets = (lang: Lang) => [
  "https://fonts.googleapis.com/css2?family=Almendra:wght@400;700&family=Gowun+Dodum&family=Hahmlet:wght@500;700;800&display=swap",
  ...(lang === "zh-tw" ? ["https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&family=Noto+Serif+TC:wght@600;800&display=swap"] : []),
];
// Cloudflare Web Analytics: visits without cookies. The token is public (it ships in every page).
const BEACON = JSON.stringify({ token: "2a9856edac6e4ea18ca59d08566631f9" });

const loadFonts = (hrefs: string[]) =>
  `${JSON.stringify(hrefs)}.forEach(function(h){var l=document.createElement("link");l.rel="stylesheet";l.href=h;document.head.appendChild(l)})`;

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    // The sky colour on html, so the moment before the stylesheet arrives is dark rather than white
    <html lang={locales[lang].html} style={{ backgroundColor: "#101a2e" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {fontSheets(lang).map((href) => <link key={href} rel="preload" as="style" href={href} />)}
        <script dangerouslySetInnerHTML={{ __html: loadFonts(fontSheets(lang)) }} />
        <noscript>
          {fontSheets(lang).map((href) => <link key={href} rel="stylesheet" href={href} />)}
        </noscript>
      </head>
      <body>
        {children}
        <JsonLd data={siteJsonLd(lang)} />
        <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={BEACON} />
      </body>
    </html>
  );
}
