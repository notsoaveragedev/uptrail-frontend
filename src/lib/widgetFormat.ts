import type { DashboardRange } from "@/types/dashboard";
import type { Monitor } from "@/types/monitor";
import type { Incident } from "@/types/overview";
import { formatDay, formatLatency, formatTime, latencyText } from "./format";
import { PROJECT_OPTIONS } from "./monitors";
import type { Tone } from "./status";
import type { KpiStat } from "./widgetConfig";

export const SEVERITY_TONE: Record<Incident["severity"], Tone> = {
  "SEV 1": "down",
  "SEV 2": "degraded",
  "SEV 3": "info",
};

export function kpiValue(stat: KpiStat, value: number, decimals: number) {
  if (stat === "uptime") return { value: value >= 100 ? "100" : value.toFixed(decimals), unit: "%" };
  if (stat === "incidents") return { value: String(value), unit: "" };
  return formatLatency(value);
}

export function kpiDelta(stat: KpiStat, value: number, previous: number) {
  const diff = value - previous;
  const arrow = diff > 0 ? "▲" : "▼";
  const isGood = stat === "uptime" ? diff >= 0 : diff <= 0;
  if (Math.abs(diff) < (stat === "uptime" ? 0.005 : 1)) return { text: "No change", isGood: null };
  if (stat === "uptime") return { text: `${arrow} ${Math.abs(diff).toFixed(2)}%`, isGood };
  if (stat === "incidents") return { text: `${arrow} ${Math.abs(diff)}`, isGood };
  return { text: `${arrow} ${latencyText(Math.abs(diff))}`, isGood };
}

export function timeAxisLabel(timestamp: number, range: DashboardRange) {
  return range === "7d" || range === "30d" ? formatDay(timestamp) : formatTime(timestamp);
}

export function timeAxisLabels(start: number, end: number, range: DashboardRange) {
  return [start, start + (end - start) / 3, start + ((end - start) * 2) / 3].map((at) => timeAxisLabel(at, range));
}

export function monitorOptions(monitors: Monitor[]) {
  return PROJECT_OPTIONS.map((project) => ({
    label: project.label,
    title: project.label,
    options: monitors
      .filter((monitor) => monitor.project === project.value)
      .map((monitor) => ({ value: monitor.id, label: monitor.name })),
  }));
}

export function percentOf(value: number, start: number, end: number) {
  return Math.min(100, Math.max(0, ((value - start) / (end - start)) * 100));
}

export function logPercentOf(value: number, start: number, end: number) {
  return percentOf(Math.log(Math.max(value, 1)), Math.log(start), Math.log(end));
}

export function trendShape(values: number[]) {
  const min = Math.min(...values);
  const spread = Math.max(...values) - min;
  if (spread === 0) return values.map(() => 1);
  return values.map((value) => value - min + spread * 0.25);
}
