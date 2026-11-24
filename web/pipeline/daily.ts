// The daily job: node pipeline/daily.ts [collect] [compute] [export]  (no steps = all three)
// node pipeline/daily.ts discord runs on its own after the deploy (scripts/release.sh)
// Needs DATABASE_URL; collect also needs BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET. Never prints them.
import { applyOptOuts, collect } from "./collect.ts";
import { compute } from "./compute.ts";
import { connect } from "./db.ts";
import { sendDiscord } from "./discord.ts";
import { exportSite } from "./export.ts";

const steps = new Set(process.argv.slice(2));
const all = steps.size === 0;
const sql = connect();
try {
  if (all || steps.has("collect")) {
    const { BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET } = process.env;
    if (!BLIZZARD_CLIENT_ID || !BLIZZARD_CLIENT_SECRET) throw new Error("Set BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET first.");
    console.log(`character removal requests handled: ${await applyOptOuts(sql)}`);
    await collect(sql, { BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET });
  }
  if (all || steps.has("compute")) {
    await compute(sql);
    // R-46: page views are kept 35 days. Never fails the update
    await sql`delete from page_view where at < now() - interval '35 days'`.catch((e) => console.log("page_view prune failed:", e.message));
  }
  if (all || steps.has("export")) await exportSite(sql);
  if (steps.has("discord")) await sendDiscord(sql);
} finally {
  await sql.end();
}
