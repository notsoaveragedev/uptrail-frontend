import { StatusDot } from "@/components/ui/StatusDot";
import { formatElapsed } from "@/lib/format";
import type { AlertEvent } from "@/types/alerts";
import { RuleStateLabel } from "./RuleStateLabel";

export function EventStatus({ event }: { event: AlertEvent }) {
  if (event.status === "firing" || event.resolvedAt === null) return <RuleStateLabel state="firing" />;

  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-muted">
      <StatusDot fill="bg-up" />
      Resolved{" "}
      <span className="font-mono text-xs text-subtle">· {formatElapsed(event.resolvedAt - event.firedAt)}</span>
    </span>
  );
}
