// A guild's share card (R-6, R-11): the link preview for KakaoTalk, Discord and forums, and the
// image guild leaders put in recruiting posts. Written at build time, one per guild and language
// (/og/guild/<region>/<id>/<lang>.jpg), so it changes with each daily deploy.
// The background is the guild's own corner of the territory map with its land lit in its colour.
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { bannerSvg, bannerFor, chargeFile } from "@/lib/banner";
import { guildDetail, guildIds, guildTerritory, territoryView } from "@/lib/data";
import { isLang, langs, t, type Lang } from "@/lib/i18n";
import { tierSlugs } from "@/lib/league";
import { regionNames } from "@/lib/map-regions";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return guildIds().flatMap((g) => langs.map((lang) => ({ region: g.region, id: g.id, file: `${lang}.jpg` })));
}

const W = 1200;
const H = 630;
const PUBLIC = path.join(process.cwd(), "public");
// Korean and Chinese faces: Noto CJK in the site image (Dockerfile), the Mac's own faces locally
const FONT = "'Noto Sans CJK KR', 'Noto Sans CJK TC', 'Apple SD Gothic Neo', 'PingFang TC', sans-serif";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// The map and which cell each pixel belongs to, read once per build
let mapCache: { map: Buffer; cellAt: Int32Array; w: number; h: number } | null = null;
async function mapPixels() {
  if (mapCache) return mapCache;
  const map = await sharp(path.join(PUBLIC, "images/territory/azeroth-map.webp")).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // cells.png holds cell id + 1 in red (high byte) and green (low byte); 0 is sea
  const cells = await sharp(path.join(PUBLIC, "images/territory/cells.png")).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = cells.info;
  const cellAt = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) cellAt[i] = cells.data[i * 3] * 256 + cells.data[i * 3 + 1] - 1;
  mapCache = { map: await sharp(map.data, { raw: map.info }).resize(w, h).raw().toBuffer(), cellAt, w, h };
  return mapCache;
}

// The map's open sea, for padding beyond its edges
const SEA = { r: 13, g: 42, b: 59 };
// Guild colours are "hsl(h s% l%)" (lib/data.ts guildColor) or hex
function rgb(color: string): number[] {
  const hsl = color.match(/hsl\(([\d.]+)[ ,]+([\d.]+)%[ ,]+([\d.]+)%/);
  if (!hsl) return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const [h, s, l] = [Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100];
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

// The guild's land lit in its colour, other guilds' land faint, cropped to where the guild is
async function background(id: string, region: string) {
  const { map, cellAt, w, h } = await mapPixels();
  const m = territoryView(region as never).find((x) => x.guilds.some((g) => g.id === id));
  const me = m ? m.guilds.findIndex((g) => g.id === id) : -1;
  const owner = m?.weeks.at(-1)?.owner ?? [];
  const colours = (m?.guilds ?? []).map((g) => rgb(g.color));
  const px = Buffer.from(map);
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let i = 0; i < w * h; i++) {
    const c = cellAt[i];
    const o = c >= 0 ? owner[c] ?? -1 : -1;
    if (o < 0) continue;
    const a = o === me ? 0.7 : 0.3;
    for (let k = 0; k < 3; k++) px[i * 3 + k] = Math.round(px[i * 3 + k] * (1 - a) + colours[o][k] * a);
    if (o === me) {
      const x = i % w, y = (i / w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  // Frame the guild's land in the right part of the card, clear of the text; the map is padded with
  // sea so land on the map's edge can still sit there. No land shows the whole map.
  const pad = w;
  let crop = { left: pad, top: pad + Math.round((h - (w * H) / W) / 2), width: w, height: Math.round((w * H) / W) };
  if (x1 >= 0) {
    const cw = Math.round(Math.min(2 * w, Math.max(520, (x1 - x0) * 2.6, ((y1 - y0) * 1.2 * W) / H)));
    const ch = Math.round((cw * H) / W);
    const cx = (x0 + x1) / 2 - cw * 0.22;
    const cy = (y0 + y1) / 2;
    crop = { left: Math.round(pad + cx - cw / 2), top: Math.round(pad + cy - ch / 2), width: cw, height: ch };
  }
  // Keep the frame inside the padded map, however far the land spreads
  const pw = w + 2 * pad, ph = h + 2 * pad;
  crop.width = Math.min(crop.width, pw);
  crop.height = Math.min(crop.height, ph);
  crop.left = Math.min(Math.max(0, crop.left), pw - crop.width);
  crop.top = Math.min(Math.max(0, crop.top), ph - crop.height);
  // sharp extends after extracting within one pipeline, so the padding is its own step
  const padded = await sharp(px, { raw: { width: w, height: h, channels: 3 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: SEA })
    .raw()
    .toBuffer();
  return sharp(padded, { raw: { width: pw, height: ph, channels: 3 } })
    .extract(crop)
    .resize(W, H, { fit: "cover" })
    .png()
    .toBuffer();
}

async function banner(id: string, color: string) {
  const charge = await sharp(path.join(PUBLIC, "images/charges", chargeFile(bannerFor(id).charge))).png().toBuffer();
  return sharp(Buffer.from(bannerSvg(id, color, `data:image/png;base64,${charge.toString("base64")}`, 220))).png().toBuffer();
}

// Name size by how wide it will run: CJK glyphs count double
function nameSize(name: string) {
  const width = [...name].reduce((s, ch) => s + (/[ᄀ-￿]/.test(ch) ? 2 : 1.1), 0);
  return width <= 12 ? 76 : width <= 18 ? 62 : width <= 26 ? 48 : 38;
}

async function card(lang: Lang, id: string) {
  const g = guildDetail(id)!;
  const dict = t(lang);
  const d = dict.guild;
  const j = dict.join;
  const now = g.now;
  const ranked = now.status === "ranked" && now.league && now.rank;
  const head = now.closed ? d.weekClosed(now.week) : g.weeks.length ? d.weekLive(now.week) : d.beforeStart;
  const standing = ranked ? d.rankIn(dict.rank.leagues[now.league!], now.rank!) : dict.status[now.status];
  const score = ranked ? `${d.perMember} ${now.perMember.toFixed(1)}` : "";
  const lastTier = [...g.weeks].reverse().find((w) => w.closed)?.tier ?? null;
  const land = guildTerritory(id);
  const landLine = [
    land && land.cells > 0 ? dict.mapPage.onGuild(land.cells) : "",
    land && land.regions.length ? dict.mapPage.lordTitle(regionNames(lang)[land.regions[0]]) + (land.regions.length > 1 ? ` +${land.regions.length - 1}` : "") : "",
  ].filter(Boolean).join(" · ");
  const m = territoryView(g.region).find((x) => x.guilds.some((y) => y.id === id));
  const color = m?.guilds.find((y) => y.id === id)?.color ?? "#d0a94f";

  const size = nameSize(g.name);
  const tierY = 470;
  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
  <linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="#0b1026" stop-opacity=".94"/><stop offset=".5" stop-color="#0b1026" stop-opacity=".78"/><stop offset=".8" stop-color="#0b1026" stop-opacity=".1"/><stop offset="1" stop-color="#0b1026" stop-opacity="0"/></linearGradient>
  <linearGradient id="foot" y1="0" y2="1"><stop offset=".75" stop-color="#0b1026" stop-opacity="0"/><stop offset="1" stop-color="#0b1026" stop-opacity=".85"/></linearGradient>
  <filter id="lift"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".8"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#shade)"/><rect width="${W}" height="${H}" fill="url(#foot)"/>
<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="#8a6d35" stroke-width="3"/>
<g font-family="${FONT}" filter="url(#lift)">
  <text x="232" y="96" font-size="26" fill="#b8ab92">${esc(head)}</text>
  <text x="232" y="${96 + 14 + size}" font-size="${size}" font-weight="700" fill="#fff3c4">${esc(g.name)}</text>
  <text x="232" y="${96 + 62 + size}" font-size="30" fill="#e8dcc0">${esc(`${j.regions[g.region]} · ${j.rulesets[g.ruleset]} · ${j.factions[g.faction]}`)}</text>
  <text x="64" y="370" font-size="54" font-weight="700" fill="#ffd24a">${esc(standing)}</text>
  ${score ? `<text x="64" y="418" font-size="30" fill="#e8dcc0">${esc(score)}</text>` : ""}
  ${lastTier ? `<text x="${64 + 104}" y="${tierY + 44}" font-size="26" fill="#b8ab92">${esc(dict.tiers.last)}</text><text x="${64 + 104}" y="${tierY + 82}" font-size="34" font-weight="700" fill="#fff3c4">${esc(dict.tiers.names[lastTier - 1])}</text>` : ""}
  ${landLine ? `<text x="64" y="${lastTier ? 600 : 520}" font-size="28" fill="#e8dcc0">${esc(landLine)}</text>` : ""}
  <text x="${W - 44}" y="${H - 40}" font-size="26" font-weight="700" fill="#d0a94f" text-anchor="end">guildmarch.com</text>
</g></svg>`;

  const layers: OverlayOptions[] = [
    { input: Buffer.from(text), left: 0, top: 0 },
    { input: await banner(id, color), left: 52, top: 40 },
  ];
  if (lastTier) {
    const icon = await sharp(path.join(PUBLIC, `images/tiers/${tierSlugs[lastTier - 1]}-128.webp`)).resize(96, 96).png().toBuffer();
    layers.push({ input: icon, left: 64, top: tierY + 6 });
  }
  return sharp(await background(id, g.region)).composite(layers).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

export async function GET(_req: Request, { params }: { params: Promise<{ region: string; id: string; file: string }> }) {
  const { region, id, file } = await params;
  const lang = file.replace(/\.jpg$/, "");
  const g = guildDetail(id);
  if (!isLang(lang) || !g || g.region !== region) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(await card(lang, id)), { headers: { "content-type": "image/jpeg" } });
}
