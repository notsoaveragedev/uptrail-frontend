import type { HttpMethod, Monitor, MonitorChange, MonitorType, RegionCode } from "@/types/monitor";
import { newId } from "./ids";

export const MONITOR_TYPE_LABELS: Record<MonitorType, string> = {
  http: "HTTP",
  keyword: "Keyword",
  json: "JSON",
  ssl: "SSL",
  response_time: "Resp. time",
};

export const MONITOR_TYPE_VALUES = Object.keys(MONITOR_TYPE_LABELS) as MonitorType[];

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];

export const DEFAULT_TIMEOUT_MS = 10_000;

export const REGIONS: { code: RegionCode; city: string }[] = [
  { code: "BOM", city: "Mumbai" },
  { code: "FRA", city: "Frankfurt" },
  { code: "IAD", city: "Ashburn" },
  { code: "SIN", city: "Singapore" },
  { code: "SFO", city: "San Francisco" },
];

export const PROJECT_OPTIONS = [
  { value: "shopnest", label: "Shopnest" },
  { value: "pixelcraft", label: "Pixelcraft" },
  { value: "bluepeak", label: "Bluepeak" },
];

export const TAGS = ["production", "staging", "api", "payments", "marketing", "customer-facing", "internal", "tier-1"];

export function projectLabel(value: string) {
  return PROJECT_OPTIONS.find((project) => project.value === value)?.label ?? value;
}

export function regionCity(code: RegionCode) {
  return REGIONS.find((region) => region.code === code)?.city ?? code;
}

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export function formatInterval(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${seconds / 60}m`;
  return `${seconds / 3600}h`;
}

export function duplicateMonitor(monitor: Monitor): Monitor {
  const now = Date.now();
  return {
    ...monitor,
    id: newId("mon"),
    name: `${monitor.name} (copy)`,
    status: "paused",
    statusSince: now,
    regions: monitor.regions.map((region) => ({ ...region, status: "paused" })),
  };
}

export function applyMonitorChange(monitors: Monitor[], change: MonitorChange) {
  const ids = new Set(change.ids);
  const update = (patch: (monitor: Monitor) => Monitor) =>
    monitors.map((monitor) => (ids.has(monitor.id) ? patch(monitor) : monitor));

  switch (change.action) {
    case "delete":
      return monitors.filter((monitor) => !ids.has(monitor.id));
    case "check":
      return update((monitor) => ({ ...monitor, lastCheckedAt: Date.now() }));
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
