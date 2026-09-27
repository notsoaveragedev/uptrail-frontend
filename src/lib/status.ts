import type { MonitorStatus } from "@/types/monitor";
import { LATENCY_THRESHOLD_MS } from "./format";

export type Tone = MonitorStatus | "info";

export const STATUSES: MonitorStatus[] = ["up", "degraded", "down", "paused"];

export const STATUS_RANK: Record<MonitorStatus, number> = { down: 0, degraded: 1, paused: 2, up: 3 };

export const STATUS_LABELS: Record<MonitorStatus, string> = {
  up: "Up",
  degraded: "Degraded",
  down: "Down",
  paused: "Paused",
};

export const STATUS_TEXT: Record<MonitorStatus, string> = {
  up: "text-up",
  degraded: "text-degraded",
  down: "text-down",
  paused: "text-paused",
};

export const STATUS_FILL: Record<MonitorStatus, string> = {
  up: "bg-up",
  degraded: "bg-degraded",
  down: "bg-down",
  paused: "bg-line-strong",
};

export const TONE_TEXT: Record<Tone, string> = { ...STATUS_TEXT, info: "text-maintenance" };

export const TONE_BADGE: Record<Tone, string> = {
  up: "bg-up-soft text-up",
  degraded: "bg-degraded-soft text-degraded",
  down: "bg-down-soft text-down",
  paused: "bg-paused-soft text-paused",
  info: "bg-maintenance-soft text-maintenance",
};

export const UPTIME_THRESHOLDS = { up: 99.9, degraded: 99 };

export function uptimeStatus(percent: number | null): MonitorStatus | null {
  if (percent === null) return null;
  if (percent >= UPTIME_THRESHOLDS.up) return "up";
  return percent >= UPTIME_THRESHOLDS.degraded ? "degraded" : "down";
}

export function uptimeTone(percent: number | null) {
  const status = uptimeStatus(percent);
  if (status === null) return "text-subtle";
  return status === "up" ? "text-ink" : STATUS_TEXT[status];
}

export function latencyTone(ms: number) {
  return ms > LATENCY_THRESHOLD_MS ? "text-degraded" : "text-ink";
}

export function statusTrail(length: number, fill: MonitorStatus, overrides: Record<number, MonitorStatus> = {}) {
  return Array.from({ length }, (_, index) => overrides[index] ?? fill);
}
