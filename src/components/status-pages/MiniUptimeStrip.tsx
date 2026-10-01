import { formatUptime } from "@/lib/format";
import { STATUS_FILL, UPTIME_THRESHOLDS, uptimeStatus } from "@/lib/status";
import type { SnapshotDay } from "@/types/statusPage";

type MiniUptimeStripProps = {
  days: SnapshotDay[];
  uptime: number | null;
};

export function MiniUptimeStrip({ days, uptime }: MiniUptimeStripProps) {
  const badDays = days.filter((day) => uptimeStatus(day.uptime) !== "up").length;

  return (
    <div className="flex items-center gap-3">
      <div
        role="img"
        aria-label={`${formatUptime(uptime)} uptime over 90 days, ${badDays} days below ${UPTIME_THRESHOLDS.up}%`}
        className="flex h-6 flex-1 gap-px"
      >
        {days.map((day) => {
          const status = uptimeStatus(day.uptime);
          return (
            <span key={day.date} className={`flex-1 rounded-xs ${status ? STATUS_FILL[status] : "bg-line-strong"}`} />
          );
        })}
      </div>
      <span className="w-14 text-right font-mono text-xs text-muted">{formatUptime(uptime)}</span>
    </div>
  );
}
