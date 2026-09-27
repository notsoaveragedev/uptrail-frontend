import type { DashboardRange, DashboardWidget, WidgetType } from "@/types/dashboard";
import type {
  HeatmapData,
  HistogramData,
  KpiData,
  LatencyChartData,
  LiveLogData,
  RegionMapData,
  SlowestData,
  TimelineData,
  WidgetDataMap,
} from "@/types/widgetData";
import { csvRow } from "./csv";

type Cell = string | number | null;

function iso(ms: number) {
  return new Date(ms).toISOString();
}

export async function exportRows<Type extends WidgetType>(
  widget: DashboardWidget,
  range: DashboardRange,
  toRows: (data: WidgetDataMap[Type]) => Cell[][],
) {
  const { fetchWidgetData } = await import("@/api/widgetData");
  const data = await fetchWidgetData<Type>(widget, range);
  return toRows(data).map(csvRow).join("\n");
}

export function latencyRows({ timestamps, series }: LatencyChartData): Cell[][] {
  return [
    ["timestamp", ...series.map((item) => `${item.label} (ms)`)],
    ...timestamps.map((timestamp, index) => [iso(timestamp * 1000), ...series.map((item) => item.values[index])]),
  ];
}

export function kpiRows(stat: string) {
  return ({ value, previous }: KpiData): Cell[][] => [
    ["stat", "value", "previous"],
    [stat, value, previous],
  ];
}

export function heatmapRows({ start, stepMs, rows }: HeatmapData): Cell[][] {
  return [
    ["monitor", "bucket_start", "status"],
    ...rows.flatMap((row) => row.cells.map((cell, index) => [row.name, iso(start + index * stepMs), cell])),
  ];
}

export function histogramRows({ bins }: HistogramData): Cell[][] {
  return [["from_ms", "to_ms", "checks"], ...bins.map((bin) => [bin.start, bin.end, bin.count])];
}

export function timelineRows({ lanes }: TimelineData): Cell[][] {
  return [
    ["monitor", "incident", "severity", "title", "started_at", "resolved_at"],
    ...lanes.flatMap((lane) =>
      lane.incidents.map((incident) => [
        lane.name,
        incident.id,
        incident.severity,
        incident.title,
        iso(incident.startedAt),
        incident.resolvedAt === null ? null : iso(incident.resolvedAt),
      ]),
    ),
  ];
}

export function regionRows({ tiles }: RegionMapData): Cell[][] {
  return [
    ["region", "city", "status", "value"],
    ...tiles.map((tile) => [tile.code, tile.city, tile.status, tile.value]),
  ];
}

export function slowestRows({ rows }: SlowestData): Cell[][] {
  return [
    ["rank", "monitor", "url", "status", "latency_ms"],
    ...rows.map((row, index) => [index + 1, row.name, row.url, row.status, row.valueMs]),
  ];
}

export function liveLogRows({ lines }: LiveLogData): Cell[][] {
  return [
    ["time", "region", "monitor", "status", "status_code", "latency_ms"],
    ...lines.map((line) => [iso(line.ts), line.region, line.monitorName, line.status, line.statusCode, line.latencyMs]),
  ];
}

export function textCsv(markdown: string) {
  return [csvRow(["markdown"]), csvRow([markdown])].join("\n");
}
