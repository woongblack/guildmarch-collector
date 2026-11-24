// "Nothing yet" before week one closes: the folded map with its banner, then the message
export function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <img src="/images/pages/before-week-one-128.webp" srcSet="/images/pages/before-week-one-256.webp 2x" alt="" width={96} height={96} />
      <p>{text}</p>
    </div>
  );
}
