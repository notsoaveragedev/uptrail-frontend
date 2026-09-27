import type { MonitorStatus } from "@/types/monitor";

export const STATUSES: MonitorStatus[] = ["up", "degraded", "down", "paused"];

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

export const STATUS_BADGE: Record<MonitorStatus, string> = {
  up: "bg-up-soft text-up",
  degraded: "bg-degraded-soft text-degraded",
  down: "bg-down-soft text-down",
  paused: "bg-paused-soft text-paused",
};
