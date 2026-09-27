export const LATENCY_THRESHOLD_MS = 800;

export function formatLatency(ms: number) {
  return ms >= 1000 ? { value: (ms / 1000).toFixed(2), unit: "s" } : { value: String(Math.round(ms)), unit: "ms" };
}

export function latencyText(ms: number) {
  const { value, unit } = formatLatency(ms);
  return `${value} ${unit}`;
}

export function formatUptime(percent: number | null) {
  if (percent === null) return "—";
  return percent >= 100 ? "100%" : `${percent.toFixed(2)}%`;
}

export function formatBytes(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

export function formatElapsed(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / 1440)}d ${Math.floor(minutes / 60) % 24}h`;
}

function pad(value: number, length = 2) {
  return String(value).padStart(length, "0");
}

export function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatClock(timestamp: number) {
  const date = new Date(timestamp);
  return `${formatTime(timestamp)}:${pad(date.getSeconds())}`;
}

export function formatClockMs(timestamp: number) {
  return `${formatClock(timestamp)}.${pad(new Date(timestamp).getMilliseconds(), 3)}`;
}

export function formatDay(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(timestamp: number) {
  return `${formatDay(timestamp)}, ${formatTime(timestamp)}`;
}
