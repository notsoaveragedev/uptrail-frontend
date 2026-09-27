import { LATENCY_THRESHOLD_MS } from "@/lib/format";
import { percentile, runLogsQuery, summarizeGroups } from "@/lib/logsQuery";
import type { CheckResult, CheckResultDetail, LogsFilters, LogsPage } from "@/types/logs";
import { generateCheckResults } from "./checkResults";

export const LOGS_ANCHOR = Date.now();

let results: CheckResult[] | null = null;
const cache = new Map<string, ReturnType<typeof buildResult>>();

function allResults() {
  results ??= generateCheckResults(LOGS_ANCHOR);
  return results;
}

function buildResult(filters: LogsFilters) {
  const { matched, facets } = runLogsQuery(allResults(), filters, LOGS_ANCHOR);
  return {
    matched,
    facets,
    groups: summarizeGroups(matched, filters),
    failed: matched.filter((result) => result.status === "down").length,
    p95LatencyMs: percentile(
      matched.map((result) => result.latencyMs),
      0.95,
    ),
  };
}

function resultFor(filters: LogsFilters) {
  const key = JSON.stringify(filters);
  const cached = cache.get(key);
  if (cached) return cached;
  const built = buildResult(filters);
  cache.set(key, built);
  if (cache.size > 8) cache.delete(cache.keys().next().value!);
  return built;
}

export function queryLogs(filters: LogsFilters, cursor: number, limit: number): LogsPage {
  const { matched, ...summary } = resultFor(filters);
  const end = cursor + limit;
  return {
    ...summary,
    items: matched.slice(cursor, end),
    nextCursor: end < matched.length ? end : null,
    total: matched.length,
  };
}

export function getLogDetail(id: string): CheckResultDetail | null {
  const result = allResults().find((item) => item.id === id);
  if (!result) return null;
  const isFailed = result.status === "down";
  return {
    ...result,
    method: "GET",
    requestHeaders: { "User-Agent": "Uptrail/1.0 (+https://uptrail.dev/bot)", Accept: "application/json" },
    responseHeaders: isFailed
      ? {
          "content-type": "text/html; charset=utf-8",
          server: "cloudflare",
          "cf-ray": `8c${result.id.slice(4)}-${result.region}`,
          "retry-after": "30",
        }
      : null,
    assertions: [
      {
        name: "Status code",
        expected: "200–299",
        actual: result.statusCode === null ? "no response" : String(result.statusCode),
        passed: result.statusCode !== null && result.statusCode < 300,
      },
      {
        name: "Response time",
        expected: `< ${LATENCY_THRESHOLD_MS} ms`,
        actual: `${result.latencyMs} ms`,
        passed: result.latencyMs < LATENCY_THRESHOLD_MS,
      },
    ],
  };
}
