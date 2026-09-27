import type { TimeRange } from "@/types/overview";

export const TIME_RANGES: TimeRange[] = ["1h", "24h", "7d", "30d"];

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "1h": "Last hour",
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};
