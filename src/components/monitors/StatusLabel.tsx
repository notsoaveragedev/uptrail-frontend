import { STATUS_LABELS, STATUS_TEXT } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";
import { StatusIcon } from "./StatusIcon";

export function StatusLabel({ status }: { status: MonitorStatus }) {
  return (
    <span className={`flex items-center gap-2 font-medium ${STATUS_TEXT[status]}`}>
      <StatusIcon status={status} />
      {STATUS_LABELS[status]}
    </span>
  );
}
