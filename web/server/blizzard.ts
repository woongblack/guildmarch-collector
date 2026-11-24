// Battle.net calls for the Forever profile API. Same paths as geargap-forever/phase0 scripts.
// Runs in Cloudflare Functions and in Node scripts; uses only fetch.
import type { Faction, Region } from "./types.ts";

export type BlizzardEnv = { BLIZZARD_CLIENT_ID: string; BLIZZARD_CLIENT_SECRET: string };

export async function token(env: BlizzardEnv): Promise<string> {
  const res = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      // Keys pasted into secret stores often pick up a stray space or newline
      Authorization: "Basic " + btoa(`${env.BLIZZARD_CLIENT_ID.trim()}:${env.BLIZZARD_CLIENT_SECRET.trim()}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

// Slug format for non-Latin names is unverified, so try the name with hyphens, then as typed
export function slugCandidates(name: string): string[] {
  const typed = name.trim().toLowerCase();
  return [...new Set([typed.replace(/\s+/g, "-"), typed])];
}

export type FoundGuild = { slug: string; name: string; id: number | null; members: number | null; faction: Faction | null };

export async function findGuild(
  tok: string,
  region: Region,
  name: string,
): Promise<{ found: FoundGuild } | { notFound: string[] }> {
  const tried: string[] = [];
  for (const slug of slugCandidates(name)) {
    const url = `https://${region}.api.blizzard.com/data/wow/guild/${encodeURIComponent(slug)}?namespace=profile-forever-${region}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
    tried.push(`${slug} ${res.status}`);
    if (res.status === 404) continue;
    if (!res.ok) throw new Error(`guild ${res.status}`);
    const g = (await res.json()) as { name?: string; id?: number; member_count?: number; faction?: { type?: string } };
    const type = g.faction?.type?.toLowerCase();
    return {
      found: {
        slug,
        name: g.name ?? name.trim(),
        id: g.id ?? null,
        members: g.member_count ?? null,
        faction: type === "horde" || type === "alliance" ? type : null,
      },
    };
  }
  return { notFound: tried };
}
