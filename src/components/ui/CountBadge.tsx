export function CountBadge({ count, isMuted = false }: { count: number; isMuted?: boolean }) {
  return (
    <span className={`rounded-sm bg-hover px-1.5 font-mono text-xs ${isMuted ? "text-muted" : "text-ink"}`}>
      {count}
    </span>
  );
}
