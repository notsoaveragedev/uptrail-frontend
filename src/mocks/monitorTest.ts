import type { Timings } from "@/types/logs";
import type { HttpMethod, RegionCode } from "@/types/monitor";
import { hashString, seeded } from "./random";

export type TestResult = {
  ok: boolean;
  statusCode: number | null;
  statusText: string;
  totalMs: number;
  timings: Timings;
  body: string;
  sizeBytes: number;
  region: RegionCode;
  ranAt: number;
};

type TestRequest = { url: string; method: HttpMethod; timeoutMs: number; region: RegionCode };

function between(random: () => number, min: number, max: number) {
  return Math.round(min + random() * (max - min));
}

function result(
  request: TestRequest,
  statusCode: number | null,
  statusText: string,
  timings: Timings,
  body: string,
): TestResult {
  return {
    ok: statusCode !== null && statusCode < 400,
    statusCode,
    statusText,
    totalMs: Object.values(timings).reduce((total, ms) => total + ms, 0),
    timings,
    body,
    sizeBytes: new TextEncoder().encode(body).length,
    region: request.region,
    ranAt: Date.now(),
  };
}

function successBody(request: TestRequest, random: () => number) {
  const path = new URL(request.url).pathname;
  if (request.method === "POST" || path.includes("checkout")) {
    return {
      status: "ok",
      order_id: `ord_${between(random, 4096, 65535).toString(16)}`,
      total: between(random, 499, 4999),
      dry_run: true,
    };
  }
  return {
    status: "ok",
    version: "2.14.0",
    uptime_s: between(random, 10_000, 900_000),
    checks: { db: "ok", cache: "ok" },
  };
}

export function runFakeTest(request: TestRequest): TestResult {
  const random = seeded(hashString(`${request.method} ${request.url} ${request.region}`));
  const isHttps = request.url.startsWith("https://");
  const dns = between(random, 3, 14);
  const connect = between(random, 12, 40);
  const tls = isHttps ? between(random, 24, 60) : 0;

  if (request.url.includes("timeout")) {
    return result(
      request,
      null,
      "Timed out",
      { dns, connect, tls, ttfb: Math.max(request.timeoutMs - dns - connect - tls, 0), download: 0 },
      "",
    );
  }

  const timings: Timings = {
    dns,
    connect,
    tls,
    ttfb: between(random, 90, 320),
    download: between(random, 4, 30),
  };

  if (request.url.includes("fail")) {
    const body = {
      error: "upstream_unavailable",
      message: "No healthy upstream",
      request_id: `req_${hashString(request.url).toString(16)}`,
    };
    return result(request, 503, "Service Unavailable", timings, JSON.stringify(body, null, 2));
  }

  return result(request, 200, "OK", timings, JSON.stringify(successBody(request, random), null, 2));
}
