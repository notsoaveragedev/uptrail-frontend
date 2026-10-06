import type { MonitorStatus, RegionCode } from "@/types/monitor";
import type { TestResult } from "@/mocks/monitorTest";
import { incidentStore } from "@/mocks/incidentStore";
import { monitorStore } from "@/mocks/monitorStore";
import { MONITORS } from "@/mocks/monitors";
import { statusPageStore } from "@/mocks/statusPageStore";
import { buildStatusSnapshot } from "@/mocks/statusSnapshot";
import { STATUS_PAGES } from "@/mocks/statusPages";
import { statusTrail } from "./status";
import { BOARD_MONITORS, type BoardMonitor } from "./statusBoard";

export const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#alerts", label: "Alerts" },
  { href: "#status-pages", label: "Status pages" },
  { href: "#developers", label: "Developers" },
  { href: "#pricing", label: "Pricing" },
];

export const DEMO_EXAMPLES = ["https://shopnest.in", "https://api.pixelcraft.io/fail", "https://bluepeak.dev/timeout"];

export const DEMO_INPUT_ID = "demo-url";

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|\[)/;

export function withScheme(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function isPublicUrl(value: string) {
  try {
    return !PRIVATE_HOST.test(new URL(value).hostname);
  } catch {
    return false;
  }
}

export const DEMO_PLACEHOLDER_RESULT: TestResult = {
  ok: true,
  statusCode: 200,
  statusText: "OK",
  totalMs: 182,
  timings: { dns: 12, connect: 24, tls: 38, ttfb: 96, download: 12 },
  body: "",
  sizeBytes: 0,
  region: "BOM",
  ranAt: Date.now(),
};

const LIVE_TRAIL_LENGTH = 24;

function liveWindow(checks: MonitorStatus[], offset: number) {
  const shift = offset % checks.length;
  return [...checks.slice(shift), ...checks.slice(0, shift)].slice(-LIVE_TRAIL_LENGTH);
}

export type StoryPhase = "healthy" | "down" | "resolved";

const STORY: StoryPhase[] = ["healthy", "healthy", "down", "down", "down", "resolved", "resolved"];

export const HERO_STATIC_STEP = 4;

export function storyPhase(step: number) {
  return STORY[((step % STORY.length) + STORY.length) % STORY.length];
}

const HERO_ROWS = BOARD_MONITORS.slice(0, 5);

export function heroBoard(step: number): BoardMonitor[] {
  const [checkout, ...others] = HERO_ROWS;
  const isDown = storyPhase(step) === "down";
  const checks = Array.from({ length: LIVE_TRAIL_LENGTH }, (_, index) =>
    storyPhase(step - (LIVE_TRAIL_LENGTH - 1 - index)) === "down" ? "down" : "up",
  );

  return [
    { ...checkout, status: isDown ? "down" : "up", latency: isDown ? "503" : "212 ms", checks },
    ...others.map((monitor) => ({ ...monitor, checks: liveWindow(monitor.checks, step) })),
  ];
}

export const CHART_MONITOR = MONITORS[0];

export const HERO_LATENCY = [232, 228, 241, 236, 219, 224, 214, 209, 221, 216, 214];

export const LANDING_FACTS = [
  { value: "30 s", label: "Check interval", detail: "From every region, on Pro" },
  { value: "3", label: "Regions", detail: "Mumbai, Frankfurt, Virginia" },
  { value: "< 60 s", label: "Failure to alert", detail: "Confirmed by two regions" },
  { value: "90 d", label: "Status history", detail: "On every public page" },
];

export const REGION_CHECKS: { code: RegionCode; city: string; latency: string; checks: MonitorStatus[] }[] = [
  { code: "BOM", city: "Mumbai", latency: "118 ms", checks: statusTrail(LIVE_TRAIL_LENGTH, "up") },
  { code: "FRA", city: "Frankfurt", latency: "204 ms", checks: statusTrail(LIVE_TRAIL_LENGTH, "up", { 17: "down" }) },
  { code: "IAD", city: "Virginia", latency: "241 ms", checks: statusTrail(LIVE_TRAIL_LENGTH, "up") },
];

export const ERROR_BUDGET = { used: "12m 06s", total: "43m 12s", remaining: 72, slo: "99.9%" };

export const ROLES = ["Owner", "Admin", "Editor", "Viewer"] as const;

export type LandingRole = (typeof ROLES)[number];

export const ROLE_MATRIX: { permission: string; denied: string; grants: Record<LandingRole, boolean> }[] = [
  {
    permission: "View monitors and incidents",
    denied: "",
    grants: { Owner: true, Admin: true, Editor: true, Viewer: true },
  },
  {
    permission: "Acknowledge alerts",
    denied: "Viewers can't acknowledge alerts",
    grants: { Owner: true, Admin: true, Editor: true, Viewer: false },
  },
  {
    permission: "Edit monitors and alert rules",
    denied: "Viewers can't edit monitors",
    grants: { Owner: true, Admin: true, Editor: true, Viewer: false },
  },
  {
    permission: "Invite and manage members",
    denied: "Only Owners and Admins manage members",
    grants: { Owner: true, Admin: true, Editor: false, Viewer: false },
  },
  {
    permission: "Delete the organization",
    denied: "Only the Owner can delete the organization",
    grants: { Owner: true, Admin: false, Editor: false, Viewer: false },
  },
];

export const AUDIT_LINES = [
  { time: "14:09", actor: "priya@shopnest.in", action: "monitor.update", detail: "interval 60s → 30s" },
  { time: "13:55", actor: "arjun@shopnest.in", action: "role.assign", detail: "rohan → Editor" },
  { time: "13:41", actor: "meera@shopnest.in", action: "api_key.create", detail: "ci-deploy, monitors:write" },
];

export const PIPELINE_RAIL = statusTrail(
  120,
  "up",
  Object.fromEntries(Array.from({ length: 34 }, (_, index) => [74 + index, index < 2 ? "degraded" : "down"])),
);

export const ESCALATION = [
  { after: "+0m", channel: "Email", target: "on-call" },
  { after: "+10m", channel: "Slack", target: "#ops" },
  { after: "+30m", channel: "Discord", target: "#incidents" },
];

export const PIPELINE_RULE = "status == down in ≥ 2 regions for 30s";

export const STATUS_EXAMPLES = STATUS_PAGES.map((page) => page.slug);

export const SHOWCASE_SLUG = "shopnest";

const API_ORIGIN = "https://api.uptrail.dev";

export const PUBLIC_ORIGIN = "https://uptrail.dev";

export const CURL_SAMPLE = `curl -X POST ${API_ORIGIN}/v1/monitors \\
  -H "Authorization: Bearer upt_live_8f2c41d9" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Checkout API",
    "url": "https://api.shopnest.in/health",
    "interval": 30,
    "regions": ["BOM", "FRA", "IAD"]
  }'`;

export const WEBHOOK_SAMPLE = JSON.stringify(
  {
    event: "incident.opened",
    incident: { id: "inc_142", title: "Checkout API is down", severity: "sev1", status: "investigating" },
    monitor: { name: "Checkout API", url: "https://api.shopnest.in/health" },
    regions: ["BOM", "FRA"],
    opened_at: "2026-10-06T14:02:09Z",
  },
  null,
  2,
);

export const DEVELOPER_POINTS = [
  { code: "POST /v1/monitors", text: "Create and update monitors from CI." },
  { code: "incident.opened", text: "Webhooks signed with your channel secret." },
  { code: "badge.svg", text: "Live status in any README." },
];

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    summary: "For side projects and small teams.",
    limits: [
      "20 monitors",
      "1 minute checks",
      "3 members",
      "30 days of history",
      "Every alert channel",
      "A status page per project",
    ],
    cta: "signup",
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month, per organization",
    summary: "For teams that go on call.",
    limits: [
      "200 monitors",
      "30 second checks",
      "Unlimited members",
      "1 year of history",
      "Custom roles and audit log",
      "Custom status page domain",
    ],
    cta: "pro",
  },
] as const;

export const FINAL_TRAIL = statusTrail(180, "up", { 71: "degraded", 72: "degraded", 133: "down" });

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Live checks", href: "#product" },
      { label: "Alerts", href: "#alerts" },
      { label: "Status pages", href: "#status-pages" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "REST API", href: "#developers" },
      { label: "Webhooks", href: "#developers" },
      { label: "Status badge", href: "#developers" },
    ],
  },
];

export function showcaseSnapshot() {
  const page = statusPageStore.list().find((item) => item.slug === SHOWCASE_SLUG);
  return page ? buildStatusSnapshot(page, monitorStore.list(), incidentStore.list()) : null;
}
