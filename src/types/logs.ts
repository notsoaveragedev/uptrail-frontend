import type { MonitorStatus, RegionCode } from "./monitor";

export type CheckStatus = Exclude<MonitorStatus, "paused">;

export type TimingPhase = "dns" | "connect" | "tls" | "ttfb" | "download";

export type Timings = Record<TimingPhase, number>;

export type CheckResult = {
  id: string;
  ts: number;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  region: RegionCode;
  status: CheckStatus;
  statusCode: number | null;
  latencyMs: number;
  timings: Timings;
  sizeBytes: number | null;
  error: { type: string; message: string } | null;
};

export type CheckResultDetail = CheckResult & {
  method: string;
  assertions: { name: string; expected: string; actual: string; passed: boolean }[];
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string> | null;
};

export type LogsRange = "15m" | "1h" | "24h" | "7d";

export type LogsGroupBy = "none" | "monitor" | "status" | "region";

export type LogsSortKey = "ts" | "latency" | "statusCode" | "monitor" | "region";

export type LogsFilters = {
  query: string;
  range: LogsRange;
  statuses: string[];
  regions: string[];
  monitors: string[];
  codes: string[];
  groupBy: LogsGroupBy;
  sort: { key: LogsSortKey; isDescending: boolean };
};

export type FacetKey = "status" | "region" | "monitor" | "code";

export type FacetCounts = Record<FacetKey, Record<string, number>>;

export type LogsGroup = {
  key: string;
  label: string;
  count: number;
  failed: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  recent: CheckStatus[];
};

export type LogsPage = {
  items: CheckResult[];
  nextCursor: number | null;
  total: number;
  failed: number;
  p95LatencyMs: number;
  facets: FacetCounts;
  groups: LogsGroup[];
};
