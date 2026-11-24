// Supabase REST with the server key. Never sent to the browser.
export type SupabaseEnv = { SUPABASE_URL: string; SUPABASE_SERVICE_KEY: string };

// The project URL, whether the secret was set as https://<ref>.supabase.co or with /rest/v1 on the
// end (it was, and every call went to /rest/v1/rest/v1/… and got 404 until 2026-11-16)
const base = (url: string) => url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");

export function rest(env: SupabaseEnv, path: string, init: RequestInit = {}) {
  return fetch(`${base(env.SUPABASE_URL)}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}
