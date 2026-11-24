// Daily collection (DB_Design.md step 2): opt-out requests first, then for every registered guild
// the roster and each member's profile, achievements and PvP summary. Read-only on Battle.net.
import { slugCandidates, token, type BlizzardEnv } from "../server/blizzard.ts";
import { REGIONS, type Region } from "../server/types.ts";
import type { Sql } from "./db.ts";
import { DAY } from "./time.ts";

const WORKERS = 8;
const TIMEOUT = 20_000;
// Blizzard allows 36,000 calls an hour per client. 9.5 a second (34,200 an hour) stays under it,
// shared by every region, since 40,000 characters need over 100,000 calls on their first day
const CALLS_PER_SECOND = 9.5;
// Snapshots only feed the open week and its fallbacks (DB_Design.md "보관과 삭제")
const SNAPSHOT_DAYS = 14;
// Blizzard API terms: data refreshed within 30 days, so characters gone that long are deleted
const GONE_DAYS = 30;

type Reply = { status: number; body: any };

// Hands out evenly spaced start times, so calls never bunch up past the hourly limit
let nextSlot = 0;
async function slot() {
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + 1000 / CALLS_PER_SECOND;
  if (at > now) await new Promise((r) => setTimeout(r, at - now));
}

class Api {
  calls = 0;
  failed = 0;
  tok: string;
  region: Region;
  constructor(tok: string, region: Region) {
    this.tok = tok;
    this.region = region;
  }

  async get(path: string): Promise<Reply> {
    const url = `https://${this.region}.api.blizzard.com${path}?namespace=profile-forever-${this.region}`;
    for (let attempt = 0; ; attempt++) {
      await slot();
      this.calls++;
      let status = 0;
      let body: any = null;
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${this.tok}` }, signal: AbortSignal.timeout(TIMEOUT) });
        status = res.status;
        if (res.ok) body = await res.json();
      } catch {
        // Network trouble or bad JSON; status 0 is retried like a server error
      }
      // 404 is an answer (below level 10, logged in, or gone); 429 and server errors are retried
      const retry = status === 0 || status === 429 || status >= 500;
      if (!retry || attempt === 3) {
        if (!body && status !== 404) this.failed++;
        return { status, body };
      }
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
}

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]);
  }));
}

const seg = (slug: string) => encodeURIComponent(slug.toLowerCase());
const lowerNames = (name: string) => new Set([name.trim().toLowerCase(), ...slugCandidates(name)]);

// Opt-out requests (R-8). A character request is a person's own data, so it is applied here: the
// character is deleted with everything stored about it, and later rosters skip it. Guild removals
// and corrections wait for the site owner (DB_Design.md "요청 확인"), because without logins anyone
// could otherwise remove a rival's guild; the job only reports how many are waiting.
export async function applyOptOuts(sql: Sql) {
  const requests = await sql`select id, region, name from opt_out_request where status = 'received' and kind = 'character' order by id`;
  for (const r of requests) {
    const names = [...lowerNames(r.name)];
    const gone = await sql`
      delete from character where region = ${r.region} and (lower(name) = any(${names}) or slug = any(${names}))
      returning id`;
    // Done even when nothing is stored yet, so the character is skipped when it first shows up
    await sql`update opt_out_request set status = 'done', handled_at = now(),
      note = ${gone.length ? null : "not stored yet; skipped from now on"} where id = ${r.id}`;
  }
  const waiting = await sql`select kind, count(*)::int as n from opt_out_request where status = 'received' and kind <> 'character' group by kind`;
  // A GitHub Actions notice, so waiting requests show on the run summary
  if (waiting.length) console.log(`::notice::Requests waiting for review: ${waiting.map((w) => `${w.n} ${w.kind}`).join(", ")}`);
  return requests.length;
}

async function collectRegion(sql: Sql, region: Region, tok: string) {
  const guilds = await sql`select id, slug from guild where region = ${region} and status <> 'opted_out' order by id`;
  if (!guilds.length) return null;
  const api = new Api(tok, region);
  const [run] = await sql`insert into collection_run (region) values (${region}) returning id, started_at`;
  const runAt: Date = run.started_at;
  const skip = new Set(
    (await sql`select name from opt_out_request where kind = 'character' and status = 'done' and region = ${region}`)
      .flatMap((r) => [...lowerNames(r.name)]),
  );
  let members = 0;

  for (const g of guilds) {
    const roster = await api.get(`/data/wow/guild/${seg(g.slug)}/roster`);
    const listed: { id: number; slug: string; name: string; level: number | null }[] = (roster.body?.members ?? [])
      .map((m: any) => m.character)
      .filter((c: any) => c?.id && c.slug && !skip.has(c.slug.toLowerCase()) && !skip.has(String(c.name ?? "").toLowerCase()))
      .map((c: any) => ({ id: c.id, slug: c.slug, name: c.name ?? c.slug, level: c.level ?? null }));
    await sql`insert into roster_read (run_id, guild_id, http_status, members)
      values (${run.id}, ${g.id}, ${roster.status}, ${roster.body ? listed.length : null})`;
    if (roster.status === 404) {
      await sql`update guild set status = 'not_found' where id = ${g.id}`;
      continue;
    }
    if (!roster.body) continue;

    const chars = listed.length
      ? await sql`
          insert into character ${sql(listed.map((c) => ({ region, blizzard_id: c.id, slug: c.slug, name: c.name, level: c.level, last_seen_at: runAt })))}
          on conflict (region, blizzard_id) do update
            set slug = excluded.slug, name = excluded.name, last_seen_at = excluded.last_seen_at
          returning id, blizzard_id, slug`
      : [];
    const ids = chars.map((c) => c.id);
    // Membership by run time, so the scorer can rebuild the roster of any day
    await sql`update guild_member set left_at = ${runAt}
      where guild_id = ${g.id} and left_at is null and not (character_id = any(${ids}::bigint[]))`;
    await sql`insert into guild_member (guild_id, character_id, joined_seen_at)
      select ${g.id}, c, ${runAt} from unnest(${ids}::bigint[]) c
      where not exists (select 1 from guild_member m where m.guild_id = ${g.id} and m.character_id = c and m.left_at is null)`;
    await sql`update guild set status = 'tracked', name = coalesce(${roster.body.guild?.name ?? null}, name),
      roster_seen_at = ${runAt}, roster_size = ${listed.length} where id = ${g.id}`;

    // The last good read per member: if the login time hasn't moved, achievements and honor haven't either
    const prev = new Map(
      (await sql`
        select distinct on (s.character_id) s.character_id, s.last_login_at, s.honorable_kills
        from character_snapshot s where s.character_id = any(${ids}::bigint[]) and s.http_status = 200
        order by s.character_id, s.fetched_at desc`).map((r) => [String(r.character_id), r]),
    );
    const snaps: Record<string, unknown>[] = [];
    const achievements: Record<string, unknown>[] = [];
    await pool(chars, WORKERS, async (c) => {
      const base = `/profile/wow/character/${seg(c.slug)}`;
      const profile = await api.get(base);
      const p = profile.body;
      const lastLogin = p?.last_login_timestamp ? new Date(p.last_login_timestamp) : null;
      const before = prev.get(String(c.id));
      let honor: number | null = before?.honorable_kills ?? null;
      if (p && !(before && lastLogin && before.last_login_at?.getTime() === lastLogin.getTime())) {
        const [a, v] = await Promise.all([api.get(`${base}/achievements`), api.get(`${base}/pvp-summary`)]);
        const listedA = (a.body?.achievements ?? []).filter((x: any) => x.completed_timestamp);
        const done = listedA.length
          ? listedA.map((x: any) => [x.achievement?.id ?? x.id, x.completed_timestamp])
          : (a.body?.recent_events ?? []).map((x: any) => [x.achievement?.id, x.timestamp]);
        for (const [id, t] of done) if (id && t) achievements.push({ character_id: c.id, achievement_id: id, completed_at: new Date(t) });
        if (v.body) honor = v.body.honorable_kills ?? 0;
      }
      snaps.push({
        run_id: run.id,
        character_id: c.id,
        fetched_at: new Date(),
        http_status: profile.status,
        level: p?.level ?? null,
        honorable_kills: p ? honor : null,
        last_login_at: lastLogin,
      });
    });
    if (snaps.length) await sql`insert into character_snapshot ${sql(snaps)} on conflict do nothing`;
    for (let i = 0; i < achievements.length; i += 1000) {
      await sql`insert into character_achievement ${sql(achievements.slice(i, i + 1000))} on conflict do nothing`;
    }
    await sql`update character c set level = s.level, last_login_at = s.last_login_at
      from character_snapshot s where s.run_id = ${run.id} and s.character_id = c.id and s.http_status = 200`;
    members += chars.length;
    console.log(`[${region}] ${g.slug}: roster ${roster.status}, ${chars.length} members`);
  }

  await sql`update collection_run set finished_at = now(), api_calls = ${api.calls}, failed_calls = ${api.failed} where id = ${run.id}`;
  return { guilds: guilds.length, members, calls: api.calls, failed: api.failed };
}

export async function collect(sql: Sql, env: BlizzardEnv) {
  const tok = await token(env);
  for (const region of REGIONS) {
    const started = Date.now();
    const r = await collectRegion(sql, region, tok);
    if (r) console.log(`[${region}] ${r.guilds} guilds, ${r.members} members, ${r.calls} calls, ${r.failed} failed, ${Math.round((Date.now() - started) / 1000)}s`);
  }
  // Housekeeping: old snapshots, and characters no roster has listed for 30 days
  await sql`delete from character_snapshot where fetched_at < ${new Date(Date.now() - SNAPSHOT_DAYS * DAY)}`;
  await sql`delete from character where last_seen_at < ${new Date(Date.now() - GONE_DAYS * DAY)}`;
}
