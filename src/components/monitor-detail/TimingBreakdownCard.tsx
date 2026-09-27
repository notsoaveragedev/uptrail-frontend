import { Tooltip } from "antd";
import { Card } from "@/components/ui/Card";
import { TIMING_PHASES } from "@/lib/timing";
import type { TimingHour } from "@/types/monitorDetail";

function total(hour: TimingHour) {
  return TIMING_PHASES.reduce((sum, phase) => sum + hour.phases[phase.key], 0);
}

export function TimingBreakdownCard({ timing }: { timing: TimingHour[] }) {
  const max = Math.max(...timing.map(total));
  const averages = TIMING_PHASES.map((phase) => ({
    ...phase,
    average: Math.round(timing.reduce((sum, hour) => sum + hour.phases[phase.key], 0) / timing.length),
  }));
  const stacked = [...TIMING_PHASES].reverse();

  return (
    <Card
      title="Timing breakdown"
      extra={<span className="text-xs text-subtle">Avg per hour · successful checks</span>}
      className="h-full"
    >
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="flex h-40 items-end gap-2 border-b border-line">
          {timing.map((hour) => (
            <Tooltip key={hour.hour} title={`${hour.hour} · ${total(hour)} ms`}>
              <div
                tabIndex={0}
                aria-label={`${hour.hour}: ${total(hour)} ms`}
                className="flex flex-1 flex-col gap-px rounded-t-sm opacity-90 outline-none hover:opacity-100 focus-visible:opacity-100"
                style={{ height: `${(total(hour) / max) * 100}%` }}
              >
                {stacked.map((phase) => (
                  <span
                    key={phase.key}
                    className={`first:rounded-t-sm ${phase.fill}`}
                    style={{ flexGrow: hour.phases[phase.key] }}
                  />
                ))}
              </div>
            </Tooltip>
          ))}
        </div>
        <div aria-hidden className="flex gap-2 font-mono text-xs text-subtle">
          {timing.map((hour) => (
            <span key={hour.hour} className="flex-1 text-center">
              {hour.hour}
            </span>
          ))}
        </div>
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {averages.map((phase) => (
            <li key={phase.key} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-xs ${phase.fill}`} />
              {phase.label}
              <span className="font-mono text-ink">{phase.average}</span>
              <span className="font-mono text-subtle">ms</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
