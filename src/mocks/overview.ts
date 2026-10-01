import { LATENCY_THRESHOLD_MS } from "@/lib/format";
import type { Monitor } from "@/types/monitor";
import type { Overview, ResponseSeries, TimeRange } from "@/types/overview";
import { monitorStore } from "./monitorStore";
import { RANGE_BUCKETS, seeded } from "./random";

const OVERVIEW_MONITOR_COUNT = 10;

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
    monitors: monitorStore.list().slice(0, OVERVIEW_MONITOR_COUNT),
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
        rule: `p95(latency) > ${LATENCY_THRESHOLD_MS} for 5m`,
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
