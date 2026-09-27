import { TickMeter } from "@/components/ui/TickMeter";

function fillFor(uptime: number) {
  if (uptime >= 99.9) return "bg-up";
  if (uptime >= 99.5) return "bg-degraded";
  return "bg-down";
}

export function UptimeMeter({ uptime }: { uptime: number | null }) {
  const value = uptime === null ? 0 : uptime >= 100 ? 10 : Math.max(1, Math.min(9, Math.floor((uptime - 99) * 10)));
  return <TickMeter value={value} total={10} fillClassName={uptime === null ? "" : fillFor(uptime)} label="Uptime" />;
}
