import { lazy, type ComponentType } from "react";
import {
  LuChartColumn,
  LuChartNoAxesGantt,
  LuChartSpline,
  LuGauge,
  LuGlobe,
  LuGrid3X3,
  LuListOrdered,
  LuScrollText,
  LuType,
} from "react-icons/lu";
import type {
  DashboardWidget,
  WidgetConfigProps,
  WidgetDefinition,
  WidgetGroup,
  WidgetProps,
  WidgetType,
} from "@/types/dashboard";
import { importWithReload } from "./lazyPage";
import {
  heatmapConfigSchema,
  histogramConfigSchema,
  kpiConfigSchema,
  latencyChartConfigSchema,
  liveLogConfigSchema,
  LOG_FILTER_LABELS,
  METRIC_LABELS,
  monitorCountText,
  readConfig,
  REGION_METRIC_LABELS,
  regionMapConfigSchema,
  slowestConfigSchema,
  textConfigSchema,
  timelineConfigSchema,
} from "./widgetConfig";
import {
  exportRows,
  heatmapRows,
  histogramRows,
  kpiRows,
  latencyRows,
  liveLogRows,
  regionRows,
  slowestRows,
  textCsv,
  timelineRows,
} from "./widgetCsv";
import { newId } from "./ids";

export { widgetRange } from "./widgetConfig";

export const WIDGET_GROUPS: WidgetGroup[] = ["Charts", "Stats", "Status", "Streams", "Content"];

function lazyNamed<Module, Props>(load: () => Promise<Module>, pick: (module: Module) => ComponentType<Props>) {
  return lazy(async () => ({ default: pick(await importWithReload(load)) }));
}

const loadConfigFields = () => import("@/components/widgets/config/TypeConfigFields");

function configFields(
  pick: (module: Awaited<ReturnType<typeof loadConfigFields>>) => ComponentType<WidgetConfigProps>,
) {
  return lazyNamed(loadConfigFields, pick);
}

function widgetView<Module>(load: () => Promise<Module>, pick: (module: Module) => ComponentType<WidgetProps>) {
  return lazyNamed(load, pick);
}

export const WIDGETS: Record<WidgetType, WidgetDefinition> = {
  latency_chart: {
    type: "latency_chart",
    label: "Latency chart",
    description: "Response time over time for up to 5 monitors.",
    group: "Charts",
    icon: LuChartSpline,
    defaultSize: { w: 6, h: 7 },
    minSize: { w: 4, h: 5 },
    defaultTitle: "Response time",
    defaultConfig: latencyChartConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/LatencyChartWidget"),
      (module) => module.LatencyChartWidget,
    ),
    ConfigFields: configFields((module) => module.LatencyChartConfigFields),
    configSchema: latencyChartConfigSchema,
    metaLine: (widget) => {
      const config = readConfig(latencyChartConfigSchema, widget);
      return `${METRIC_LABELS[config.metric]} · ${monitorCountText(config.monitorIds)}`;
    },
    exportCsv: (widget, range) => exportRows<"latency_chart">(widget, range, latencyRows),
  },
  histogram: {
    type: "histogram",
    label: "Latency histogram",
    description: "How response times are distributed, with p50 and p95.",
    group: "Charts",
    icon: LuChartColumn,
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    defaultTitle: "Latency distribution",
    defaultConfig: histogramConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/HistogramWidget"),
      (module) => module.HistogramWidget,
    ),
    ConfigFields: configFields((module) => module.HistogramConfigFields),
    configSchema: histogramConfigSchema,
    metaLine: (widget) => `latency · ${monitorCountText(readConfig(histogramConfigSchema, widget).monitorIds)}`,
    exportCsv: (widget, range) => exportRows<"histogram">(widget, range, histogramRows),
  },
  kpi: {
    type: "kpi",
    label: "KPI",
    description: "One number with its trend: uptime, latency or incidents.",
    group: "Stats",
    icon: LuGauge,
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 3 },
    defaultTitle: "Uptime",
    defaultConfig: kpiConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/KpiWidget"),
      (module) => module.KpiWidget,
    ),
    ConfigFields: configFields((module) => module.KpiConfigFields),
    configSchema: kpiConfigSchema,
    metaLine: (widget) => monitorCountText(readConfig(kpiConfigSchema, widget).monitorIds),
    exportCsv: (widget, range) => exportRows<"kpi">(widget, range, kpiRows(readConfig(kpiConfigSchema, widget).stat)),
  },
  slowest: {
    type: "slowest",
    label: "Slowest endpoints",
    description: "Monitors ranked by response time.",
    group: "Stats",
    icon: LuListOrdered,
    defaultSize: { w: 4, h: 7 },
    minSize: { w: 3, h: 5 },
    defaultTitle: "Slowest endpoints",
    defaultConfig: slowestConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/SlowestWidget"),
      (module) => module.SlowestWidget,
    ),
    ConfigFields: configFields((module) => module.SlowestConfigFields),
    configSchema: slowestConfigSchema,
    metaLine: (widget) => {
      const config = readConfig(slowestConfigSchema, widget);
      return `${METRIC_LABELS[config.metric]} · top ${config.limit}`;
    },
    exportCsv: (widget, range) => exportRows<"slowest">(widget, range, slowestRows),
  },
  heatmap: {
    type: "heatmap",
    label: "Status heatmap",
    description: "Every monitor's status over time, one row each.",
    group: "Status",
    icon: LuGrid3X3,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 6, h: 4 },
    defaultTitle: "Status heatmap",
    defaultConfig: heatmapConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/HeatmapWidget"),
      (module) => module.HeatmapWidget,
    ),
    ConfigFields: configFields((module) => module.HeatmapConfigFields),
    configSchema: heatmapConfigSchema,
    metaLine: (widget) => `status · ${monitorCountText(readConfig(heatmapConfigSchema, widget).monitorIds)}`,
    exportCsv: (widget, range) => exportRows<"heatmap">(widget, range, heatmapRows),
  },
  incident_timeline: {
    type: "incident_timeline",
    label: "Incident timeline",
    description: "Incidents per monitor, laid out on the time axis.",
    group: "Status",
    icon: LuChartNoAxesGantt,
    defaultSize: { w: 8, h: 5 },
    minSize: { w: 6, h: 4 },
    defaultTitle: "Incidents",
    defaultConfig: timelineConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/IncidentTimelineWidget"),
      (module) => module.IncidentTimelineWidget,
    ),
    ConfigFields: configFields((module) => module.TimelineConfigFields),
    configSchema: timelineConfigSchema,
    metaLine: (widget) => `incidents · ${monitorCountText(readConfig(timelineConfigSchema, widget).monitorIds)}`,
    exportCsv: (widget, range) => exportRows<"incident_timeline">(widget, range, timelineRows),
  },
  region_map: {
    type: "region_map",
    label: "Region map",
    description: "Status and latency from each check region.",
    group: "Status",
    icon: LuGlobe,
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 5 },
    defaultTitle: "Regions",
    defaultConfig: regionMapConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/RegionMapWidget"),
      (module) => module.RegionMapWidget,
    ),
    ConfigFields: configFields((module) => module.RegionMapConfigFields),
    configSchema: regionMapConfigSchema,
    metaLine: (widget) => `${REGION_METRIC_LABELS[readConfig(regionMapConfigSchema, widget).metric]} · 5 regions`,
    exportCsv: (widget, range) => exportRows<"region_map">(widget, range, regionRows),
  },
  live_log: {
    type: "live_log",
    label: "Live log",
    description: "Checks as they happen, newest first.",
    group: "Streams",
    icon: LuScrollText,
    defaultSize: { w: 6, h: 8 },
    minSize: { w: 4, h: 5 },
    defaultTitle: "Live checks",
    defaultConfig: liveLogConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/LiveLogWidget"),
      (module) => module.LiveLogWidget,
    ),
    ConfigFields: configFields((module) => module.LiveLogConfigFields),
    configSchema: liveLogConfigSchema,
    metaLine: (widget) => {
      const config = readConfig(liveLogConfigSchema, widget);
      return `${LOG_FILTER_LABELS[config.statusFilter].toLowerCase()} · ${config.maxLines} lines`;
    },
    exportCsv: (widget, range) => exportRows<"live_log">(widget, range, liveLogRows),
  },
  text: {
    type: "text",
    label: "Text",
    description: "Notes, runbook links and on-call details in Markdown.",
    group: "Content",
    icon: LuType,
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 },
    defaultTitle: "Notes",
    defaultConfig: textConfigSchema.parse({}),
    Component: widgetView(
      () => import("@/components/widgets/TextWidget"),
      (module) => module.TextWidget,
    ),
    ConfigFields: configFields((module) => module.TextConfigFields),
    configSchema: textConfigSchema,
    metaLine: () => "markdown",
    exportCsv: async (widget) => textCsv(readConfig(textConfigSchema, widget).markdown),
  },
};

export const WIDGET_TYPES = Object.keys(WIDGETS) as WidgetType[];

export function createWidget(type: WidgetType): DashboardWidget {
  const definition = WIDGETS[type];
  return {
    id: newId("w"),
    type,
    title: definition.defaultTitle,
    config: structuredClone(definition.defaultConfig),
  };
}
