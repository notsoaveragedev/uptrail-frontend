import { useNow } from "@/hooks/useNow";
import { DAY_MS, formatRemaining, isExpiringSoon } from "@/lib/dates";

export function ExpiresIn({ expiresAt, warnWithinMs = DAY_MS }: { expiresAt: number; warnWithinMs?: number }) {
  const now = useNow(60_000);
  return (
    <span
      className={`font-mono text-xs ${isExpiringSoon(expiresAt, now, warnWithinMs) ? "text-degraded" : "text-muted"}`}
    >
      in {formatRemaining(expiresAt - now)}
    </span>
  );
}
