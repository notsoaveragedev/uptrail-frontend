import { LATENCY_THRESHOLD_MS } from "@/lib/format";
import { DEFAULT_TIMEOUT_MS, regionCity } from "@/lib/monitors";
import { uptimeStatus } from "@/lib/status";
import type { Monitor, MonitorStatus, MonitorType, RegionCode } from "@/types/monitor";
import type {
  AlertHistoryItem,
  AlertRule,
  ChartMarker,
  DownBand,
  MonitorConfig,
  MonitorDetail,
  MonitorIncident,
  RecentCheck,
  RegionStat,
  ResponseHistory,
  TimingHour,
  UptimeDay,
} from "@/types/monitorDetail";
import type { TimeRange } from "@/types/overview";
import { hashString, RANGE_BUCKETS, seeded } from "./random";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "@/lib/dates";

const CHECK_ROUNDS = 12;
const TYPICAL_MAX_MS = 420;

const ASSERTIONS: Record<MonitorType, string[]> = {
  http: ["status_code in 200..299", "response_time < 1000 ms"],
  keyword: ['body contains "Book a call"', "status_code == 200"],
  json: ['json.status == "ok"', "json.checks.db == true", "response_time < 1500 ms"],
  ssl: ["ssl.days_left > 14", 'ssl.issuer contains "Let\'s Encrypt"'],
  response_time: [`response_time < ${LATENCY_THRESHOLD_MS} ms`, "status_code == 200"],
};

const PAST_INCIDENTS = [
  { title: "Elevated 5xx from upstream", cause: "Payment gateway returned 502 for 11 minutes" },
  { title: "Timeouts from FRA", cause: "Transit issue between Frankfurt and origin" },
  { title: "Slow responses", cause: "Database connection pool exhausted after deploy" },
  { title: "TLS handshake failures", cause: "Certificate chain missing an intermediate" },
];

const DIPS = [99.95, 99.52, 97.9, 99.71, 99.2];

const ASSIGNEES = ["Arjun Rao", "Meera Iyer", "Kabir Shah", "Ananya Das"];

function averageLatency(monitor: Monitor) {
  const average = monitor.latencyHistory.reduce((sum, value) => sum + value, 0) / monitor.latencyHistory.length;
  return Math.round(Math.min(average, TYPICAL_MAX_MS));
}

function downBands(monitor: Monitor, rangeStart: number, now: number): DownBand[] {
  if (monitor.status !== "down") return [];
  const pastStart = now - 16 * HOUR_MS;
  const bands = [
    { start: pastStart, end: pastStart + 32 * MINUTE_MS, label: "Down 32m" },
    { start: monitor.statusSince, end: now, label: "Down" },
  ];
  return bands
    .filter((band) => band.end >= rangeStart)
    .map((band) => ({ ...band, start: Math.floor(band.start / 1000), end: Math.floor(band.end / 1000) }));
}

export function buildResponseHistory(monitor: Monitor, range: TimeRange): ResponseHistory {
  const { count, stepMinutes } = RANGE_BUCKETS[range];
  const random = seeded(hashString(monitor.id) + count);
  const now = Date.now();
  const end = Math.floor(now / 1000);
  const base = averageLatency(monitor);
  const bands = downBands(monitor, now - count * stepMinutes * MINUTE_MS, now);
  const isInBand = (timestamp: number) => bands.some((band) => timestamp >= band.start && timestamp <= band.end);
  const anomalyIndexes =
    monitor.status === "up" ? [Math.floor(count * 0.42)] : [0.22, 0.59, 0.82].map((at) => Math.floor(count * at));
  const slowFrom = monitor.status === "degraded" ? Math.floor(count * 0.86) : count;

  const timestamps: number[] = [];
  const p50: (number | null)[] = [];
  const p95: (number | null)[] = [];
  const anomalies: ChartMarker[] = [];

  for (let index = 0; index < count; index++) {
    const timestamp = end - (count - 1 - index) * stepMinutes * 60;
    const drift = Math.sin(index / 30) * base * 0.1;
    const isAnomaly = anomalyIndexes.includes(index);
    const slow = index >= slowFrom ? base * 1.1 : 0;
    const median = base * 0.8 + drift + random() * base * 0.12 + (isAnomaly ? base * 0.25 : 0) + slow * 0.4;
    const tail = base * 2 + drift * 2.5 + random() * base * 0.2 + (isAnomaly ? base * 1.7 : 0) + slow;
    const isGap = isInBand(timestamp) || (monitor.status === "paused" && timestamp * 1000 >= monitor.statusSince);

    timestamps.push(timestamp);
    p50.push(isGap ? null : Math.round(median));
    p95.push(isGap ? null : Math.round(tail));
    if (isAnomaly && !isGap) anomalies.push({ timestamp, value: Math.round(tail) });
  }

  return { timestamps, p50, p95, downBands: bands, anomalies };
}

function buildTiming(monitor: Monitor, random: () => number): TimingHour[] {
  const ttfb = averageLatency(monitor) * 0.62;
  const currentHour = new Date().getHours();
  return Array.from({ length: 12 }, (_, index) => {
    const hour = (currentHour - 11 + index + 24) % 24;
    return {
      hour: `${String(hour).padStart(2, "0")}:00`,
      phases: {
        dns: Math.round(10 + random() * 6),
        connect: Math.round(22 + random() * 8),
        tls: Math.round(36 + random() * 10),
        ttfb: Math.round(ttfb * (0.85 + random() * 0.35) + (index === 10 ? ttfb * 0.4 : 0)),
        download: Math.round(16 + random() * 10),
      },
    };
  });
}

function buildRegions(monitor: Monitor, random: () => number): RegionStat[] {
  const base = averageLatency(monitor);
  return monitor.regions.map(({ code, status }) => {
    const latency = Math.round(base * (0.85 + random() * 0.3) * (status === "degraded" ? 2.6 : 1));
    return {
      code,
      city: regionCity(code),
      status,
      latencyMs: status === "down" || status === "paused" ? null : latency,
      p95Ms: Math.round(latency * (2 + random() * 0.6)),
    };
  });
}

function buildDays(monitor: Monitor, random: () => number): UptimeDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dipWindow = monitor.uptime30d !== null && monitor.uptime30d >= 99.99 ? 59 : 88;
  const special = new Map(DIPS.map((uptime) => [Math.floor(random() * dipWindow), uptime]));

  return Array.from({ length: 90 }, (_, index) => {
    const date = today.getTime() - (89 - index) * DAY_MS;
    if (index === 89) return { date, uptime: monitor.uptime24h, incidents: monitor.status === "down" ? 1 : 0 };
    const uptime = special.get(index) ?? 100;
    return { date, uptime, incidents: uptime < 99.9 ? (uptime < 99 ? 2 : 1) : 0 };
  });
}

function checkStatus(monitor: Monitor, region: RegionCode, checkedAt: number): MonitorStatus {
  if (monitor.status === "paused" || checkedAt < monitor.statusSince) return "up";
  return monitor.regions.find((item) => item.code === region)?.status ?? "up";
}

function buildChecks(monitor: Monitor, random: () => number): RecentCheck[] {
  const base = averageLatency(monitor);
  const latest = monitor.lastCheckedAt ?? Date.now();

  return Array.from({ length: CHECK_ROUNDS }, (_, round) => latest - round * monitor.intervalSec * 1000).flatMap(
    (checkedAt, round) =>
      monitor.regions.map(({ code }) => {
        const status = checkStatus(monitor, code, checkedAt);
        const isGateway = status === "down" && round === 2 && code === "FRA";
        const responseMs = Math.round(base * (status === "degraded" ? 1.4 : 0.8) * (0.85 + random() * 0.3));
        return {
          id: `${code}-${checkedAt}`,
          checkedAt,
          region: code,
          statusCode: status === "down" ? (isGateway ? 502 : null) : 200,
          responseMs: status === "down" ? (isGateway ? 1864 : DEFAULT_TIMEOUT_MS) : responseMs,
          status,
          error: checkError(status, isGateway, responseMs),
        };
      }),
  );
}

function checkError(status: MonitorStatus, isGateway: boolean, responseMs: number) {
  if (status === "down") return isGateway ? "502 Bad Gateway from upstream" : "Timeout after 10,000 ms";
  if (status === "degraded") return `Slow response: ${responseMs.toLocaleString()} ms > 1,000 ms`;
  return null;
}

function buildIncidents(monitor: Monitor, days: UptimeDay[], seed: number): MonitorIncident[] {
  const past = days
    .filter((day, index) => day.incidents > 0 && index < 89)
    .reverse()
    .slice(0, 3)
    .map((day, index) => {
      const template = PAST_INCIDENTS[(seed + index) % PAST_INCIDENTS.length];
      const startedAt = day.date + (9 + index * 3) * HOUR_MS;
      return {
        id: `INC-${38 - index * 4}`,
        severity: uptimeStatus(day.uptime) === "down" ? ("SEV 1" as const) : ("SEV 2" as const),
        title: template.title,
        cause: template.cause,
        state: "Resolved" as const,
        startedAt,
        resolvedAt: startedAt + (12 + index * 9) * MINUTE_MS,
        assignee: ASSIGNEES[(seed + index) % ASSIGNEES.length],
      };
    });

  if (monitor.status !== "down") return past;
  const failing = monitor.regions.filter((region) => region.status === "down").map((region) => region.code);
  const healthy = monitor.regions.filter((region) => region.status === "up").map((region) => region.code);
  const active: MonitorIncident = {
    id: "INC-42",
    severity: "SEV 1",
    title: `${monitor.name} unreachable`,
    cause: `Timing out from ${failing.join(" and ")}; ${healthy.join(", ")} healthy`,
    state: "Investigating",
    startedAt: monitor.statusSince,
    resolvedAt: null,
    assignee: "Arjun Rao",
  };
  return [active, ...past];
}

function buildRules(monitor: Monitor): AlertRule[] {
  const channel = `#oncall-${monitor.project}`;
  const rules: AlertRule[] = [
    {
      id: "rule_down",
      name: "Monitor down",
      expression: 'status == "down" for 2 checks in >= 2 regions',
      channels: [channel, "PagerDuty"],
      isEnabled: true,
    },
    {
      id: "rule_p95",
      name: "Slow p95",
      expression: `p95(response_ms, 5m) > ${LATENCY_THRESHOLD_MS}`,
      channels: [channel],
      isEnabled: true,
    },
    {
      id: "rule_slo",
      name: "Uptime SLO burn",
      expression: "uptime(1h) < 99.9 and uptime(5m) < 99",
      channels: ["Email: oncall@pixelcraft.io"],
      isEnabled: monitor.status !== "paused",
    },
  ];
  if (monitor.type !== "ssl") return rules;
  return [
    ...rules,
    {
      id: "rule_ssl",
      name: "SSL expiring",
      expression: "ssl.days_left < 14",
      channels: [channel],
      isEnabled: true,
    },
  ];
}

function buildAlertHistory(monitor: Monitor, incidents: MonitorIncident[]): AlertHistoryItem[] {
  const fromIncidents = incidents.flatMap<AlertHistoryItem>((incident) => [
    {
      id: `${incident.id}-fired`,
      rule: "Monitor down",
      firedAt: incident.startedAt + MINUTE_MS,
      state: incident.resolvedAt === null ? "firing" : "resolved",
      detail: incident.cause,
    },
  ]);
  const slow: AlertHistoryItem[] =
    monitor.status === "degraded" || monitor.status === "down"
      ? [
          {
            id: "slow-p95",
            rule: "Slow p95",
            firedAt: monitor.statusSince - 20 * MINUTE_MS,
            state: monitor.status === "degraded" ? "firing" : "acknowledged",
            detail: `p95 crossed ${LATENCY_THRESHOLD_MS} ms for 5 minutes`,
          },
        ]
      : [];
  const burn: AlertHistoryItem = {
    id: "slo-burn",
    rule: "Uptime SLO burn",
    firedAt: Date.now() - 9 * DAY_MS,
    state: "resolved",
    detail: "Hourly uptime dipped to 99.52%",
  };
  return [...fromIncidents, ...slow, burn].sort((a, b) => b.firedAt - a.firedAt);
}

function buildConfig(monitor: Monitor): MonitorConfig {
  const isPost = monitor.method === "POST";
  return {
    url: monitor.url,
    method: monitor.method,
    headers: [
      { name: "Authorization", value: "Bearer sk_live_51Hc9f2a71", isSecret: true },
      { name: "Content-Type", value: "application/json", isSecret: false },
      { name: "X-Uptrail-Check", value: "1", isSecret: false },
    ],
    body: isPost ? '{ "cart_id": "c_9f2a71", "currency": "INR", "dry_run": true }' : null,
    expectedStatus: "200–299",
    assertions: ASSERTIONS[monitor.type],
    intervalSec: monitor.intervalSec,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    regions: monitor.regions.map((region) => region.code),
    tags: monitor.tags,
    followRedirects: true,
    sslExpiryDays: 14,
  };
}

function weekUptime(day: number | null, month: number | null) {
  if (day === null || month === null) return null;
  return Math.min(100, Number(((day + month * 3) / 4).toFixed(2)));
}

function quarterUptime(days: UptimeDay[]) {
  const values = days.map((day) => day.uptime).filter((uptime) => uptime !== null);
  if (values.length === 0) return null;
  return Number((values.reduce((sum, uptime) => sum + uptime, 0) / values.length).toFixed(2));
}

export function buildMonitorDetail(monitor: Monitor): MonitorDetail {
  const seed = hashString(monitor.id);
  const random = seeded(seed);
  const average = averageLatency(monitor);
  const days = buildDays(monitor, random);
  const incidents = buildIncidents(monitor, days, seed);

  return {
    uptime: {
      day: monitor.uptime24h,
      week: weekUptime(monitor.uptime24h, monitor.uptime30d),
      month: monitor.uptime30d,
      quarter: quarterUptime(days),
    },
    latency: { avg: average, p95: Math.round(average * 2.37), p99: Math.round(average * 4.55) },
    timing: buildTiming(monitor, random),
    regions: buildRegions(monitor, random),
    days,
    checks: buildChecks(monitor, random),
    incidents,
    rules: buildRules(monitor),
    alertHistory: buildAlertHistory(monitor, incidents),
    config: buildConfig(monitor),
  };
}
