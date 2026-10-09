import type { ReactNode } from "react";
import type { GridItem } from "@/types/dataGrid";
import type { CheckResult, FacetCounts, FacetKey, LogsFilters, LogsGroup, LogsPage, LogsRange } from "@/types/logs";
import { CHECK_STATUS_LABELS, FACET_FILTERS, FACET_KEYS } from "./logs";
import { STATUS_RANK } from "./status";

const RANGE_MS: Record<LogsRange, number> = {
  "15m": 15 * 60_000,
  "1h": 3_600_000,
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
};

function codeClass(code: number | null) {
  return code === null ? "none" : `${Math.floor(code / 100)}xx`;
}

function facetValue(result: CheckResult, facet: FacetKey) {
  if (facet === "status") return result.status;
  if (facet === "region") return result.region;
  if (facet === "monitor") return result.monitorId;
  return codeClass(result.statusCode);
}

function matchesBase(result: CheckResult, since: number, until: number, query: string) {
  if (result.ts < since || result.ts > until) return false;
  if (!query) return true;
  return `${result.monitorName} ${result.monitorUrl} ${result.error?.message ?? ""} ${result.statusCode ?? ""}`
    .toLowerCase()
    .includes(query);
}

function passesFacet(result: CheckResult, filters: LogsFilters, facet: FacetKey) {
  const selected = filters[FACET_FILTERS[facet]];
  return selected.length === 0 || selected.includes(facetValue(result, facet));
}

function groupValue(result: CheckResult, filters: LogsFilters) {
  if (filters.groupBy === "monitor") return result.monitorName;
  if (filters.groupBy === "region") return result.region;
  if (filters.groupBy === "status") return String(STATUS_RANK[result.status]);
  return "";
}

function sortValue(result: CheckResult, key: LogsFilters["sort"]["key"]) {
  if (key === "latency") return result.latencyMs;
  if (key === "statusCode") return result.statusCode ?? -1;
  if (key === "monitor") return result.monitorName;
  if (key === "region") return result.region;
  return result.ts;
}

function compare(a: string | number, b: string | number) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function percentile(values: number[], fraction: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

export function runLogsQuery(results: CheckResult[], filters: LogsFilters, anchor: number) {
  const since = filters.window?.from ?? anchor - RANGE_MS[filters.range];
  const until = filters.window?.to ?? anchor;
  const query = filters.query.trim().toLowerCase();
  const facets: FacetCounts = { status: {}, region: {}, monitor: {}, code: {} };
  const matched: CheckResult[] = [];

  for (const result of results) {
    if (!matchesBase(result, since, until, query)) continue;
    const passes = FACET_KEYS.map((facet) => passesFacet(result, filters, facet));
    FACET_KEYS.forEach((facet, index) => {
      if (passes.every((passed, other) => other === index || passed)) {
        const value = facetValue(result, facet);
        facets[facet][value] = (facets[facet][value] ?? 0) + 1;
      }
    });
    if (passes.every(Boolean)) matched.push(result);
  }

  const direction = filters.sort.isDescending ? -1 : 1;
  matched.sort(
    (a, b) =>
      compare(groupValue(a, filters), groupValue(b, filters)) ||
      direction * compare(sortValue(a, filters.sort.key), sortValue(b, filters.sort.key)),
  );

  return { matched, facets };
}

export function summarizeGroups(matched: CheckResult[], filters: LogsFilters): LogsGroup[] {
  if (filters.groupBy === "none") return [];
  const buckets = new Map<string, CheckResult[]>();
  for (const result of matched) {
    const key = groupKey(result, filters);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(result);
    else buckets.set(key, [result]);
  }
  return [...buckets.entries()].map(([key, rows]) => {
    const latencies = rows.map((row) => row.latencyMs);
    return {
      key,
      label: groupLabel(rows[0], filters),
      count: rows.length,
      failed: rows.filter((row) => row.status === "down").length,
      avgLatencyMs: Math.round(latencies.reduce((sum, value) => sum + value, 0) / rows.length),
      p95LatencyMs: percentile(latencies, 0.95),
      recent: [...rows]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 30)
        .reverse()
        .map((row) => row.status),
    };
  });
}

export function groupKey(result: CheckResult, filters: LogsFilters) {
  if (filters.groupBy === "monitor") return result.monitorId;
  if (filters.groupBy === "region") return result.region;
  if (filters.groupBy === "status") return result.status;
  return "";
}

function groupLabel(result: CheckResult, filters: LogsFilters) {
  if (filters.groupBy === "monitor") return result.monitorName;
  if (filters.groupBy === "region") return result.region;
  return CHECK_STATUS_LABELS[result.status];
}

export function buildLogItems(
  pages: LogsPage[],
  filters: LogsFilters,
  collapsed: Set<string>,
  renderGroup: (group: LogsGroup) => ReactNode,
): GridItem<CheckResult>[] {
  const rows = pages.flatMap((page) => page.items);
  if (filters.groupBy === "none") return rows.map((row) => ({ type: "row", key: row.id, row }));

  const groups = new Map((pages[0]?.groups ?? []).map((group) => [group.key, group]));
  const items: GridItem<CheckResult>[] = [];
  let currentGroup: string | null = null;

  for (const row of rows) {
    const key = groupKey(row, filters);
    if (key !== currentGroup) {
      currentGroup = key;
      const group = groups.get(key);
      if (group) items.push({ type: "group", key, group: { key, content: renderGroup(group) } });
    }
    if (!collapsed.has(key)) items.push({ type: "row", key: row.id, row, groupKey: key });
  }

  return items;
}
