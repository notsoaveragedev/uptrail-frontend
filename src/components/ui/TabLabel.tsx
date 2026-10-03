import { CountBadge } from "./CountBadge";

export function TabLabel({ label, count, isMuted = true }: { label: string; count?: number; isMuted?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      {count !== undefined && <CountBadge count={count} isMuted={isMuted} />}
    </span>
  );
}
