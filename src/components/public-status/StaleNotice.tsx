import { LuWifiOff } from "react-icons/lu";
import { useNow } from "@/hooks/useNow";
import { formatAgo } from "@/lib/format";

export function StaleNotice({ since }: { since: number }) {
  const now = useNow(15_000);

  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-md border border-degraded/25 bg-degraded-soft px-3 py-2 text-xs text-ink"
    >
      <LuWifiOff aria-hidden className="size-3.5 shrink-0 text-degraded" />
      Can't reach status server · showing data from {formatAgo(since, now)}
    </p>
  );
}
