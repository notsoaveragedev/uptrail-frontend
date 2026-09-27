import { formatLatency } from "@/lib/format";
import type { MonitorStatus } from "@/types/monitor";
import type { DetailTab, IncidentState, TimingPhase } from "@/types/monitorDetail";
import type { TimeRange } from "@/types/overview";

export const DETAIL_TABS: DetailTab[] = ["overview", "checks", "incidents", "alerts", "settings"];

export const DETAIL_RANGES: TimeRange[] = ["1h", "24h", "7d", "30d"];

export const LATENCY_THRESHOLD_MS = 800;

export const TIMING_PHASES: { key: TimingPhase; label: string; fill: string }[] = [
  { key: "dns", label: "DNS", fill: "bg-faint" },
  { key: "connect", label: "Connect", fill: "bg-subtle" },
  { key: "tls", label: "TLS", fill: "bg-series-2" },
  { key: "ttfb", label: "TTFB", fill: "bg-series-1" },
  { key: "download", label: "Download", fill: "bg-series-4" },
];

export const INCIDENT_STATE_TONE: Record<IncidentState, string> = {
  Investigating: "text-down",
  Identified: "text-degraded",
  Monitoring: "text-muted",
  Resolved: "text-up",
};

export function latencyText(ms: number) {
  const { value, unit } = formatLatency(ms);
  return `${value} ${unit}`;
}

export function formatSince(ms: number) {
  const minutes = Math.max(1, Math.floor(ms / 60_000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

export function formatSpan(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function dayStatus(uptime: number | null): MonitorStatus | null {
  if (uptime === null) return null;
  if (uptime >= 99.9) return "up";
  return uptime >= 98 ? "degraded" : "down";
}

export function formatClock(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDay(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
