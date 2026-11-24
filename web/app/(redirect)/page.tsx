"use client";

import { useEffect } from "react";

// Fallback only: on Cloudflare Pages, public/_redirects sends / to /en/ before this page loads.
// Elsewhere (local preview) the meta refresh in the layout moves on without waiting for scripts.
export default function Root() {
  useEffect(() => {
    window.location.replace("/en/");
  }, []);
  return (
    <p>
      <a href="/en/">English</a> · <a href="/ko/">한국어</a> · <a href="/zh-tw/">繁體中文</a>
    </p>
  );
}
