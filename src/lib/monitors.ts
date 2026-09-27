import type { Monitor, MonitorChange, MonitorType, RegionCode } from "@/types/monitor";

export const MONITOR_TYPE_LABELS: Record<MonitorType, string> = {
  http: "HTTP",
  keyword: "Keyword",
  json: "JSON",
  ssl: "SSL",
  response_time: "Resp. time",
};

export const REGIONS: { code: RegionCode; city: string }[] = [
  { code: "BOM", city: "Mumbai" },
  { code: "FRA", city: "Frankfurt" },
  { code: "IAD", city: "Ashburn" },
  { code: "SIN", city: "Singapore" },
  { code: "SFO", city: "San Francisco" },
];

export const TAGS = ["production", "staging", "api", "payments", "marketing", "customer-facing", "internal", "tier-1"];

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export function formatInterval(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${seconds / 60}m`;
  return `${seconds / 3600}h`;
}

export function applyMonitorChange(monitors: Monitor[], change: MonitorChange) {
  const ids = new Set(change.ids);
  const update = (patch: (monitor: Monitor) => Monitor) =>
    monitors.map((monitor) => (ids.has(monitor.id) ? patch(monitor) : monitor));

  switch (change.action) {
    case "delete":
      return monitors.filter((monitor) => !ids.has(monitor.id));
    case "pause":
      return update((monitor) => ({ ...monitor, status: "paused", statusSince: Date.now() }));
    case "resume":
      return update((monitor) => ({ ...monitor, status: "up", statusSince: Date.now() }));
    case "move":
      return update((monitor) => ({ ...monitor, project: change.project }));
    case "tag":
      return update((monitor) =>
        monitor.tags.includes(change.tag) ? monitor : { ...monitor, tags: [...monitor.tags, change.tag] },
      );
  }
}
