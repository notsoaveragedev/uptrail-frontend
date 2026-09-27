export function formatLatency(ms: number) {
  return ms >= 1000 ? { value: (ms / 1000).toFixed(2), unit: "s" } : { value: String(Math.round(ms)), unit: "ms" };
}

export function formatUptime(percent: number) {
  return percent >= 100 ? "100%" : `${percent.toFixed(2)}%`;
}

export function formatAgo(timestamp: number, now: number) {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}m ${String(totalSeconds % 60).padStart(2, "0")}s`;
}

export function uptimeTone(percent: number | null) {
  if (percent === null) return "text-subtle";
  if (percent < 99) return "text-down";
  if (percent < 99.9) return "text-degraded";
  return "text-ink";
}
