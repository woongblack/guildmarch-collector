// Discord webhooks for the weekly result (R-39): the URL check, the messages and the post.
// /api/discord sends the hello when a channel signs up; the daily job (pipeline/discord.ts) sends
// each closed week. Webhook URLs are a channel's posting key: never logged or shown.
import { t, type Lang } from "../lib/i18n.ts";
import { tierSlugs, type Change, type GuildWeek, type WeekTable } from "../lib/league.ts";
import { SITE_URL } from "../lib/site.ts";

// discord.com, the old discordapp.com and the canary/ptb clients all hand out the same webhook
const WEBHOOK = /^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d{17,20})\/([\w-]{60,100})\/?$/;

export function webhookUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const m = WEBHOOK.exec(v.trim());
  return m ? `https://discord.com/api/webhooks/${m[1]}/${m[2]}` : null;
}

type Embed = { title: string; url: string; description: string; color: number; thumbnail?: { url: string }; footer: { text: string } };
export type Message = { content?: string; embeds?: Embed[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// "gone": Discord says the webhook no longer exists, so its channel deleted it
export async function postWebhook(url: string, message: Message): Promise<"sent" | "gone" | "failed"> {
  // Guild names are typed by players; no @everyone or role pings from them
  const body = JSON.stringify({ username: "Guild March", avatar_url: `${SITE_URL}/images/logo/logo-mark-256.webp`, allowed_mentions: { parse: [] }, ...message });
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(15_000) }).catch(() => null);
    if (!res) return "failed";
    if (res.ok) return "sent";
    if (res.status === 401 || res.status === 404) return "gone";
    // Rate limited: wait as long as Discord asks, once
    if (res.status === 429 && attempt === 0) {
      await sleep(Math.min(Number(res.headers.get("retry-after")) || 2, 10) * 1000);
      continue;
    }
    return "failed";
  }
  return "failed";
}

export const helloMessage = (lang: Lang, guild: string): Message => ({ content: t(lang).discord.hello(guild) });

function changeText(lang: Lang, c: Change | undefined) {
  const d = t(lang).rank;
  if (!c) return null;
  if (c.kind === "new") return d.isNew;
  if (c.kind === "back") return d.back;
  if (c.kind === "moved") return d.moved(d.leagues[c.from]);
  return c.n > 0 ? d.up(c.n) : c.n < 0 ? d.down(-c.n) : d.same;
}

// One guild's row in a closed week, as an embed linking to its guild page
export function weeklyMessage(lang: Lang, guild: { id: string; name: string; region: string }, row: GuildWeek, table: WeekTable): Message {
  const dict = t(lang);
  const d = dict.discord;
  const page = `${SITE_URL}/${lang}/guild/${guild.region}/${guild.id}/`;
  const lines: string[] = [];
  if (row.league && row.rank) {
    // In week 1 every guild is new, so the change says nothing
    const change = table.week === 0 && row.change?.kind === "new" ? null : changeText(lang, row.change);
    lines.push(d.standing(dict.rank.leagues[row.league], row.rank, table.ranked[row.league].length) + (change ? ` · ${change}` : ""));
    if (row.tier) lines.push(d.tier(dict.tiers.names[row.tier - 1]));
    lines.push(d.score(row.perMember.toFixed(1), row.active));
    if (row.badges.length) lines.push(d.badges(row.badges.map((b) => dict.badges[b]).join(", ")));
  } else {
    lines.push(row.status === "not-found" ? d.notFound : d.notRanked(row.active));
  }
  lines.push(`[${d.open}](${page})`);
  return {
    embeds: [{
      title: d.weekTitle(guild.name, table.week + 1),
      url: page,
      description: lines.join("\n"),
      color: 0xd0a94f,
      ...(row.tier ? { thumbnail: { url: `${SITE_URL}/images/tiers/${tierSlugs[row.tier - 1]}-128.webp` } } : {}),
      footer: { text: d.footer },
    }],
  };
}
