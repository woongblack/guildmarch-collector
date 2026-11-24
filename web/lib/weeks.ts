// Calendar dates of a scored week, for the week archive. Weeks start on Thursday 08:00 Korea time
// (07:00 in Taiwan, the same calendar day); English pages give the Korean dates, as the rules do.
import { FIRST_WEEK } from "../server/types.ts";
import { locales, t, type Lang } from "./i18n.ts";

const WEEK = 7 * 86_400_000;

export function weekRange(lang: Lang, week: number) {
  const from = FIRST_WEEK + (week - 1) * WEEK;
  const zone = lang === "zh-tw" ? "Asia/Taipei" : "Asia/Seoul";
  const fmt = new Intl.DateTimeFormat(locales[lang].intl, { timeZone: zone, year: "numeric", month: "short", day: "numeric", weekday: "short" });
  return t(lang).weeks.range(fmt.format(from), fmt.format(from + WEEK));
}
