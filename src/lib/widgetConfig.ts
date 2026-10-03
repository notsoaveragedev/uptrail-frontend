import { z } from "zod";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";
import type { MonitorStatus } from "@/types/monitor";
import { LATENCY_THRESHOLD_MS, plural } from "./format";

export const LATENCY_METRICS = ["p50", "p95", "p99", "avg"] as const;
export type LatencyMetric = (typeof LATENCY_METRICS)[number];

export const AGGREGATIONS = ["split", "avg", "max"] as const;
export type Aggregation = (typeof AGGREGATIONS)[number];

export const OVERRIDE_RANGES = ["1h", "24h", "7d", "30d"] as const;

export const KPI_STATS = ["uptime", "avg_latency", "p95", "incidents"] as const;
export type KpiStat = (typeof KPI_STATS)[number];

export const HEATMAP_SORTS = ["worst", "name"] as const;

export const REGION_METRICS = ["p95", "avg", "uptime"] as const;
export type RegionMetric = (typeof REGION_METRICS)[number];

export const LOG_FILTERS = ["all", "issues", "failures"] as const;
export type LogFilter = (typeof LOG_FILTERS)[number];

export const SLOWEST_LIMITS = [5, 10] as const;

export const MAX_CHART_MONITORS = 5;

export const METRIC_LABELS: Record<LatencyMetric, string> = { p50: "p50", p95: "p95", p99: "p99", avg: "avg" };

export const AGGREGATION_LABELS: Record<Aggregation, string> = { split: "Per monitor", avg: "Average", max: "Worst" };

export const KPI_STAT_LABELS: Record<KpiStat, string> = {
  uptime: "Uptime",
  avg_latency: "Avg latency",
  p95: "p95 latency",
  incidents: "Incidents",
};

export const HEATMAP_SORT_LABELS: Record<(typeof HEATMAP_SORTS)[number], string> = {
  worst: "Worst first",
  name: "Name",
};

export const REGION_METRIC_LABELS: Record<RegionMetric, string> = { p95: "p95", avg: "avg", uptime: "uptime" };

export const LOG_FILTER_LABELS: Record<LogFilter, string> = {
  all: "All checks",
  issues: "Degraded and down",
  failures: "Failures only",
};

export const RANGE_MS: Record<DashboardRange, number> = {
  "15m": 15 * 60_000,
  "1h": 3_600_000,
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
};

export const DEFAULT_MARKDOWN = [
  "## On-call this week",
  "Primary **Meera Iyer**, secondary **Arjun Rao**.",
  "",
  "- Page SEV 1 in `#incident-war-room`",
  "- Runbooks live in [the wiki](https://docs.uptrail.dev/runbooks)",
].join("\n");

type Thresholds = { warn: number | null; critical: number | null };

const monitorIds = z.array(z.string()).default([]);
const rangeOverride = z.enum(OVERRIDE_RANGES).nullable().default(null);
const threshold = z.number().nonnegative("Use a positive number.").nullable();
const latencyThresholds = { warn: threshold.default(null), critical: threshold.default(LATENCY_THRESHOLD_MS) };

function checkThresholds(config: Thresholds, ctx: z.RefinementCtx, isHigherBad: boolean) {
  if (config.warn === null || config.critical === null) return;
  const isOrdered = isHigherBad ? config.warn < config.critical : config.warn > config.critical;
  if (isOrdered) return;
  ctx.addIssue({
    code: "custom",
    path: ["warn"],
    message: isHigherBad ? "Warn must be below critical." : "Warn must be above critical.",
  });
}

export const latencyChartConfigSchema = z
  .object({
    monitorIds: z.array(z.string()).max(MAX_CHART_MONITORS, "Pick up to 5 monitors.").default([]),
    metric: z.enum(LATENCY_METRICS).default("p95"),
    aggregation: z.enum(AGGREGATIONS).default("split"),
    rangeOverride,
    showLegend: z.boolean().default(true),
    ...latencyThresholds,
  })
  .superRefine((config, ctx) => checkThresholds(config, ctx, true));

export const kpiConfigSchema = z
  .object({
    monitorIds,
    stat: z.enum(KPI_STATS).default("uptime"),
    aggregation: z.enum(["avg", "max"]).default("avg"),
    rangeOverride,
    showSparkline: z.boolean().default(true),
    decimals: z.int().min(0, "Use 0 to 3.").max(3, "Use 0 to 3.").default(2),
    warn: threshold.default(null),
    critical: threshold.default(null),
  })
  .superRefine((config, ctx) => checkThresholds(config, ctx, config.stat !== "uptime"));

export const heatmapConfigSchema = z.object({
  monitorIds,
  sort: z.enum(HEATMAP_SORTS).default("worst"),
  rangeOverride,
});

export const histogramConfigSchema = z.object({ monitorIds, rangeOverride });

export const timelineConfigSchema = z.object({ monitorIds, rangeOverride });

export const regionMapConfigSchema = z
  .object({
    monitorIds,
    metric: z.enum(REGION_METRICS).default("p95"),
    rangeOverride,
    ...latencyThresholds,
  })
  .superRefine((config, ctx) => checkThresholds(config, ctx, config.metric !== "uptime"));

export const slowestConfigSchema = z
  .object({
    monitorIds,
    metric: z.enum(LATENCY_METRICS).default("p95"),
    limit: z.union([z.literal(5), z.literal(10)]).default(5),
    rangeOverride,
    ...latencyThresholds,
  })
  .superRefine((config, ctx) => checkThresholds(config, ctx, true));

export const liveLogConfigSchema = z.object({
  monitorIds,
  statusFilter: z.enum(LOG_FILTERS).default("all"),
  maxLines: z.int().min(10, "Show at least 10 lines.").max(200, "Show at most 200 lines.").default(50),
});

export const textConfigSchema = z.object({
  markdown: z.string().max(4000, "Keep it under 4,000 characters.").default(DEFAULT_MARKDOWN),
});

export const widgetTitleSchema = z.string().trim().min(1, "Add a title.").max(60, "Keep it under 60 characters.");

export type LatencyChartConfig = z.output<typeof latencyChartConfigSchema>;
export type KpiConfig = z.output<typeof kpiConfigSchema>;
export type HeatmapConfig = z.output<typeof heatmapConfigSchema>;
export type HistogramConfig = z.output<typeof histogramConfigSchema>;
export type TimelineConfig = z.output<typeof timelineConfigSchema>;
export type RegionMapConfig = z.output<typeof regionMapConfigSchema>;
export type SlowestConfig = z.output<typeof slowestConfigSchema>;
export type LiveLogConfig = z.output<typeof liveLogConfigSchema>;
export type TextConfig = z.output<typeof textConfigSchema>;

export function readConfig<Schema extends z.ZodType>(schema: Schema, widget: DashboardWidget): z.output<Schema> {
  return { ...(schema.parse({}) as object), ...widget.config } as z.output<Schema>;
}

export function configErrors(schema: z.ZodType, config: Record<string, unknown>) {
  const result = schema.safeParse(config);
  const errors: Record<string, string> = {};
  if (result.success) return errors;
  for (const issue of result.error.issues) errors[String(issue.path[0] ?? "")] ??= issue.message;
  return errors;
}

export function widgetRange(widget: DashboardWidget, range: DashboardRange): DashboardRange {
  const override = widget.config.rangeOverride;
  return OVERRIDE_RANGES.find((option) => option === override) ?? range;
}

export function thresholdStatus(value: number, thresholds: Thresholds, isHigherBad = true): MonitorStatus | null {
  const breaches = (limit: number | null) => limit !== null && (isHigherBad ? value >= limit : value <= limit);
  if (breaches(thresholds.critical)) return "down";
  return breaches(thresholds.warn) ? "degraded" : null;
}

export function monitorCountText(monitorIds: string[]) {
  if (monitorIds.length === 0) return "all monitors";
  return plural(monitorIds.length, "monitor");
}

export function configEditor<Schema extends z.ZodType<Record<string, unknown>>>(
  schema: Schema,
  widget: DashboardWidget,
  onChange: (widget: DashboardWidget) => void,
) {
  const titleResult = widgetTitleSchema.safeParse(widget.title);
  return {
    config: readConfig(schema, widget),
    errors: configErrors(schema, widget.config),
    title: widget.title,
    titleError: titleResult.success ? null : titleResult.error.issues[0].message,
    set: <Key extends keyof z.output<Schema> & string>(key: Key, value: z.output<Schema>[Key]) =>
      onChange({ ...widget, config: { ...widget.config, [key]: value } }),
    setTitle: (title: string) => onChange({ ...widget, title }),
  };
}

export type ConfigEditor<Schema extends z.ZodType<Record<string, unknown>>> = ReturnType<typeof configEditor<Schema>>;
