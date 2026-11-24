// The dashboard's gate, copied to ops/out/_worker.js by build.ts. The browser asks for an id and
// password (HTTP Basic Auth, like a server's nginx auth_basic) before any page is served. Stays
// locked until the owner sets OPS_PASSWORD as a secret on the Pages project; OPS_USER is optional.
const enc = new TextEncoder();

// Compare through SHA-256 so the time taken doesn't depend on how much of the guess was right
async function same(a, b) {
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest("SHA-256", enc.encode(s))));
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

function credentials(header) {
  if (!header || !header.startsWith("Basic ")) return ["", ""];
  try {
    const raw = Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0));
    const s = new TextDecoder().decode(raw);
    const i = s.indexOf(":");
    return i < 0 ? ["", ""] : [s.slice(0, i), s.slice(i + 1)];
  } catch {
    return ["", ""];
  }
}

export default {
  async fetch(request, env) {
    const headers = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };
    if (!env.OPS_PASSWORD) return new Response("Locked: OPS_PASSWORD is not set.", { status: 503, headers });
    const [user, pass] = credentials(request.headers.get("Authorization"));
    const okUser = await same(user, env.OPS_USER || "owner");
    const okPass = await same(pass, env.OPS_PASSWORD);
    if (!(okUser && okPass)) {
      return new Response("Login required.", {
        status: 401,
        headers: { ...headers, "WWW-Authenticate": 'Basic realm="guildmarch ops", charset="UTF-8"' },
      });
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
    return out;
  },
};
