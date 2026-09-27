import type { CheckResult } from "./logs";
import type { MonitorStatus, RegionCode } from "./monitor";
import type { MonitorIncident } from "./monitorDetail";

export type LatencySeries = {
  id: string;
  label: string;
  values: (number | null)[];
};

export type LatencyChartData = {
  timestamps: number[];
  series: LatencySeries[];
};

export type KpiData = {
  value: number;
  previous: number;
  spark: number[];
};

export type HeatmapCell = MonitorStatus | "none";

export type HeatmapRow = {
  monitorId: string;
  name: string;
  uptime: number;
  cells: HeatmapCell[];
};

export type HeatmapData = {
  start: number;
  stepMs: number;
  rows: HeatmapRow[];
};

export type HistogramBin = {
  start: number;
  end: number;
  count: number;
};

export type HistogramData = {
  bins: HistogramBin[];
  p50: number;
  p95: number;
  total: number;
};

export type TimelineIncident = Pick<MonitorIncident, "id" | "severity" | "title" | "startedAt" | "resolvedAt">;

export type TimelineLane = {
  monitorId: string;
  name: string;
  incidents: TimelineIncident[];
};

export type TimelineData = {
  start: number;
  end: number;
  lanes: TimelineLane[];
};

export type RegionTile = {
  code: RegionCode;
  city: string;
  status: MonitorStatus;
  value: number;
  monitors: number;
};

export type RegionMapData = {
  tiles: RegionTile[];
};

export type SlowestRow = {
  monitorId: string;
  name: string;
  url: string;
  status: MonitorStatus;
  valueMs: number;
};

export type SlowestData = {
  rows: SlowestRow[];
};

export type LiveLogLine = Pick<
  CheckResult,
  "id" | "ts" | "region" | "status" | "monitorName" | "latencyMs" | "statusCode"
>;

export type LiveLogData = {
  lines: LiveLogLine[];
};

export type WidgetDataMap = {
  latency_chart: LatencyChartData;
  kpi: KpiData;
  heatmap: HeatmapData;
  histogram: HistogramData;
  incident_timeline: TimelineData;
  region_map: RegionMapData;
  slowest: SlowestData;
  live_log: LiveLogData;
  text: null;
};
