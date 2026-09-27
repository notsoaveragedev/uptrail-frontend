import { StatusDot } from "@/components/ui/StatusDot";
import { STATUS_FILL, STATUS_LABELS } from "@/lib/status";
import type { Monitor } from "@/types/monitor";

export function RegionDots({ regions }: { regions: Monitor["regions"] }) {
  return (
    <span className="flex gap-2.5 font-mono text-xs text-muted">
      {regions.map((region) => (
        <span
          key={region.code}
          title={`${region.code}: ${STATUS_LABELS[region.status]}`}
          className="flex items-center gap-1"
        >
          <StatusDot fill={STATUS_FILL[region.status]} />
          {region.code}
        </span>
      ))}
    </span>
  );
}
