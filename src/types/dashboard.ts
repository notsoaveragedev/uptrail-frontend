export type WidgetType =
  | "latency_chart"
  | "kpi"
  | "heatmap"
  | "histogram"
  | "incident_timeline"
  | "region_map"
  | "slowest"
  | "live_log"
  | "text";

export type Breakpoint = "lg" | "md" | "sm";

export type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DashboardLayouts = Record<Breakpoint, LayoutItem[]>;

export type DashboardWidget = {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, unknown>;
};

export type DashboardRange = "15m" | "1h" | "24h" | "7d" | "30d";

export type Dashboard = {
  id: string;
  name: string;
  description: string;
  project: string;
  layouts: DashboardLayouts;
  widgets: DashboardWidget[];
  timeRange: DashboardRange;
  refreshSec: number | null;
  version: number;
  updatedBy: string;
  updatedAt: number;
};

export type DashboardTemplate = {
  id: string;
  name: string;
  description: string;
  layouts: DashboardLayouts;
  widgets: DashboardWidget[];
};

export type WidgetGroup = "Charts" | "Stats" | "Status" | "Streams" | "Content";

export type WidgetSize = { w: number; h: number };

export type WidgetProps = {
  widget: DashboardWidget;
  range: DashboardRange;
  syncKey: string;
  isPreview?: boolean;
};

export type WidgetConfigProps = {
  widget: DashboardWidget;
  onChange: (widget: DashboardWidget) => void;
};

export type WidgetDefinition = {
  type: WidgetType;
  label: string;
  description: string;
  group: WidgetGroup;
  icon: import("react-icons").IconType;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  defaultTitle: string;
  defaultConfig: Record<string, unknown>;
  Component: import("react").LazyExoticComponent<import("react").ComponentType<WidgetProps>>;
  ConfigFields: import("react").LazyExoticComponent<import("react").ComponentType<WidgetConfigProps>>;
  configSchema: import("zod").ZodType<Record<string, unknown>>;
  metaLine: (widget: DashboardWidget) => string;
  exportCsv: (widget: DashboardWidget, range: DashboardRange) => Promise<string>;
};
