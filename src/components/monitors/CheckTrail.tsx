import { STATUS_FILL } from "@/lib/status";
import type { MonitorStatus } from "@/types/overview";

export function CheckTrail({ checks }: { checks: MonitorStatus[] }) {
  return (
    <span className="flex gap-0.5">
      {checks.map((check, index) => (
        <span key={index} className={`h-4 w-0.75 rounded-[1px] ${STATUS_FILL[check]}`} />
      ))}
    </span>
  );
}
