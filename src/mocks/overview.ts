import type { Monitor, MonitorStatus, Overview, ResponseSeries, TimeRange } from "@/types/overview";

const CHECK_COUNT = 30;
const HISTORY_COUNT = 24;

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function checks(fill: MonitorStatus, overrides: Record<number, MonitorStatus> = {}) {
  return Array.from({ length: CHECK_COUNT }, (_, index) => overrides[index] ?? fill);
}

function history(base: number, seed: number) {
  const random = seeded(seed);
  return Array.from({ length: HISTORY_COUNT }, () => Math.round(base * (0.85 + random() * 0.3)));
}

function secondsAgo(seconds: number) {
  return Date.now() - seconds * 1000;
}

const allUp = (codes: string[]) => codes.map((code) => ({ code, status: "up" as const }));

const monitors: Monitor[] = [
  {
    id: "mon_checkout",
    name: "Checkout API",
    url: "api.shopnest.in/v2/checkout",
    type: "HTTP",
    status: "down",
    latencyMs: null,
    uptime: 97.81,
    regions: [
      { code: "BOM", status: "down" },
      { code: "FRA", status: "down" },
      { code: "IAD", status: "up" },
    ],
    checks: checks("up", {
      21: "degraded",
      23: "degraded",
      24: "down",
      25: "down",
      26: "down",
      27: "down",
      28: "down",
      29: "down",
    }),
    latencyHistory: history(260, 3),
    lastCheckedAt: secondsAgo(6),
  },
  {
    id: "mon_search",
    name: "Search service",
    url: "search.pixelcraft.io/health",
    type: "JSON",
    status: "degraded",
    latencyMs: 1240,
    uptime: 99.62,
    regions: [
      { code: "BOM", status: "degraded" },
      { code: "FRA", status: "up" },
      { code: "IAD", status: "degraded" },
    ],
    checks: checks("up", {
      19: "degraded",
      22: "degraded",
      23: "degraded",
      26: "degraded",
      28: "degraded",
      29: "degraded",
    }),
    latencyHistory: history(1100, 20),
    lastCheckedAt: secondsAgo(12),
  },
  {
    id: "mon_marketing",
    name: "Marketing site",
    url: "www.bluepeak.co",
    type: "Keyword",
    status: "degraded",
    latencyMs: 890,
    uptime: 99.9,
    regions: [
      { code: "BOM", status: "up" },
      { code: "FRA", status: "degraded" },
      { code: "IAD", status: "up" },
    ],
    checks: checks("up", { 20: "degraded", 27: "degraded", 29: "degraded" }),
    latencyHistory: history(820, 37),
    lastCheckedAt: secondsAgo(21),
  },
  {
    id: "mon_auth",
    name: "Auth service",
    url: "auth.pixelcraft.io/health",
    type: "HTTP",
    status: "up",
    latencyMs: 142,
    uptime: 100,
    regions: allUp(["BOM", "FRA", "IAD"]),
    checks: checks("up"),
    latencyHistory: history(140, 54),
    lastCheckedAt: secondsAgo(4),
  },
  {
    id: "mon_payments",
    name: "Payments webhook",
    url: "hooks.shopnest.in/payments",
    type: "HTTP",
    status: "up",
    latencyMs: 198,
    uptime: 99.98,
    regions: allUp(["BOM", "FRA", "IAD"]),
    checks: checks("up", { 11: "degraded" }),
    latencyHistory: history(200, 71),
    lastCheckedAt: secondsAgo(15),
  },
  {
    id: "mon_admin",
    name: "Admin dashboard",
    url: "admin.bluepeak.co",
    type: "Keyword",
    status: "up",
    latencyMs: 326,
    uptime: 99.99,
    regions: allUp(["BOM", "FRA", "IAD"]),
    checks: checks("up", { 17: "degraded" }),
    latencyHistory: history(320, 88),
    lastCheckedAt: secondsAgo(30),
  },
  {
    id: "mon_cdn",
    name: "Image CDN",
    url: "cdn.pixelcraft.io",
    type: "SSL",
    status: "up",
    latencyMs: 88,
    uptime: 100,
    regions: allUp(["BOM", "FRA", "IAD"]),
    checks: checks("up"),
    latencyHistory: history(90, 105),
    lastCheckedAt: secondsAgo(9),
  },
  {
    id: "mon_public_api",
    name: "Public API v1",
    url: "api.pixelcraft.io/v1/status",
    type: "JSON",
    status: "up",
    latencyMs: 211,
    uptime: 99.97,
    regions: allUp(["BOM", "FRA", "IAD"]),
    checks: checks("up", { 6: "degraded" }),
    latencyHistory: history(210, 122),
    lastCheckedAt: secondsAgo(18),
  },
  {
    id: "mon_blog",
    name: "Blog",
    url: "blog.bluepeak.co",
    type: "Keyword",
    status: "up",
    latencyMs: 402,
    uptime: 100,
    regions: allUp(["BOM", "FRA", "IAD"]),
    checks: checks("up"),
    latencyHistory: history(400, 139),
    lastCheckedAt: secondsAgo(45),
  },
  {
    id: "mon_staging",
    name: "Staging API",
    url: "staging-api.shopnest.in",
    type: "HTTP",
    status: "paused",
    latencyMs: null,
    uptime: null,
    regions: [
      { code: "BOM", status: "paused" },
      { code: "FRA", status: "paused" },
      { code: "IAD", status: "paused" },
    ],
    checks: checks("paused"),
    latencyHistory: history(300, 156),
    lastCheckedAt: secondsAgo(7200),
  },
];

const RANGE_BUCKETS: Record<TimeRange, { count: number; stepMinutes: number }> = {
  "1h": { count: 60, stepMinutes: 1 },
  "24h": { count: 288, stepMinutes: 5 },
  "7d": { count: 168, stepMinutes: 60 },
  "30d": { count: 180, stepMinutes: 240 },
};

function responseSeries(range: TimeRange): ResponseSeries {
  const { count, stepMinutes } = RANGE_BUCKETS[range];
  const random = seeded(99);
  const end = Math.floor(Date.now() / 1000);
  const spikeAt = count - 6;
  const timestamps: number[] = [];
  const p50: number[] = [];
  const p95: number[] = [];

  for (let index = 0; index < count; index++) {
    const drift = Math.sin(index / 40) * 20;
    const spike = Math.max(0, 1 - Math.abs(index - spikeAt) / 4);
    timestamps.push(end - (count - 1 - index) * stepMinutes * 60);
    p50.push(Math.round(195 + drift + random() * 25 + spike * 15));
    p95.push(Math.round(540 + drift * 3 + random() * 45 + spike * 620));
  }

  return { timestamps, p50, p95 };
}

export function buildOverview(range: TimeRange): Overview {
  return {
    kpis: {
      uptime: 99.94,
      slo: 99.9,
      p95: 612,
      p95Previous: 564,
      openIncidents: 1,
      openIncidentsPrevious: 3,
      mttrMinutes: 14,
    },
    monitors,
    totalMonitors: 42,
    statusCounts: { up: 38, degraded: 2, down: 1, paused: 1 },
    anomalies: ["p95 spiked to 1.18 s at 14:05", "BOM latency is up 40% since 13:50"],
    attention: [
      {
        id: "att_checkout",
        severity: "down",
        tag: "Down",
        monitorName: "Checkout API",
        diagnosis: "Timing out from BOM and FRA for 6m. IAD is healthy. INC-42 is being investigated.",
        age: "6m",
        action: { label: "Open incident", to: "incidents/INC-42" },
      },
      {
        id: "att_search",
        severity: "degraded",
        tag: "Degraded",
        monitorName: "Search service",
        diagnosis: "p95 is 1.24 s, 2.1× its 7-day baseline since 13:52.",
        age: "42m",
        action: { label: "View latency", to: "monitors/mon_search" },
      },
      {
        id: "att_ssl",
        severity: "warning",
        tag: "SSL 6d",
        monitorName: "Image CDN",
        diagnosis: "The certificate for cdn.pixelcraft.io expires on Oct 2.",
        age: "2h",
        action: { label: "View certificate", to: "monitors/mon_cdn" },
      },
    ],
    incidents: [
      {
        id: "INC-42",
        severity: "SEV 1",
        title: "Checkout API unreachable",
        cause: "Payment gateway timing out from BOM and FRA.",
        state: "Investigating",
        assignee: { name: "Arjun R.", initials: "AR" },
        startedAt: Date.now() - 380_000,
      },
    ],
    maintenance: { title: "DB migration", project: "Bluepeak", startsAt: "Tomorrow 02:00" },
    alerts: [
      {
        id: "al1",
        rule: "status = down in ≥2 regions",
        monitorName: "Checkout API",
        time: "6m ago",
        state: "unacknowledged",
      },
      {
        id: "al2",
        rule: "p95(latency) > 800 for 5m",
        monitorName: "Search service",
        time: "12m ago",
        state: "acknowledged",
        actor: "Meera",
      },
      {
        id: "al3",
        rule: 'keyword "Book a call" missing',
        monitorName: "Marketing site",
        time: "38m ago",
        state: "acknowledged",
        actor: "Arjun",
      },
      { id: "al4", rule: "ssl.expires_in < 14d", monitorName: "Image CDN", time: "2h ago", state: "resolved" },
    ],
    responseTime: responseSeries(range),
  };
}

export function simulateCheck(current: Monitor[]) {
  const active = current.filter((monitor) => monitor.status !== "paused" && monitor.status !== "down");
  const target = active[Math.floor(Math.random() * active.length)];
  const base = target.latencyHistory.at(-1) ?? 200;
  const latencyMs = Math.round(base * (0.9 + Math.random() * 0.2));

  return current.map((monitor) =>
    monitor.id === target.id
      ? {
          ...monitor,
          latencyMs,
          checks: [...monitor.checks.slice(1), monitor.status],
          latencyHistory: [...monitor.latencyHistory.slice(1), latencyMs],
          lastCheckedAt: Date.now(),
        }
      : monitor,
  );
}
