import { TickMeter } from "@/components/ui/TickMeter";
import { STATUS_FILL, uptimeStatus } from "@/lib/status";

export function UptimeMeter({ uptime }: { uptime: number | null }) {
  const status = uptimeStatus(uptime);
  const value = uptime === null ? 0 : uptime >= 100 ? 10 : Math.max(1, Math.min(9, Math.floor((uptime - 99) * 10)));
  return <TickMeter value={value} total={10} fillClassName={status ? STATUS_FILL[status] : ""} label="Uptime" />;
}
