import { Tooltip } from "antd";
import { StatusIcon } from "@/components/monitors/StatusIcon";
import { Card } from "@/components/ui/Card";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { formatDay, formatUptime } from "@/lib/format";
import { STATUS_FILL, UPTIME_THRESHOLDS, uptimeStatus } from "@/lib/status";
import type { UptimeDay } from "@/types/monitorDetail";

function describe(day: UptimeDay) {
  const uptime = day.uptime === null ? "no data" : formatUptime(day.uptime);
  const incidents = day.incidents === 0 ? "no incidents" : `${day.incidents} incident${day.incidents > 1 ? "s" : ""}`;
  return `${formatDay(day.date)} · ${uptime} · ${incidents}`;
}

export function UptimeStripCard({ days, uptime }: { days: UptimeDay[]; uptime: number | null }) {
  const labels = [0, 30, 60].map((index) => formatDay(days[index].date));
  const badDays = days.filter((day) => uptimeStatus(day.uptime) !== "up").length;

  return (
    <Card
      title="Uptime · last 90 days"
      meta={<UptimeValue value={uptime} className="text-sm" />}
      extra={
        <ul className="hidden items-center gap-4 text-xs text-muted sm:flex">
          <li className="flex items-center gap-1.5">
            <StatusIcon status="up" className="size-3.5" />
            Operational ≥ {UPTIME_THRESHOLDS.up}%
          </li>
          <li className="flex items-center gap-1.5">
            <StatusIcon status="degraded" className="size-3.5" />
            Degraded ≥ {UPTIME_THRESHOLDS.degraded}%
          </li>
          <li className="flex items-center gap-1.5">
            <StatusIcon status="down" className="size-3.5" />
            Down &lt; {UPTIME_THRESHOLDS.degraded}%
          </li>
        </ul>
      }
    >
      <div className="px-4 pb-4">
        <div className="flex h-8 gap-0.5">
          {days.map((day) => {
            const status = uptimeStatus(day.uptime);
            return (
              <Tooltip key={day.date} title={<span className="font-mono">{describe(day)}</span>}>
                <span
                  role="img"
                  aria-label={describe(day)}
                  className={`flex-1 rounded-xs opacity-85 hover:opacity-100 ${status ? STATUS_FILL[status] : "bg-line-strong"}`}
                />
              </Tooltip>
            );
          })}
        </div>
        <div aria-hidden className="mt-2 flex justify-between font-mono text-xs text-subtle">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
          <span>Today</span>
        </div>
        <p className="sr-only">
          {badDays === 0
            ? `Every day in the last 90 met ${UPTIME_THRESHOLDS.up}% uptime.`
            : `${badDays} of the last 90 days fell below ${UPTIME_THRESHOLDS.up}% uptime.`}
        </p>
      </div>
    </Card>
  );
}
