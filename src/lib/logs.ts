import type { CheckStatus, FacetKey, LogsFilters, LogsGroupBy, LogsRange, LogsSortKey } from "@/types/logs";
import { readEnum, readList, readSort } from "./searchParams";

export const LOG_RANGES: LogsRange[] = ["15m", "1h", "24h", "7d"];

export const LOG_RANGE_LABELS: Record<LogsRange, string> = {
  "15m": "Last 15 minutes",
  "1h": "Last hour",
  "24h": "Last 24h",
  "7d": "Last 7 days",
};

export const DEFAULT_LOG_RANGE: LogsRange = "1h";

export const GROUP_BY_LABELS: Record<LogsGroupBy, string> = {
  none: "None",
  monitor: "Monitor",
  status: "Status",
  region: "Region",
};

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  down: "Failed",
  degraded: "Degraded",
  up: "OK",
};

export const FACET_FILTERS: Record<FacetKey, "statuses" | "regions" | "monitors" | "codes"> = {
  status: "statuses",
  region: "regions",
  monitor: "monitors",
  code: "codes",
};

export const FACET_LABELS: Record<FacetKey, string> = {
  status: "Status",
  region: "Region",
  monitor: "Monitor",
  code: "Code",
};

export const FACET_KEYS = Object.keys(FACET_FILTERS) as FacetKey[];

export const FILTER_PARAMS = ["q", ...FACET_KEYS];

export const DEFAULT_LOG_SORT = { key: "ts", isDescending: true } as const;

const SORT_KEYS: LogsSortKey[] = ["ts", "latency", "statusCode", "monitor", "region"];

const GROUP_BY_VALUES = Object.keys(GROUP_BY_LABELS) as LogsGroupBy[];

export function readLogsFilters(params: URLSearchParams): LogsFilters {
  return {
    query: params.get("q") ?? "",
    range: readEnum(params, "range", LOG_RANGES, DEFAULT_LOG_RANGE),
    statuses: readList(params, "status"),
    regions: readList(params, "region"),
    monitors: readList(params, "monitor"),
    codes: readList(params, "code"),
    groupBy: readEnum(params, "group", GROUP_BY_VALUES, "none"),
    sort: readSort(params, SORT_KEYS, DEFAULT_LOG_SORT),
  };
}
