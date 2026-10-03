import type { Dashboard, DashboardLayouts, DashboardTemplate, DashboardWidget } from "@/types/dashboard";
import { HOUR_MS } from "@/lib/dates";

type Box = [x: number, y: number, w: number, h: number];

type Placement = { widget: DashboardWidget; lg: Box; md: Box; sm: Box };

function layoutsFrom(placements: Placement[]): DashboardLayouts {
  const items = (breakpoint: "lg" | "md" | "sm") =>
    placements.map(({ widget, [breakpoint]: [x, y, w, h] }) => ({ i: widget.id, x, y, w, h }));
  return { lg: items("lg"), md: items("md"), sm: items("sm") };
}

function board(placements: Placement[]) {
  return { widgets: placements.map((placement) => placement.widget), layouts: layoutsFrom(placements) };
}

function widget(id: string, type: DashboardWidget["type"], title: string, config: Record<string, unknown>) {
  return { id, type, title, config };
}

const SHOPNEST_CORE = ["mon_checkout", "mon_payments", "mon_cart_service", "mon_storefront"];

const SHOPNEST_ALL = [
  ...SHOPNEST_CORE,
  "mon_inventory_api",
  "mon_shipping_rates_api",
  "mon_order_events",
  "mon_promo_engine",
  "mon_customer_portal",
];

const PIXELCRAFT_API = ["mon_public_api", "mon_graphql_gateway", "mon_search", "mon_auth", "mon_billing_api"];

const PIXELCRAFT_ALL = [...PIXELCRAFT_API, "mon_asset_uploader", "mon_render_queue", "mon_webhooks_relay"];

const BLUEPEAK_ALL = [
  "mon_marketing",
  "mon_client_portal",
  "mon_booking_form",
  "mon_admin",
  "mon_blog",
  "mon_recommendations_api",
];

function checkoutBoard(ids: { core: string[]; all: string[] }) {
  return board([
    {
      widget: widget("w_co_uptime", "kpi", "Uptime", {
        monitorIds: ids.core,
        stat: "uptime",
        warn: 99.95,
        critical: 99.5,
      }),
      lg: [0, 0, 3, 3],
      md: [0, 0, 4, 3],
      sm: [0, 0, 2, 3],
    },
    {
      widget: widget("w_co_p95", "kpi", "p95 latency", { monitorIds: ids.core, stat: "p95", warn: 600, critical: 900 }),
      lg: [3, 0, 3, 3],
      md: [4, 0, 4, 3],
      sm: [2, 0, 2, 3],
    },
    {
      widget: widget("w_co_avg", "kpi", "Avg latency", { monitorIds: ids.core, stat: "avg_latency" }),
      lg: [6, 0, 3, 3],
      md: [0, 3, 4, 3],
      sm: [0, 3, 2, 3],
    },
    {
      widget: widget("w_co_incidents", "kpi", "Incidents", { monitorIds: ids.all, stat: "incidents" }),
      lg: [9, 0, 3, 3],
      md: [4, 3, 4, 3],
      sm: [2, 3, 2, 3],
    },
    {
      widget: widget("w_co_latency", "latency_chart", "Checkout path latency", {
        monitorIds: ids.core,
        metric: "p95",
        warn: 500,
        critical: 800,
      }),
      lg: [0, 3, 8, 7],
      md: [0, 6, 8, 7],
      sm: [0, 6, 4, 7],
    },
    {
      widget: widget("w_co_slowest", "slowest", "Slowest endpoints", { monitorIds: ids.all, limit: 5 }),
      lg: [8, 3, 4, 7],
      md: [0, 13, 8, 7],
      sm: [0, 13, 4, 7],
    },
    {
      widget: widget("w_co_heatmap", "heatmap", "Status heatmap", { monitorIds: ids.all, sort: "worst" }),
      lg: [0, 10, 12, 6],
      md: [0, 20, 8, 6],
      sm: [0, 20, 4, 6],
    },
  ]);
}

function apiLatencyBoard(ids: { api: string[]; all: string[] }) {
  return board([
    {
      widget: widget("w_api_latency", "latency_chart", "p95 by service", {
        monitorIds: ids.api,
        metric: "p95",
        critical: 800,
      }),
      lg: [0, 0, 8, 7],
      md: [0, 0, 8, 7],
      sm: [0, 0, 4, 7],
    },
    {
      widget: widget("w_api_regions", "region_map", "Regions", { monitorIds: ids.api, metric: "p95", critical: 900 }),
      lg: [8, 0, 4, 7],
      md: [0, 7, 4, 7],
      sm: [0, 7, 4, 7],
    },
    {
      widget: widget("w_api_histogram", "histogram", "Latency distribution", { monitorIds: ids.api }),
      lg: [0, 7, 4, 8],
      md: [4, 7, 4, 7],
      sm: [0, 14, 4, 6],
    },
    {
      widget: widget("w_api_log", "live_log", "Live checks", {
        monitorIds: ids.all,
        statusFilter: "all",
        maxLines: 50,
      }),
      lg: [4, 7, 8, 8],
      md: [0, 14, 8, 8],
      sm: [0, 20, 4, 8],
    },
  ]);
}

const STATUS_NOTE = [
  "## Maintenance",
  "DB migration for **Client portal** tomorrow at `02:00 IST`, about 20 minutes.",
  "",
  "- Status page: [status.bluepeak.co](https://status.bluepeak.co)",
  "- Escalations go to `#bluepeak-oncall`",
].join("\n");

function statusBoard(ids: { all: string[] }, markdown: string) {
  return board([
    {
      widget: widget("w_st_uptime", "kpi", "Uptime", { monitorIds: ids.all, stat: "uptime", aggregation: "avg" }),
      lg: [0, 0, 4, 3],
      md: [0, 0, 4, 3],
      sm: [0, 0, 2, 3],
    },
    {
      widget: widget("w_st_worst", "kpi", "Worst uptime", { monitorIds: ids.all, stat: "uptime", aggregation: "max" }),
      lg: [4, 0, 4, 3],
      md: [4, 0, 4, 3],
      sm: [2, 0, 2, 3],
    },
    {
      widget: widget("w_st_incidents", "kpi", "Incidents", { monitorIds: ids.all, stat: "incidents" }),
      lg: [8, 0, 4, 3],
      md: [0, 3, 8, 3],
      sm: [0, 3, 4, 3],
    },
    {
      widget: widget("w_st_heatmap", "heatmap", "Status heatmap", { monitorIds: ids.all, sort: "worst" }),
      lg: [0, 3, 12, 6],
      md: [0, 6, 8, 6],
      sm: [0, 6, 4, 6],
    },
    {
      widget: widget("w_st_timeline", "incident_timeline", "Incidents", { monitorIds: ids.all, rangeOverride: "30d" }),
      lg: [0, 9, 8, 6],
      md: [0, 12, 8, 6],
      sm: [0, 12, 4, 6],
    },
    {
      widget: widget("w_st_note", "text", "Notes", { markdown }),
      lg: [8, 9, 4, 6],
      md: [0, 18, 8, 4],
      sm: [0, 18, 4, 5],
    },
  ]);
}

export const DASHBOARD_SEEDS: Dashboard[] = [
  {
    id: "dash_checkout",
    name: "Checkout health",
    description: "Payment path monitors for on-call.",
    project: "shopnest",
    ...checkoutBoard({ core: SHOPNEST_CORE, all: SHOPNEST_ALL }),
    timeRange: "24h",
    refreshSec: 60,
    version: 1,
    updatedBy: "Arjun R.",
    updatedAt: Date.now() - 2 * HOUR_MS,
  },
  {
    id: "dash_api_latency",
    name: "API latency",
    description: "Public and internal API response times across regions.",
    project: "pixelcraft",
    ...apiLatencyBoard({ api: PIXELCRAFT_API, all: PIXELCRAFT_ALL }),
    timeRange: "24h",
    refreshSec: 30,
    version: 1,
    updatedBy: "Meera I.",
    updatedAt: Date.now() - 12 * 60_000,
  },
  {
    id: "dash_status",
    name: "Status overview",
    description: "Client-facing sites at a glance, for the weekly review.",
    project: "bluepeak",
    ...statusBoard({ all: BLUEPEAK_ALL }, STATUS_NOTE),
    timeRange: "7d",
    refreshSec: null,
    version: 1,
    updatedBy: "Kabir S.",
    updatedAt: Date.now() - 26 * HOUR_MS,
  },
];

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: "service_health",
    name: "Service health",
    description: "Uptime and latency KPIs, a latency chart, the slowest endpoints and a status heatmap.",
    ...checkoutBoard({ core: [], all: [] }),
  },
  {
    id: "api_latency",
    name: "API latency",
    description: "p95 by service, a latency histogram, the region map and a live check log.",
    ...apiLatencyBoard({ api: [], all: [] }),
  },
  {
    id: "status_overview",
    name: "Status overview",
    description: "Uptime KPIs, a status heatmap, the incident timeline and a notes panel.",
    ...statusBoard(
      { all: [] },
      "## Notes\nAdd on-call details, runbook links or maintenance windows here.\n\n- Runbooks: [docs](https://docs.uptrail.dev)",
    ),
  },
];
