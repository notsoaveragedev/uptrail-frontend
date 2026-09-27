import { formatInterval, MONITOR_TYPE_LABELS } from "@/lib/monitors";
import type { Monitor, MonitorStatus, MonitorType } from "@/types/monitor";

export type SortKey = "status" | "name" | "latency" | "uptime" | "checked";

export type MonitorFilters = {
  query: string;
  statuses: MonitorStatus[];
  types: MonitorType[];
  projects: string[];
  tags: string[];
  sort: { key: SortKey; isDescending: boolean };
  page: number;
  view: "table" | "cards";
};

export const PAGE_SIZE = 10;

export const SORT_LABELS: Record<SortKey, string> = {
  status: "Status",
  name: "Name",
  latency: "Response time",
  uptime: "Uptime",
  checked: "Last checked",
};

const STATUS_RANK: Record<MonitorStatus, number> = { down: 0, degraded: 1, paused: 2, up: 3 };

function readList<Value extends string>(params: URLSearchParams, key: string) {
  return (params.get(key)?.split(",").filter(Boolean) ?? []) as Value[];
}

export function readFilters(params: URLSearchParams): MonitorFilters {
  const sort = params.get("sort") ?? "status";
  const key = sort.replace(/^-/, "") as SortKey;
  return {
    query: params.get("q") ?? "",
    statuses: readList<MonitorStatus>(params, "status"),
    types: readList<MonitorType>(params, "type"),
    projects: readList(params, "project"),
    tags: readList(params, "tag"),
    sort: { key: key in SORT_LABELS ? key : "status", isDescending: sort.startsWith("-") },
    page: Math.max(1, Number(params.get("page")) || 1),
    view: params.get("view") === "cards" ? "cards" : "table",
  };
}

function sortValue(monitor: Monitor, key: SortKey) {
  if (key === "status") return STATUS_RANK[monitor.status];
  if (key === "name") return monitor.name.toLowerCase();
  if (key === "latency") return monitor.latencyMs ?? Number.MAX_SAFE_INTEGER;
  if (key === "uptime") return monitor.uptime30d ?? -1;
  return -(monitor.lastCheckedAt ?? 0);
}

export function filterMonitors(monitors: Monitor[], filters: MonitorFilters) {
  const query = filters.query.trim().toLowerCase();
  const matches = (list: string[], value: string) => list.length === 0 || list.includes(value);

  return monitors
    .filter(
      (monitor) =>
        `${monitor.name} ${monitor.url}`.toLowerCase().includes(query) &&
        matches(filters.statuses, monitor.status) &&
        matches(filters.types, monitor.type) &&
        matches(filters.projects, monitor.project) &&
        (filters.tags.length === 0 || filters.tags.some((tag) => monitor.tags.includes(tag))),
    )
    .sort((a, b) => {
      const left = sortValue(a, filters.sort.key);
      const right = sortValue(b, filters.sort.key);
      const order = left < right ? -1 : left > right ? 1 : a.name.localeCompare(b.name);
      return filters.sort.isDescending ? -order : order;
    });
}

export function countBy(monitors: Monitor[], read: (monitor: Monitor) => string | string[]) {
  const counts: Record<string, number> = {};
  for (const monitor of monitors) {
    const values = read(monitor);
    for (const value of Array.isArray(values) ? values : [values]) counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function exportRow(monitor: Monitor) {
  return {
    name: monitor.name,
    url: monitor.url,
    type: MONITOR_TYPE_LABELS[monitor.type],
    method: monitor.method,
    interval: formatInterval(monitor.intervalSec),
    regions: monitor.regions.map((region) => region.code).join(";"),
    project: monitor.project,
    tags: monitor.tags.join(";"),
    status: monitor.status,
  };
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const EXPORT_HEADERS = ["name", "url", "type", "method", "interval", "regions", "project", "tags", "status"];

export function toCsv(monitors: Monitor[]) {
  const rows = monitors.map((monitor) => Object.values(exportRow(monitor)).map(csvCell).join(","));
  return [EXPORT_HEADERS.join(","), ...rows].join("\n");
}

export function toJson(monitors: Monitor[]) {
  return JSON.stringify(monitors.map(exportRow), null, 2);
}

export function downloadFile(content: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
