import { useNow } from "@/hooks/useNow";
import { formatAgo } from "@/lib/format";

export function TimeAgo({ timestamp, intervalMs }: { timestamp: number | null; intervalMs?: number }) {
  const now = useNow(intervalMs);
  return timestamp === null ? "—" : formatAgo(timestamp, now);
}
