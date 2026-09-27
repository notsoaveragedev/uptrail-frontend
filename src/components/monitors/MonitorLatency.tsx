import { latencyTone } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";
import { LatencyValue } from "./LatencyValue";

type MonitorLatencyProps = {
  ms: number | null;
  status: MonitorStatus;
  className?: string;
};

export function MonitorLatency({ ms, status, className = "" }: MonitorLatencyProps) {
  if (ms !== null) return <LatencyValue ms={ms} tone={latencyTone(ms)} className={className} />;
  const isDown = status === "down";
  return (
    <span className={`font-mono ${isDown ? "text-down" : "text-subtle"} ${className}`}>{isDown ? "Timeout" : "—"}</span>
  );
}
