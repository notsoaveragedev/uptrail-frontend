import { LATENCY_THRESHOLD_MS } from "@/lib/format";
import { DEFAULT_TIMEOUT_MS } from "@/lib/monitors";
import type { CheckResult, CheckStatus } from "@/types/logs";
import type { RegionCode } from "@/types/monitor";
import { MONITORS } from "./monitors";
import { seeded } from "./random";

const CHECK_RESULT_COUNT = 100_000;
const SPAN_MS = 7 * 24 * 3_600_000;

const FAILURES = [
  { code: null, type: "timeout", message: "Read timed out after 10,000 ms" },
  { code: 503, type: "http", message: "503 Service Unavailable" },
  { code: 502, type: "http", message: "502 Bad Gateway from upstream" },
  { code: 500, type: "http", message: "500 Internal Server Error" },
  { code: null, type: "dns", message: "NXDOMAIN while resolving host" },
  { code: 200, type: "assertion", message: 'Keyword "Book a call" not found in body' },
];

export function generateCheckResults(anchor: number): CheckResult[] {
  const random = seeded(42);
  const monitors = MONITORS.filter((monitor) => monitor.status !== "paused");
  const step = SPAN_MS / CHECK_RESULT_COUNT;
  const results: CheckResult[] = new Array(CHECK_RESULT_COUNT);

  for (let index = 0; index < CHECK_RESULT_COUNT; index++) {
    const monitor = monitors[Math.floor(random() * monitors.length)];
    const region = monitor.regions[Math.floor(random() * monitor.regions.length)].code as RegionCode;
    const ts = Math.round(anchor - index * step - random() * step);
    const isOutage = monitor.status === "down" && region !== "IAD" && anchor - ts < 6.5 * 60_000;
    const failureRate = monitor.status === "down" ? 0.03 : 0.002;
    const failure = isOutage
      ? FAILURES[0]
      : random() < failureRate
        ? FAILURES[Math.floor(random() * FAILURES.length)]
        : null;
    const base = monitor.latencyMs ?? 260;
    const latencyMs = failure?.type === "timeout" ? DEFAULT_TIMEOUT_MS : Math.round(base * (0.7 + random() * 0.6));
    const status: CheckStatus = failure ? "down" : latencyMs > LATENCY_THRESHOLD_MS ? "degraded" : "up";
    const dns = Math.round(4 + random() * 12);
    const connect = Math.round(12 + random() * 20);
    const tls = Math.round(20 + random() * 25);
    const download = Math.round(6 + random() * 20);

    results[index] = {
      id: `chk_${index.toString(36).padStart(4, "0")}`,
      ts,
      monitorId: monitor.id,
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      region,
      status,
      statusCode: failure ? failure.code : 200,
      latencyMs,
      timings: { dns, connect, tls, ttfb: Math.max(10, latencyMs - dns - connect - tls - download), download },
      sizeBytes: failure && failure.type !== "assertion" ? null : Math.round(1_800 + random() * 58_000),
      error: failure ? { type: failure.type, message: failure.message } : null,
    };
  }

  return results;
}
