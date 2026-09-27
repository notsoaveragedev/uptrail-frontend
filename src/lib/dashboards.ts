import { z } from "zod";
import { dashboardStore } from "@/mocks/dashboardStore";
import { DASHBOARD_TEMPLATES } from "@/mocks/dashboards";
import { currentUser } from "@/mocks/workspace";
import type { Monitor } from "@/types/monitor";
import type {
  Breakpoint,
  Dashboard,
  DashboardLayouts,
  DashboardRange,
  DashboardTemplate,
  DashboardWidget,
  LayoutItem,
  WidgetType,
} from "@/types/dashboard";
import {
  addItem,
  BREAKPOINTS,
  compact,
  GRID_COLS,
  insertItem,
  layoutHeight,
  removeItem,
  scaleLayout,
  type Layout,
} from "./gridLayout";
import { formatAgo } from "./format";
import { PROJECT_OPTIONS } from "./monitors";
import { readList } from "./searchParams";
import { MAX_CHART_MONITORS, widgetTitleSchema } from "./widgetConfig";
import { WIDGET_TYPES, WIDGETS } from "./widgets";

export const DASHBOARD_RANGES: DashboardRange[] = ["15m", "1h", "24h", "7d", "30d"];

export const REFRESH_OPTIONS = [
  { value: "off", label: "Off", seconds: null },
  { value: "30s", label: "30s", seconds: 30 },
  { value: "1m", label: "1m", seconds: 60 },
  { value: "5m", label: "5m", seconds: 300 },
] as const;

export type RefreshValue = (typeof REFRESH_OPTIONS)[number]["value"];

export const REFRESH_VALUES = REFRESH_OPTIONS.map((option) => option.value);

export const TV_REFRESH_MS = 30_000;

export const TV_IDLE_MS = 3000;

export const BLANK_TEMPLATE_ID = "blank";

export const BREAKPOINT_OPTIONS: { value: Breakpoint; label: string; width: string }[] = [
  { value: "lg", label: "Desktop", width: "100%" },
  { value: "md", label: "Tablet", width: "48rem" },
  { value: "sm", label: "Mobile", width: "24.375rem" },
];

export function tvRotation(params: URLSearchParams, dashboardId: string) {
  const ids = readList(params, "rotate");
  const every = Number(params.get("every"));
  return {
    ids: ids.length > 0 ? ids : [dashboardId],
    everySec: Number.isFinite(every) && every >= 10 ? Math.min(every, 3600) : 60,
  };
}

export function refreshValue(seconds: number | null): RefreshValue {
  return REFRESH_OPTIONS.find((option) => option.seconds === seconds)?.value ?? "off";
}

export function refreshSeconds(value: RefreshValue) {
  return REFRESH_OPTIONS.find((option) => option.value === value)?.seconds ?? null;
}

function randomId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export function newWidgetId() {
  return randomId("w");
}

type NewDashboardValues = { name: string; project: string };

function emptyLayouts(): DashboardLayouts {
  return { lg: [], md: [], sm: [] };
}

export function blankDashboard({ name, project }: NewDashboardValues): Dashboard {
  return {
    id: randomId("dash"),
    name,
    description: "",
    project,
    layouts: emptyLayouts(),
    widgets: [],
    timeRange: "24h",
    refreshSec: null,
    version: 1,
    updatedBy: currentUser.name,
    updatedAt: Date.now(),
  };
}

function scopeToMonitors(widget: DashboardWidget, monitorIds: string[]): DashboardWidget {
  const current = widget.config.monitorIds;
  if (!Array.isArray(current) || current.length > 0 || monitorIds.length === 0) return widget;
  const limit = widget.type === "latency_chart" ? MAX_CHART_MONITORS : monitorIds.length;
  return { ...widget, config: { ...widget.config, monitorIds: monitorIds.slice(0, limit) } };
}

export function fromTemplate(template: DashboardTemplate, values: NewDashboardValues, monitorIds: string[] = []) {
  return {
    ...blankDashboard(values),
    description: template.description,
    widgets: structuredClone(template.widgets).map((widget) => scopeToMonitors(widget, monitorIds)),
    layouts: structuredClone(template.layouts),
  };
}

export const START_OPTIONS: DashboardTemplate[] = [
  {
    id: BLANK_TEMPLATE_ID,
    name: "Blank",
    description: "An empty canvas. Add widgets one at a time.",
    layouts: emptyLayouts(),
    widgets: [],
  },
  ...DASHBOARD_TEMPLATES,
];

export function createFromStart(values: NewDashboardValues & { template: string }, monitors: Monitor[]) {
  const template = DASHBOARD_TEMPLATES.find((item) => item.id === values.template);
  if (!template) return blankDashboard(values);
  const monitorIds = monitors.filter((monitor) => monitor.project === values.project).map((monitor) => monitor.id);
  return fromTemplate(template, values, monitorIds);
}

export function cloneDashboard(dashboard: Dashboard): Dashboard {
  return {
    ...structuredClone(dashboard),
    id: randomId("dash"),
    name: `${dashboard.name} (copy)`,
    version: 1,
    updatedBy: currentUser.name,
    updatedAt: Date.now(),
  };
}

export function dashboardToJson(dashboard: Dashboard) {
  const { name, description, project, timeRange, refreshSec, widgets, layouts } = dashboard;
  return JSON.stringify({ name, description, project, timeRange, refreshSec, widgets, layouts }, null, 2);
}

function slugify(text: string, fallback: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || fallback
  );
}

export function dashboardFileName(dashboard: Dashboard) {
  return `${slugify(dashboard.name, "dashboard")}.json`;
}

export function widgetCsvFileName(widget: DashboardWidget) {
  return `${slugify(widget.title, widget.type)}.csv`;
}

export function layoutFor(dashboard: Dashboard, breakpoint: Breakpoint): Layout {
  const layout = dashboard.layouts[breakpoint] ?? [];
  const isComplete = dashboard.widgets.every((widget) => layout.some((item) => item.i === widget.id));
  if (isComplete || breakpoint === "lg") return layout;
  return scaleLayout(dashboard.layouts.lg, GRID_COLS[breakpoint]);
}

function mapLayouts(dashboard: Dashboard, update: (layout: Layout, breakpoint: Breakpoint) => Layout) {
  const layouts = emptyLayouts();
  for (const breakpoint of BREAKPOINTS) layouts[breakpoint] = update(layoutFor(dashboard, breakpoint), breakpoint);
  return layouts;
}

export function withLayout(dashboard: Dashboard, breakpoint: Breakpoint, layout: Layout): Dashboard {
  return { ...dashboard, layouts: { ...dashboard.layouts, [breakpoint]: layout } };
}

export function addWidget(dashboard: Dashboard, widget: DashboardWidget): Dashboard {
  const size = WIDGETS[widget.type].defaultSize;
  return {
    ...dashboard,
    widgets: [...dashboard.widgets, widget],
    layouts: mapLayouts(dashboard, (layout, breakpoint) => addItem(layout, widget.id, size, GRID_COLS[breakpoint])),
  };
}

export function duplicateWidget(dashboard: Dashboard, widgetId: string) {
  const source = dashboard.widgets.find((widget) => widget.id === widgetId);
  if (!source) return null;
  const copy = { ...structuredClone(source), id: newWidgetId(), title: `${source.title} (copy)` };
  const layouts = mapLayouts(dashboard, (layout, breakpoint) => {
    const item = layout.find((entry) => entry.i === widgetId);
    const size = item ? { w: item.w, h: item.h } : WIDGETS[source.type].defaultSize;
    return addItem(layout, copy.id, size, GRID_COLS[breakpoint]);
  });
  return { dashboard: { ...dashboard, widgets: [...dashboard.widgets, copy], layouts }, widget: copy };
}

export type RemovedWidget = {
  widget: DashboardWidget;
  index: number;
  items: Partial<Record<Breakpoint, LayoutItem>>;
};

export function removeWidget(dashboard: Dashboard, widgetId: string) {
  const index = dashboard.widgets.findIndex((widget) => widget.id === widgetId);
  if (index < 0) return null;

  const items: RemovedWidget["items"] = {};
  const layouts = mapLayouts(dashboard, (layout, breakpoint) => {
    items[breakpoint] = layout.find((item) => item.i === widgetId);
    return removeItem(layout, widgetId);
  });
  const removed: RemovedWidget = { widget: dashboard.widgets[index], index, items };
  return { dashboard: { ...dashboard, widgets: dashboard.widgets.filter((_, at) => at !== index), layouts }, removed };
}

export function restoreWidget(dashboard: Dashboard, { widget, index, items }: RemovedWidget): Dashboard {
  const widgets = [...dashboard.widgets];
  widgets.splice(index, 0, widget);
  const layouts = mapLayouts(dashboard, (layout, breakpoint) => {
    const item = items[breakpoint];
    if (!item) return addItem(layout, widget.id, WIDGETS[widget.type].defaultSize, GRID_COLS[breakpoint]);
    return insertItem(layout, item, GRID_COLS[breakpoint]);
  });
  return { ...dashboard, widgets, layouts };
}

export function replaceWidget(dashboard: Dashboard, next: DashboardWidget): Dashboard {
  return { ...dashboard, widgets: dashboard.widgets.map((widget) => (widget.id === next.id ? next : widget)) };
}

export function findWidget(dashboard: Dashboard, widgetId: string | null) {
  return dashboard.widgets.find((widget) => widget.id === widgetId) ?? null;
}

export function filterWidgetDefinitions(query: string) {
  const text = query.trim().toLowerCase();
  return Object.values(WIDGETS).filter((definition) =>
    `${definition.label} ${definition.description} ${definition.group}`.toLowerCase().includes(text),
  );
}

export function isWidgetValid(widget: DashboardWidget) {
  return (
    widgetTitleSchema.safeParse(widget.title).success &&
    WIDGETS[widget.type].configSchema.safeParse(widget.config).success
  );
}

export const newDashboardSchema = z.object({
  name: z.string().trim().min(1, "Name the dashboard.").max(60, "Keep the name under 60 characters."),
  project: z.string().min(1, "Pick a project."),
  template: z.string().default(BLANK_TEMPLATE_ID),
});

const DAY_MS = 86_400_000;

export function editedAgo(timestamp: number, now: number) {
  if (now - timestamp < DAY_MS) return formatAgo(timestamp, now);
  return `${Math.floor((now - timestamp) / DAY_MS)}d ago`;
}

function percentile(values: number[], ratio: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

export function dashboardStats(monitors: Monitor[], project: string) {
  const scoped = monitors.filter((monitor) => monitor.project === project);
  const uptimes = scoped.flatMap((monitor) => (monitor.uptime24h === null ? [] : [monitor.uptime24h]));
  const latencies = scoped.flatMap((monitor) => (monitor.latencyMs === null ? [] : [monitor.latencyMs]));
  return {
    uptime: uptimes.length ? uptimes.reduce((sum, value) => sum + value, 0) / uptimes.length : null,
    p95: percentile(latencies, 0.95),
    down: scoped.filter((monitor) => monitor.status === "down").length,
  };
}

export function listSummary(dashboards: Dashboard[]) {
  const projects = new Set(dashboards.map((dashboard) => dashboard.project)).size;
  const lastEdited = Math.max(0, ...dashboards.map((dashboard) => dashboard.updatedAt));
  return { count: dashboards.length, projects, lastEdited };
}

export const THUMBNAIL_SIZE = { width: 300, height: 100 };

const THUMBNAIL_PAD = 6;

const THUMBNAIL_GAP = 2;

export type ThumbnailBlock = {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function thumbnailBlocks(layout: Layout, widgets: DashboardWidget[]): ThumbnailBlock[] {
  const { width, height } = THUMBNAIL_SIZE;
  const rows = Math.max(layoutHeight(layout), 1);
  const colPitch = (width - THUMBNAIL_PAD * 2 + THUMBNAIL_GAP) / GRID_COLS.lg;
  const rowPitch = Math.min(colPitch * 0.55, (height - THUMBNAIL_PAD * 2 + THUMBNAIL_GAP) / rows);
  const offsetY = (height - rows * rowPitch + THUMBNAIL_GAP) / 2;

  return layout.flatMap((item) => {
    const widget = widgets.find((entry) => entry.id === item.i);
    if (!widget) return [];
    return [
      {
        id: item.i,
        type: widget.type,
        x: THUMBNAIL_PAD + item.x * colPitch,
        y: offsetY + item.y * rowPitch,
        width: item.w * colPitch - THUMBNAIL_GAP,
        height: item.h * rowPitch - THUMBNAIL_GAP,
      },
    ];
  });
}

const WIDGET_TYPE_ENUM = WIDGET_TYPES as [WidgetType, ...WidgetType[]];

const layoutItemSchema = z.object({
  i: z.string().min(1),
  x: z.int().min(0),
  y: z.int().min(0),
  w: z.int().min(1).max(GRID_COLS.lg),
  h: z.int().min(1).max(40),
});

const widgetSchema = z.object({
  id: z.string().min(1),
  type: z.enum(WIDGET_TYPE_ENUM, { error: (issue) => `unknown type ${JSON.stringify(issue.input)}` }),
  title: z.string().default(""),
  config: z.record(z.string(), z.unknown()).default({}),
});

const dashboardImportSchema = z
  .object({
    name: z.string().trim().min(1, "add a name"),
    description: z.string().default(""),
    project: z.string().default(PROJECT_OPTIONS[0].value),
    timeRange: z.enum(DASHBOARD_RANGES).default("24h"),
    refreshSec: z.int().positive().nullable().default(null),
    widgets: z.array(widgetSchema).max(40, "keep it under 40 widgets"),
    layouts: z.object({
      lg: z.array(layoutItemSchema),
      md: z.array(layoutItemSchema).optional(),
      sm: z.array(layoutItemSchema).optional(),
    }),
  })
  .superRefine((value, ctx) => {
    const ids = new Set(value.widgets.map((widget) => widget.id));
    value.layouts.lg.forEach((item, index) => {
      if (!ids.has(item.i)) {
        ctx.addIssue({ code: "custom", path: ["layouts", "lg", index, "i"], message: `no widget with id "${item.i}"` });
      }
    });
    value.widgets.forEach((widget, index) => {
      if (!value.layouts.lg.some((item) => item.i === widget.id)) {
        ctx.addIssue({ code: "custom", path: ["widgets", index, "id"], message: `"${widget.id}" has no lg position` });
      }
      const config = WIDGETS[widget.type].configSchema.safeParse(widget.config);
      if (config.success) return;
      for (const issue of config.error.issues) {
        ctx.addIssue({ code: "custom", path: ["widgets", index, "config", ...issue.path], message: issue.message });
      }
    });
  });

function issuePath(path: PropertyKey[]) {
  return path.reduce<string>((text, key) => {
    if (typeof key === "number") return `${text}[${key}]`;
    return text ? `${text}.${String(key)}` : String(key);
  }, "");
}

export type DashboardImport = { dashboard: Dashboard | null; errors: string[] };

export function parseDashboardJson(text: string): DashboardImport {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    return { dashboard: null, errors: [`JSON: ${error instanceof Error ? error.message : "couldn't parse the file"}`] };
  }

  const result = dashboardImportSchema.safeParse(json);
  if (!result.success) {
    return {
      dashboard: null,
      errors: result.error.issues.map((issue) => `${issuePath(issue.path) || "root"}: ${issue.message}`),
    };
  }

  const { layouts, ...rest } = result.data;
  const lg = compact(layouts.lg);
  return {
    dashboard: {
      ...blankDashboard(rest),
      ...rest,
      layouts: {
        lg,
        md: layouts.md ? compact(layouts.md) : scaleLayout(lg, GRID_COLS.md),
        sm: layouts.sm ? compact(layouts.sm) : scaleLayout(lg, GRID_COLS.sm),
      },
    },
    errors: [],
  };
}

export function simulateTeammateSave(dashboardId: string) {
  const current = dashboardStore.get(dashboardId);
  if (!current) return null;
  const saved = { ...current, version: current.version + 1, updatedBy: "Arjun R.", updatedAt: Date.now() - 180_000 };
  dashboardStore.upsert(saved);
  return saved;
}
