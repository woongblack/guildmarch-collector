// R-39: after the daily deploy, post each signed-up guild's newest closed week to its Discord
// channels, once per week. Reads the exported data/site.json, so opted-out guilds (left out there)
// get nothing and the posted numbers match the pages they link to. Never prints webhook URLs.
// A failed post is tried again the next day; a webhook Discord says is gone is dropped.
import { existsSync, readFileSync } from "node:fs";
import type { Lang } from "../lib/i18n.ts";
import type { SiteData } from "../lib/site-data.ts";
import { postWebhook, weeklyMessage } from "../server/discord.ts";
import type { Sql } from "./db.ts";

const SITE = new URL("../data/site.json", import.meta.url);
// After a week of failed posts the webhook is treated as gone
const MAX_FAILURES = 7;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendDiscord(sql: Sql) {
  if (!existsSync(SITE)) return console.log("discord: no site data");
  const site = JSON.parse(readFileSync(SITE, "utf8")) as SiteData;
  const hooks = await sql`
    select h.id, h.url, h.lang, h.last_week, h.failures, h.guild_id
    from discord_webhook h join guild g on g.id = h.guild_id
    where g.status <> 'opted_out' order by h.id`;
  const n = { sent: 0, removed: 0, failed: 0 };
  for (const h of hooks) {
    const guild = site.guilds.find((g) => g.id === String(h.guild_id));
    const table = guild && site.regions[guild.region]?.tables.filter((t) => t.closed).at(-1);
    if (!guild || !table) continue;
    const week = table.week + 1;
    if (h.last_week !== null && h.last_week >= week) continue;
    // A guild registered after that week started has no result for it yet
    const row = table.guilds.find((g) => g.id === guild.id);
    if (!row || row.status === "pending") continue;

    const result = await postWebhook(h.url, weeklyMessage(h.lang as Lang, guild, row, table));
    if (result === "sent") {
      await sql`update discord_webhook set last_week = ${week}, failures = 0 where id = ${h.id}`;
      n.sent++;
    } else if (result === "gone" || h.failures + 1 >= MAX_FAILURES) {
      await sql`delete from discord_webhook where id = ${h.id}`;
      n.removed++;
    } else {
      await sql`update discord_webhook set failures = failures + 1 where id = ${h.id}`;
      n.failed++;
    }
    // Well under Discord's limit for one sender
    await sleep(500);
  }
  console.log(`discord: ${hooks.length} webhooks, sent ${n.sent}, removed ${n.removed}, failed ${n.failed}`);
}
