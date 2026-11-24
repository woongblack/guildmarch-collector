// A guild's banner, drawn from its id so the same guild always flies the same one (no login to
// pick it). Shared by the banner component and the share cards (R-6), which draw it outside React.
// The field is the guild's map colour; the division, second colour and charge come from a hash
// of the id.

// Number of drawn charges in public/images/charges/charge-{01..}.webp; 0 uses the shapes in GuildBanner
export const DRAWN_CHARGES = 24;

// Second colours, picked to stand apart from the bright map colours
const TINCTURES = ["#f3e6c4", "#d0a94f", "#1c1712", "#6e140d", "#1f3a6b", "#2f5d34"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function bannerFor(id: string) {
  const h = hash(id);
  return { division: h % 7, tincture: TINCTURES[(h >>> 3) % TINCTURES.length], charge: (h >>> 7) % (DRAWN_CHARGES || 6) };
}

// The banner is 40 x 52 units with a pointed foot
export const BANNER_SHAPE = "M3 2h34v38l-17 10L3 40z";
export const BANNER_PARTS: Record<number, string> = {
  1: "M20 0h20v52H20z",
  2: "M0 22h40v30H0z",
  3: "M0 30l20-12 20 12v22H0z",
  4: "M0 0h8l32 32v20z",
  5: "M20 0h20v22H20zM0 22h20v30H0z",
};

// Charge colour: the second colour on a plain or bordered field; on a divided field, cream, or
// near-black when the second colour is itself light. A thin dark edge keeps it off either half.
export function chargeColour(b: ReturnType<typeof bannerFor>) {
  const light = b.tincture === "#f3e6c4" || b.tincture === "#d0a94f";
  return b.division === 0 || b.division === 6 ? b.tincture : light ? "#1c1712" : "#f3e6c4";
}

export const chargeFile = (charge: number) => `charge-${String(charge + 1).padStart(2, "0")}.webp`;

// The banner as a standalone SVG string, for drawing outside the browser. chargeHref is the
// charge image (a data URI) used as a mask.
export function bannerSvg(id: string, color: string, chargeHref: string, height: number) {
  const b = bannerFor(id);
  const part = BANNER_PARTS[b.division];
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 40 52" width="${(height * 40) / 52}" height="${height}">
<defs><clipPath id="b"><path d="${BANNER_SHAPE}"/></clipPath>
<mask id="m"><image href="${chargeHref}" xlink:href="${chargeHref}" x="8" y="10" width="24" height="24"/></mask></defs>
<g clip-path="url(#b)"><rect width="40" height="52" fill="${color}"/>${part ? `<path d="${part}" fill="${b.tincture}"/>` : ""}${b.division === 6 ? `<path d="${BANNER_SHAPE}" fill="none" stroke="${b.tincture}" stroke-width="8"/>` : ""}
<rect x="8" y="10" width="24" height="24" fill="${chargeColour(b)}" mask="url(#m)"/></g>
<path d="${BANNER_SHAPE}" fill="none" stroke="#120a04" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M1 2h38" stroke="#d0a94f" stroke-width="3" stroke-linecap="round"/></svg>`;
}
