// Local testing only: loads D-1 snapshot files (geargap-forever/phase0/out/d1_*.json) into the DB
// as if the daily collector had read them, so compute and export can run on real guilds.
// Run from web/ against the Docker DB, never Supabase:
//   DATABASE_URL=postgres://postgres:local-only@localhost:54322/postgres node scripts/import-d1.ts out/d1_a.json out/d1_b.json
// Then score with day 0 moved before the first file, e.g.
//   PIPELINE_EPOCH=2026-11-06T23:00:00Z node pipeline/daily.ts compute export
import { readFileSync } from "node:fs";
import { connect } from "../pipeline/db.ts";

const sql = connect();
if (!/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "")) throw new Error("import-d1 is for the local Docker DB only.");
const REGISTERED = new Date("2026-11-01T00:00:00Z");

try {
  for (const file of process.argv.slice(2)) {
    const snap = JSON.parse(readFileSync(file, "utf8"));
    const at = new Date(snap.taken_at);
    // One run per region per file, like the collector's one run per region per day
    const runs = new Map<string, number>();
    for (const g of snap.guilds) {
      const [guild] = await sql`
        insert into guild (region, slug, name, ruleset, faction, status, counts_from, registered_at)
        values (${g.region}, ${g.slug}, ${g.slug}, 'pvp', 'horde', 'tracked', ${REGISTERED}, ${REGISTERED})
        on conflict (region, slug) do update set registered_at = ${REGISTERED}, status = 'tracked'
        returning id`;
      if (!runs.has(g.region)) {
        const [r] = await sql`insert into collection_run (region, started_at, finished_at) values (${g.region}, ${at}, ${at}) returning id`;
        runs.set(g.region, r.id);
      }
      const run = { id: runs.get(g.region)! };
      await sql`insert into roster_read (run_id, guild_id, http_status, members) values (${run.id}, ${guild.id}, 200, ${g.members.length})`;
      for (const m of g.members) {
        const [c] = await sql`
          insert into character (region, blizzard_id, slug, name, level, last_seen_at)
          values (${g.region}, ${m.id}, ${m.slug}, ${m.slug}, ${m.level ?? m.roster_level ?? null}, ${at})
          on conflict (region, blizzard_id) do update set last_seen_at = excluded.last_seen_at
          returning id`;
        await sql`insert into guild_member (guild_id, character_id, joined_seen_at)
          select ${guild.id}, ${c.id}, ${new Date("2026-11-01T00:00:00Z")}
          where not exists (select 1 from guild_member where guild_id = ${guild.id} and character_id = ${c.id})`;
        await sql`insert into character_snapshot (run_id, character_id, fetched_at, http_status, level, honorable_kills, last_login_at)
          values (${run.id}, ${c.id}, ${at}, ${typeof m.profile_status === "number" ? m.profile_status : 0}, ${m.level ?? null},
                  ${m.honorable_kills ?? null}, ${m.last_login ? new Date(m.last_login) : null})
          on conflict do nothing`;
        // The files keep completion times only; the time stands in for the achievement id
        const done = (m.achievement_times ?? []).map((t: number) => ({ character_id: c.id, achievement_id: Math.floor(t / 1000) % 2147483647, completed_at: new Date(t) }));
        if (done.length) await sql`insert into character_achievement ${sql(done)} on conflict do nothing`;
      }
      console.log(`${file}: [${g.region}] ${g.slug} ${g.members.length} members`);
    }
  }
} finally {
  await sql.end();
}
