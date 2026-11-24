"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

// R-11: the guild's card for recruiting posts. Save the image, copy the link, or copy both at once
// as HTML so a forum editor (Inven) gets the picture with the guild page link under it. url and image
// are absolute, since the copies leave the site; the page itself shows the image by its path.
export function ShareCard({ lang, name, url, image }: { lang: Lang; name: string; url: string; image: string }) {
  const d = t(lang).guild.share;
  const [said, setSaid] = useState("");

  async function copy(kind: "link" | "post") {
    try {
      if (kind === "post" && typeof ClipboardItem !== "undefined") {
        const html = `<a href="${url}"><img src="${image}" alt="${name.replace(/"/g, "&quot;")}" width="600"></a><br><a href="${url}">${url}</a>`;
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([url], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(url);
      }
      setSaid(kind === "post" ? d.copiedPost : d.copiedLink);
    } catch {
      setSaid(d.failed);
    }
  }

  return (
    <section className="frame share-card" aria-labelledby="share-title">
      <h2 className="frame-plate" id="share-title">{d.title}</h2>
      <p className="share-lead">{d.lead}</p>
      <img className="share-image" src={new URL(image).pathname} alt={d.alt(name)} width={1200} height={630} loading="lazy" />
      <div className="share-actions">
        <button type="button" className="btn" onClick={() => copy("post")}>{d.copyPost}</button>
        <button type="button" className="btn btn-quiet" onClick={() => copy("link")}>{d.copyLink}</button>
        <a className="btn btn-quiet" href={new URL(image).pathname} download={`${name}-guildmarch.jpg`}>{d.save}</a>
      </div>
      <p className="share-status" role="status">{said}</p>
      <p className="share-note">{d.note}</p>
    </section>
  );
}
