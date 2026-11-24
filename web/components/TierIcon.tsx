import { tierSlugs } from "@/lib/league";

// One of the nine guild tier emblems (R-20); tier 1 is the lowest
export function TierIcon({ tier, label, size = 64 }: { tier: number; label: string; size?: 64 | 128 }) {
  return (
    <img
      className="tier-icon"
      src={`/images/tiers/${tierSlugs[tier - 1]}-${size}.webp`}
      alt={label}
      title={label}
    />
  );
}
