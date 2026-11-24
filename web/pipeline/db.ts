// Direct Postgres connection for the daily pipeline. The Cloudflare Functions use Supabase REST
// instead; this job needs joins and bulk writes. On Supabase use the session pooler URL
// (GitHub runners have no IPv6, and the transaction pooler breaks prepared statements).
import postgres from "postgres";

export type Sql = postgres.Sql;

export function connect(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL first.");
  return postgres(url, { max: 4, onnotice: () => {} });
}
