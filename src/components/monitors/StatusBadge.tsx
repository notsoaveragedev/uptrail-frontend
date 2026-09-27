import { STATUS_BADGE, STATUS_LABELS } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";
import { StatusIcon } from "./StatusIcon";

type StatusBadgeProps = {
  status: MonitorStatus;
  label?: string;
};

export function StatusBadge({ status, label = STATUS_LABELS[status] }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-sm px-1.5 text-xs font-medium ${STATUS_BADGE[status]}`}
    >
      <StatusIcon status={status} className="size-3" />
      {label}
    </span>
  );
}
