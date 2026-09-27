import { StatusLabel } from "@/components/monitors/StatusLabel";
import { Card } from "@/components/ui/Card";
import { latencyText } from "@/lib/monitorDetail";
import { STATUS_FILL } from "@/lib/status";
import type { RegionStat } from "@/types/monitorDetail";

const BAR_SCALE_MS = 1000;

export function RegionsCard({ regions }: { regions: RegionStat[] }) {
  return (
    <Card
      title="By region"
      extra={<span className="text-xs text-subtle">Last check · p95 24h</span>}
      className="h-full"
    >
      <ul className="flex flex-col px-4 pb-2">
        {regions.map((region) => (
          <li
            key={region.code}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)_5.5rem] items-center gap-4 border-b border-line py-3 last:border-b-0"
          >
            <span className="flex flex-col">
              <span className="font-mono font-medium">{region.code}</span>
              <span className="text-xs text-subtle">{region.city}</span>
            </span>
            <StatusLabel status={region.status} />
            <span className="h-1.5 overflow-hidden rounded-full bg-hover">
              <span
                className={`block h-full rounded-full ${region.latencyMs === null ? STATUS_FILL[region.status] : "bg-subtle"}`}
                style={{ width: `${barWidth(region)}%` }}
              />
            </span>
            <span className="flex flex-col items-end">
              <span className={`font-mono ${region.latencyMs === null ? "text-down" : "text-ink"}`}>
                {region.latencyMs === null
                  ? region.status === "paused"
                    ? "—"
                    : "Timeout"
                  : latencyText(region.latencyMs)}
              </span>
              <span className="font-mono text-xs text-subtle">p95 {latencyText(region.p95Ms)}</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function barWidth(region: RegionStat) {
  if (region.latencyMs === null) return region.status === "paused" ? 0 : 100;
  return Math.min(100, (region.latencyMs / BAR_SCALE_MS) * 100);
}
