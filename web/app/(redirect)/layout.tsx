import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";

// The bare address forwards to the English site, so search engines treat /en/ as the page to list.
// It declares no hreflang set: it isn't one of the language versions, only a pointer to /en/.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Guild March",
  alternates: { canonical: "/en/" },
  // The two-language card, since this address belongs to no single language
  openGraph: { images: [{ url: "/og/default.jpg", width: 1200, height: 630 }] },
};

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ background: "#101a2e", color: "#eee4cf" }}>
      <head>
        <meta httpEquiv="refresh" content="0; url=/en/" />
      </head>
      <body>{children}</body>
    </html>
  );
}
