"use client";

import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { untilClose } from "@/lib/territory-view";

// Time left until the week closes, ticking in the browser; the static page can't know "now"
export function Countdown({ lang, closesAt }: { lang: Lang; closesAt: number | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (now === null || closesAt === null) return null;
  const left = untilClose(closesAt, now);
  const d = t(lang).war;
  return <span className="countdown">{left ? d.countdown(left.d, left.h, left.m) : d.closing}</span>;
}
