import { LATENCY_THRESHOLD_MS } from "@/lib/format";
import { percentile } from "@/lib/logsQuery";
import { DEFAULT_TIMEOUT_MS, REGIONS } from "@/lib/monitors";
import { STATUS_RANK } from "@/lib/status";
import {
  heatmapConfigSchema,
  histogramConfigSchema,
  kpiConfigSchema,
  latencyChartConfigSchema,
  liveLogConfigSchema,
  MAX_CHART_MONITORS,
  RANGE_MS,
  readConfig,
  regionMapConfigSchema,
  slowestConfigSchema,
  timelineConfigSchema,
  widgetRange,
  type Aggregation,
  type HeatmapConfig,
  type HistogramConfig,
  type KpiConfig,
  type LatencyChartConfig,
  type LatencyMetric,
  type LiveLogConfig,
  type LogFilter,
  type RegionMapConfig,
  type SlowestConfig,
  type TimelineConfig,
} from "@/lib/widgetConfig";
import type { DashboardRange, DashboardWidget, WidgetType } from "@/types/dashboard";
import type { CheckResult, CheckStatus } from "@/types/logs";
import type { Monitor, MonitorStatus, RegionCode } from "@/types/monitor";
import type { ResponseHistory } from "@/types/monitorDetail";
import type { TimeRange } from "@/types/overview";
import type {
  HeatmapCell,
  HeatmapData,
  HistogramData,
  KpiData,
  LatencyChartData,
  LiveLogData,
  LiveLogLine,
  RegionMapData,
  SlowestData,
  TimelineData,
  TimelineIncident,
  WidgetDataMap,
} from "@/types/widgetData";
import { LOGS_ANCHOR, queryLogs } from "./logsServer";
import { buildMonitorDetail, buildResponseHistory } from "./monitorDetail";
import { monitorStore } from "./monitorStore";
import { hashString, seeded } from "./random";

const HISTORY_WINDOWS: Record<DashboardRange, { range: TimeRange; take: number }> = {
  "15m": { range: "1h", take: 15 },
  "1h": { range: "1h", take: 60 },
  "24h": { range: "24h", take: 288 },
  "7d": { range: "7d", take: 168 },
  "30d": { range: "30d", take: 180 },
};

const HEATMAP_CELLS: Record<DashboardRange, number> = { "15m": 30, "1h": 60, "24h": 48, "7d": 84, "30d": 90 };

const HISTOGRAM_SAMPLES: Record<DashboardRange, number> = {
  "15m": 160,
  "1h": 480,
  "24h": 1600,
  "7d": 2400,
  "30d": 3000,
};

const HISTOGRAM_BINS = 24;

const REGION_FACTORS: Record<RegionCode, number> = { BOM: 1.32, FRA: 1, IAD: 0.86, SIN: 1.18, SFO: 0.94 };

const LOG_STATUSES: Record<LogFilter, CheckStatus[]> = {
  all: [],
  issues: ["degraded", "down"],
  failures: ["down"],
};

const SPARK_POINTS = 24;

function selectMonitors(monitorIds: string[]) {
  const monitors = monitorStore.list();
  if (monitorIds.length === 0) return monitors.filter((monitor) => monitor.status !== "paused");
  return monitorIds.flatMap((id) => monitors.find((monitor) => monitor.id === id) ?? []);
}

function mean(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function present(values: (number | null)[]) {
  return values.filter((value) => value !== null);
}

function worstStatus(statuses: MonitorStatus[]): MonitorStatus {
  return statuses.reduce<MonitorStatus>(
    (worst, status) => (STATUS_RANK[status] < STATUS_RANK[worst] ? status : worst),
    "up",
  );
}

function sliceHistory(monitor: Monitor, range: DashboardRange): ResponseHistory {
  const { range: historyRange, take } = HISTORY_WINDOWS[range];
  const history = buildResponseHistory(monitor, historyRange);
  return {
    ...history,
    timestamps: history.timestamps.slice(-take),
    p50: history.p50.slice(-take),
    p95: history.p95.slice(-take),
  };
}

function metricValues(history: ResponseHistory, metric: LatencyMetric) {
  const scale = (values: (number | null)[], factor: number) =>
    values.map((value) => (value === null ? null : Math.round(value * factor)));
  if (metric === "p50") return history.p50;
  if (metric === "p95") return history.p95;
  if (metric === "p99") return scale(history.p95, 1.35);
  return scale(history.p50, 1.12);
}

function combine(seriesValues: (number | null)[][], aggregation: Exclude<Aggregation, "split">) {
  const length = seriesValues[0]?.length ?? 0;
  return Array.from({ length }, (_, index) => {
    const values = present(seriesValues.map((values) => values[index]));
    if (values.length === 0) return null;
    return Math.round(aggregation === "max" ? Math.max(...values) : mean(values));
  });
}

function downsample(values: number[], points: number) {
  if (values.length <= points) return values;
  const size = values.length / points;
  return Array.from({ length: points }, (_, index) =>
    mean(values.slice(Math.floor(index * size), Math.floor((index + 1) * size))),
  );
}

function rangeUptime(monitor: Monitor, range: DashboardRange) {
  const { uptime24h: day, uptime30d: month } = monitor;
  if (range === "30d") return month;
  if (range === "7d") return day === null || month === null ? day : (day + month * 3) / 4;
  return day;
}

function buildLatencyChart(config: LatencyChartConfig, range: DashboardRange): LatencyChartData {
  const monitors = selectMonitors(config.monitorIds).slice(0, MAX_CHART_MONITORS);
  const histories = monitors.map((monitor) => sliceHistory(monitor, range));
  const timestamps = histories[0]?.timestamps ?? [];
  const series = histories.map((history, index) => ({
    id: monitors[index].id,
    label: monitors[index].name,
    values: metricValues(history, config.metric),
  }));
  if (config.aggregation === "split") return { timestamps, series };
  return {
    timestamps,
    series: [
      {
        id: config.aggregation,
        label: `${config.aggregation === "max" ? "Worst" : "Average"} ${config.metric}`,
        values: combine(
          series.map((item) => item.values),
          config.aggregation,
        ),
      },
    ],
  };
}

function latencyKpi(monitors: Monitor[], config: KpiConfig, range: DashboardRange, random: () => number): KpiData {
  const metric = config.stat === "p95" ? "p95" : "avg";
  const values = present(
    combine(
      monitors.map((monitor) => metricValues(sliceHistory(monitor, range), metric)),
      config.aggregation,
    ),
  );
  const value = Math.round(mean(values));
  return { value, previous: Math.round(value * (0.88 + random() * 0.16)), spark: downsample(values, SPARK_POINTS) };
}

function uptimeKpi(monitors: Monitor[], config: KpiConfig, range: DashboardRange, random: () => number): KpiData {
  const uptimes = present(monitors.map((monitor) => rangeUptime(monitor, range)));
  const value = uptimes.length === 0 ? 100 : config.aggregation === "max" ? Math.min(...uptimes) : mean(uptimes);
  const spark = Array.from({ length: SPARK_POINTS }, (_, index) =>
    index === SPARK_POINTS - 1 ? value : Math.min(100, value + (random() - 0.35) * 0.08),
  );
  return { value, previous: Math.min(100, value + (random() - 0.6) * 0.06), spark };
}

function incidentsKpi(monitors: Monitor[], range: DashboardRange, random: () => number): KpiData {
  const end = Date.now();
  const start = end - RANGE_MS[range];
  const bucketMs = RANGE_MS[range] / SPARK_POINTS;
  const incidents = monitors.flatMap((monitor) => incidentsInRange(monitor, start, end));
  const spark = Array.from({ length: SPARK_POINTS }, () => 0);
  for (const incident of incidents) {
    spark[Math.max(0, Math.min(SPARK_POINTS - 1, Math.floor((incident.startedAt - start) / bucketMs)))]++;
  }
  return { value: incidents.length, previous: Math.max(0, incidents.length + Math.round(random() * 3) - 1), spark };
}

function buildKpi(config: KpiConfig, range: DashboardRange): KpiData {
  const monitors = selectMonitors(config.monitorIds);
  const random = seeded(hashString(`${config.stat}${range}${config.monitorIds.join()}`));
  if (config.stat === "uptime") return uptimeKpi(monitors, config, range, random);
  if (config.stat === "incidents") return incidentsKpi(monitors, range, random);
  return latencyKpi(monitors, config, range, random);
}

function heatmapCell(monitor: Monitor, at: number, stepMs: number, badRate: number, roll: number): HeatmapCell {
  if (monitor.status === "paused" && at >= monitor.statusSince) return "paused";
  if (monitor.status !== "up" && monitor.status !== "paused" && at + stepMs >= monitor.statusSince) {
    return monitor.status;
  }
  if (roll < badRate * 0.25) return "down";
  return roll < badRate ? "degraded" : "up";
}

function buildHeatmap(config: HeatmapConfig, range: DashboardRange): HeatmapData {
  const count = HEATMAP_CELLS[range];
  const stepMs = RANGE_MS[range] / count;
  const start = Date.now() - count * stepMs;
  const rows = selectMonitors(config.monitorIds).map((monitor) => {
    const random = seeded(hashString(`${monitor.id}${range}`));
    const uptime = rangeUptime(monitor, range) ?? 100;
    const badRate = Math.min(0.08, (100 - uptime) * 0.12 + 0.004);
    return {
      monitorId: monitor.id,
      name: monitor.name,
      uptime,
      cells: Array.from({ length: count }, (_, index) =>
        heatmapCell(monitor, start + index * stepMs, stepMs, badRate, random()),
      ),
    };
  });
  rows.sort((a, b) => (config.sort === "name" ? a.name.localeCompare(b.name) : a.uptime - b.uptime));
  return { start, stepMs, rows };
}

function gaussian(random: () => number) {
  return Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
}

function buildHistogram(config: HistogramConfig, range: DashboardRange): HistogramData {
  const monitors = selectMonitors(config.monitorIds).filter((monitor) => monitor.status !== "paused");
  const perMonitor = Math.max(20, Math.round(HISTOGRAM_SAMPLES[range] / Math.max(1, monitors.length)));
  const samples = monitors.flatMap((monitor) => {
    const random = seeded(hashString(`${monitor.id}${range}hist`));
    const base = monitor.latencyMs ?? 260;
    return Array.from({ length: perMonitor }, () => Math.round(base * Math.exp(gaussian(random) * 0.3)));
  });
  const low = Math.max(1, percentile(samples, 0.005));
  const ratio = Math.max(1.01, (percentile(samples, 0.995) / low) ** (1 / HISTOGRAM_BINS));
  const bins = Array.from({ length: HISTOGRAM_BINS }, (_, index) => ({
    start: Math.round(low * ratio ** index),
    end: Math.round(low * ratio ** (index + 1)),
    count: 0,
  }));
  for (const sample of samples) {
    const index = Math.floor(Math.log(Math.max(sample, 1) / low) / Math.log(ratio));
    bins[Math.max(0, Math.min(HISTOGRAM_BINS - 1, index))].count++;
  }
  return { bins, p50: percentile(samples, 0.5), p95: percentile(samples, 0.95), total: samples.length };
}

function incidentsInRange(monitor: Monitor, start: number, end: number): TimelineIncident[] {
  return buildMonitorDetail(monitor).incidents.filter(
    (incident) => incident.startedAt <= end && (incident.resolvedAt ?? end) >= start,
  );
}

function buildTimeline(config: TimelineConfig, range: DashboardRange): TimelineData {
  const end = Date.now();
  const start = end - RANGE_MS[range];
  const lanes = selectMonitors(config.monitorIds).map((monitor) => ({
    monitorId: monitor.id,
    name: monitor.name,
    incidents: incidentsInRange(monitor, start, end),
  }));
  const resolved = lanes
    .flatMap((lane) => lane.incidents)
    .filter((incident) => incident.resolvedAt !== null)
    .sort((a, b) => b.startedAt - a.startedAt);
  resolved.forEach((incident, index) => {
    incident.id = `INC-${41 - index}`;
  });
  return { start, end, lanes };
}

function regionValue(p95: number, metric: RegionMapConfig["metric"], status: MonitorStatus, random: () => number) {
  if (metric === "uptime")
    return status === "down" ? 97.2 + random() : status === "degraded" ? 99.4 : 99.9 + random() * 0.1;
  return Math.round(metric === "avg" ? p95 / 2.1 : p95);
}

function buildRegionMap(config: RegionMapConfig, range: DashboardRange): RegionMapData {
  const monitors = selectMonitors(config.monitorIds).filter((monitor) => monitor.status !== "paused");
  const base = mean(monitors.map((monitor) => Math.min(monitor.latencyMs ?? 300, 600)));
  const tiles = REGIONS.map(({ code, city }) => {
    const random = seeded(hashString(`${code}${range}${config.monitorIds.join()}`));
    const statuses = monitors.map(
      (monitor) =>
        monitor.regions.find((region) => region.code === code)?.status ??
        (monitor.status === "degraded" ? "degraded" : "up"),
    );
    const status = worstStatus(statuses);
    const p95 = base * REGION_FACTORS[code] * 2.1 * (0.9 + random() * 0.2) * (status === "degraded" ? 1.6 : 1);
    return { code, city, status, value: regionValue(p95, config.metric, status, random), monitors: monitors.length };
  });
  return { tiles };
}

function buildSlowest(config: SlowestConfig, range: DashboardRange): SlowestData {
  const rows = selectMonitors(config.monitorIds)
    .filter((monitor) => monitor.status !== "paused")
    .map((monitor) => ({
      monitorId: monitor.id,
      name: monitor.name,
      url: monitor.url,
      status: monitor.status,
      valueMs: Math.round(mean(present(metricValues(sliceHistory(monitor, range), config.metric)))),
    }));
  return { rows: rows.sort((a, b) => b.valueMs - a.valueMs).slice(0, config.limit) };
}

function toLogLine(result: CheckResult, shiftMs: number): LiveLogLine {
  const { id, ts, region, status, monitorName, latencyMs, statusCode } = result;
  return { id, ts: ts + shiftMs, region, status, monitorName, latencyMs, statusCode };
}

function buildLiveLog(config: LiveLogConfig): LiveLogData {
  const page = queryLogs(
    {
      query: "",
      range: "1h",
      window: null,
      statuses: LOG_STATUSES[config.statusFilter],
      regions: [],
      monitors: config.monitorIds,
      codes: [],
      groupBy: "none",
      sort: { key: "ts", isDescending: true },
    },
    0,
    config.maxLines,
  );
  const shiftMs = Date.now() - LOGS_ANCHOR;
  return { lines: page.items.map((item) => toLogLine(item, shiftMs)) };
}

export function mockLiveLine(config: LiveLogConfig, sequence: number): LiveLogLine | null {
  const random = seeded(sequence);
  const monitors = selectMonitors(config.monitorIds).filter((monitor) => monitor.status !== "paused");
  const monitor = monitors[Math.floor(random() * monitors.length)];
  if (!monitor) return null;
  const region = monitor.regions[Math.floor(random() * monitor.regions.length)];
  const isDown = region.status === "down" || random() < 0.01;
  const latencyMs = isDown ? DEFAULT_TIMEOUT_MS : Math.round((monitor.latencyMs ?? 260) * (0.7 + random() * 0.6));
  const status: CheckStatus = isDown ? "down" : latencyMs > LATENCY_THRESHOLD_MS ? "degraded" : "up";
  const allowed = LOG_STATUSES[config.statusFilter];
  if (allowed.length > 0 && !allowed.includes(status)) return null;
  return {
    id: `live_${sequence}`,
    ts: Date.now(),
    region: region.code,
    status,
    monitorName: monitor.name,
    latencyMs,
    statusCode: isDown ? null : 200,
  };
}

export function buildWidgetData(widget: DashboardWidget, dashboardRange: DashboardRange): WidgetDataMap[WidgetType] {
  const range = widgetRange(widget, dashboardRange);
  switch (widget.type) {
    case "latency_chart":
      return buildLatencyChart(readConfig(latencyChartConfigSchema, widget), range);
    case "kpi":
      return buildKpi(readConfig(kpiConfigSchema, widget), range);
    case "heatmap":
      return buildHeatmap(readConfig(heatmapConfigSchema, widget), range);
    case "histogram":
      return buildHistogram(readConfig(histogramConfigSchema, widget), range);
    case "incident_timeline":
      return buildTimeline(readConfig(timelineConfigSchema, widget), range);
    case "region_map":
      return buildRegionMap(readConfig(regionMapConfigSchema, widget), range);
    case "slowest":
      return buildSlowest(readConfig(slowestConfigSchema, widget), range);
    case "live_log":
      return buildLiveLog(readConfig(liveLogConfigSchema, widget));
    case "text":
      return null;
  }
}
