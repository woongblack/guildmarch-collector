export function BadgeIcon({ id, label, size }: { id: string; label: string; size: 64 | 320 }) {
  return <img className="badge-icon" src={`/images/badges/badge-${id}-${size}.webp`} alt={label} title={label} />;
}
