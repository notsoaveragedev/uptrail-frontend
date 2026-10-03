import { STATUS_FILL, STATUS_LABELS, STATUS_TEXT, STATUSES } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";

type HealthBarProps = { counts: Record<MonitorStatus, number>; total: number };

export function HealthBar({ counts, total }: HealthBarProps) {
  const present = STATUSES.filter((status) => counts[status] > 0);
  const summary = present.map((status) => `${counts[status]} ${STATUS_LABELS[status].toLowerCase()}`).join(", ");

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="img"
        aria-label={total ? summary : "No monitors"}
        className="flex h-1.5 gap-px overflow-hidden rounded-full bg-line"
      >
        {present.map((status) => (
          <span key={status} className={STATUS_FILL[status]} style={{ flexGrow: counts[status] }} />
        ))}
      </div>
      <span aria-hidden className="flex gap-3 font-mono text-xs">
        {present.map((status) => (
          <span key={status} className={status === "up" ? "text-muted" : STATUS_TEXT[status]}>
            {counts[status]} {STATUS_LABELS[status].toLowerCase()}
          </span>
        ))}
      </span>
    </div>
  );
}
