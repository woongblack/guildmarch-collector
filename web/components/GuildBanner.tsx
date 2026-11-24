import { useId } from "react";
import { BANNER_PARTS, BANNER_SHAPE, bannerFor, chargeColour, chargeFile, DRAWN_CHARGES } from "@/lib/banner";

// A guild's banner (rules in lib/banner.ts). Charges are drawn images from GUILD_BANNER_BRIEF.md;
// the shapes below are the fallback when DRAWN_CHARGES is 0.
export { bannerFor, DRAWN_CHARGES };

// Charges drawn in code, centred on (20, 22) and about 16 units across
function Charge({ n, fill }: { n: number; fill: string }) {
  const star = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 3.6 : 8.4;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${20 + r * Math.cos(a)},${22 + r * Math.sin(a)}`;
  }).join(" ");
  switch (n) {
    case 0: return <circle cx={20} cy={22} r={7} fill={fill} />;
    case 1: return <polygon points="20,12 28,22 20,32 12,22" fill={fill} />;
    case 2: return <polygon points={star} fill={fill} />;
    case 3: return <path d="M17.5 13h5v6.5H29v5h-6.5V31h-5v-6.5H11v-5h6.5z" fill={fill} />;
    case 4: return <path d="M13 14l7 6 7-6 2 2-6 6 6 6-2 2-7-6-7 6-2-2 6-6-6-6z" fill={fill} />;
    default: return <path d="M24 13a9 9 0 1 0 0 18a7 7 0 1 1 0-18z" fill={fill} />;
  }
}

// size is the drawn height in px; the banner is 40 x 52 units with a pointed foot
export function GuildBanner({ id, color, size = 32, title }: { id: string; color: string; size?: number; title?: string }) {
  const uid = useId().replace(/:/g, "");
  const b = bannerFor(id);
  const shape = BANNER_SHAPE;
  const second = b.tincture;
  const chargeOn = chargeColour(b);
  const edge = { filter: "drop-shadow(0 0 .6px #120a04) drop-shadow(0 0 .6px #120a04)" };
  const parts = BANNER_PARTS;
  return (
    <svg className="guild-banner" viewBox="0 0 40 52" width={(size * 40) / 52} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <clipPath id={`b${uid}`}><path d={shape} /></clipPath>
      </defs>
      <g clipPath={`url(#b${uid})`}>
        <rect width={40} height={52} fill={color} />
        {parts[b.division] && <path d={parts[b.division]} fill={second} />}
        {b.division === 6 && <path d={shape} fill="none" stroke={second} strokeWidth={8} />}
        {DRAWN_CHARGES ? (
          <>
            <mask id={`m${uid}`}><image href={`/images/charges/${chargeFile(b.charge)}`} x={8} y={10} width={24} height={24} /></mask>
            <g style={edge}><rect x={8} y={10} width={24} height={24} fill={chargeOn} mask={`url(#m${uid})`} /></g>
          </>
        ) : (
          <g style={edge}><Charge n={b.charge} fill={chargeOn} /></g>
        )}
      </g>
      <path d={shape} fill="none" stroke="#120a04" strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M1 2h38" stroke="#d0a94f" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
