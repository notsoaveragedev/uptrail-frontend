import type { BacktestInterval, BacktestResult } from "@/lib/alertExpression/backtest";
import { formatFieldValue } from "@/lib/alertExpression/catalog";
import { formatElapsed, formatTime } from "@/lib/format";
import type { Monitor } from "@/types/monitor";

export type Zoom = {
  start: number;
  end: number;
};

const ZOOM_PADDING_SECONDS = 45 * 60;

export function chartView(result: BacktestResult, zoom: Zoom | null) {
  const isVisible = (timestamp: number) =>
    !zoom || (timestamp >= zoom.start - ZOOM_PADDING_SECONDS && timestamp <= zoom.end + ZOOM_PADDING_SECONDS);
  const indexes = result.timestamps.flatMap((timestamp, index) => (isVisible(timestamp) ? [index] : []));

  return {
    timestamps: indexes.map((index) => result.timestamps[index]),
    series: [{ label: result.metric, values: indexes.map((index) => result.values[index]), colorVar: "--series-1" }],
    bands: result.intervals.map((interval) => ({ start: interval.start, end: interval.end, label: "" })),
  };
}

export function intervalDuration(interval: BacktestInterval) {
  return formatElapsed((interval.end - interval.start) * 1000);
}

export function intervalPeak(result: BacktestResult, interval: BacktestInterval) {
  return interval.peak === null ? "—" : formatFieldValue(result.field, interval.peak);
}

export function checksReplayed(monitor: Monitor | undefined) {
  if (!monitor) return 0;
  return Math.round(86_400 / monitor.intervalSec) * monitor.regions.length;
}

export function backtestSummary(result: BacktestResult) {
  const peak = Math.max(...result.values.filter((value): value is number => value !== null));
  const fired =
    result.count === 0
      ? "It would not have fired."
      : `It would have fired ${result.count} times, first at ${formatTime(result.intervals[0].start * 1000)}.`;
  return `${result.metric} peaked at ${formatFieldValue(result.field, peak)} in the last 24 hours. ${fired}`;
}
