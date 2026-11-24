"use client";

import { useState } from "react";

// A button that copies prepared text (the weekly report as a forum post, R-35)
export function CopyText({ text, label, done, failed }: { text: string; label: string; done: string; failed: string }) {
  const [said, setSaid] = useState("");
  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={() => navigator.clipboard.writeText(text).then(() => setSaid(done), () => setSaid(failed))}
      >
        {label}
      </button>
      <p className="share-status" role="status">{said}</p>
    </>
  );
}
