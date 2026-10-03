import { csvRow } from "./csv";
import { formatInterval, MONITOR_TYPE_LABELS } from "./monitors";
import { readEnum, readList, readSort, type SortState } from "./searchParams";
import { STATUS_RANK } from "./status";
import type { Monitor, MonitorStatus, MonitorType } from "@/types/monitor";
import { matchesAny } from "./list";

export type SortKey = "status" | "name" | "latency" | "uptime" | "checked";

type MonitorFilters = {
  query: string;
  statuses: MonitorStatus[];
  types: MonitorType[];
  projects: string[];
  tags: string[];
  sort: SortState<SortKey>;
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

export const DEFAULT_SORT: SortState<SortKey> = { key: "status", isDescending: false };

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[];

const VIEWS: MonitorFilters["view"][] = ["table", "cards"];

export function readFilters(params: URLSearchParams): MonitorFilters {
  return {
    query: params.get("q") ?? "",
    statuses: readList(params, "status") as MonitorStatus[],
    types: readList(params, "type") as MonitorType[],
    projects: readList(params, "project"),
    tags: readList(params, "tag"),
    sort: readSort(params, SORT_KEYS, DEFAULT_SORT),
    page: Math.max(1, Number(params.get("page")) || 1),
    view: readEnum(params, "view", VIEWS, "table"),
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

  return monitors
    .filter(
      (monitor) =>
        `${monitor.name} ${monitor.url}`.toLowerCase().includes(query) &&
        matchesAny(filters.statuses, monitor.status) &&
        matchesAny(filters.types, monitor.type) &&
        matchesAny(filters.projects, monitor.project) &&
        (filters.tags.length === 0 || filters.tags.some((tag) => monitor.tags.includes(tag))),
    )
    .sort((a, b) => {
      const left = sortValue(a, filters.sort.key);
      const right = sortValue(b, filters.sort.key);
      const order = left < right ? -1 : left > right ? 1 : a.name.localeCompare(b.name);
      return filters.sort.isDescending ? -order : order;
    });
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

const EXPORT_HEADERS = ["name", "url", "type", "method", "interval", "regions", "project", "tags", "status"];

export function toCsv(monitors: Monitor[]) {
  return [csvRow(EXPORT_HEADERS), ...monitors.map((monitor) => csvRow(Object.values(exportRow(monitor))))].join("\n");
}

export function toJson(monitors: Monitor[]) {
  return JSON.stringify(monitors.map(exportRow), null, 2);
}
