"use client";

import { useEffect } from "react";

// The character search links to #c-<id>; a member past the first rows sits in a closed <details>
export function MemberFocus() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id.startsWith("c-")) return;
    const row = document.getElementById(id);
    const fold = row?.closest("details");
    if (fold) fold.open = true;
    row?.scrollIntoView({ block: "center" });
  }, []);
  return null;
}
