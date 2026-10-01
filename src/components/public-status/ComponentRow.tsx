import { Sparkline } from "@/components/charts/Sparkline";
import { UptimeStrip } from "@/components/monitors/UptimeStrip";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { averageUptime } from "@/lib/publicStatus";
import type { SnapshotComponent } from "@/types/statusPage";
import { ComponentStatusBadge } from "./ComponentStatusBadge";

type ComponentRowProps = {
  component: SnapshotComponent;
  dayCount: number;
  showBars: boolean;
  isFlashing: boolean;
};

export function ComponentRow({ component, dayCount, showBars, isFlashing }: ComponentRowProps) {
  const days = component.days.slice(-dayCount);

  return (
    <li className={`flex flex-col gap-2.5 px-4 py-3.5 ${isFlashing ? "animate-[flash_1.2s_ease-out]" : ""}`}>
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1 truncate font-medium">{component.name}</span>
        {component.latency && (
          <span title="Response time, last hour">
            <Sparkline values={component.latency} />
          </span>
        )}
        <ComponentStatusBadge status={component.status} />
      </div>
      {showBars && (
        <>
          <UptimeStrip days={days} label={`${component.name} daily uptime, last ${dayCount} days`} />
          <div aria-hidden className="flex items-center gap-3 text-xs text-subtle">
            <span>{dayCount} days ago</span>
            <span className="h-px flex-1 bg-line" />
            <span>
              <UptimeValue value={averageUptime(days)} /> uptime
            </span>
            <span className="h-px flex-1 bg-line" />
            <span>Today</span>
          </div>
        </>
      )}
    </li>
  );
}
