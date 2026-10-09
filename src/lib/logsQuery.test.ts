import { describe, expect, it } from "vitest";
import type { CheckResult } from "@/types/logs";
import { logsRangeLabel, readLogsFilters } from "./logs";
import { runLogsQuery } from "./logsQuery";

const HOUR = 3_600_000;
const ANCHOR = 100 * HOUR;

function check(id: string, ts: number): CheckResult {
  return {
    id,
    ts,
    monitorId: "mon_checkout",
    monitorName: "Checkout API",
    monitorUrl: "api.shopnest.in",
    region: "BOM",
    status: "up",
    statusCode: 200,
    latencyMs: 120,
    timings: { dns: 1, connect: 1, tls: 1, ttfb: 1, download: 1 },
    sizeBytes: 512,
    error: null,
  };
}

const RESULTS = [check("old", ANCHOR - 30 * HOUR), check("mid", ANCHOR - 10 * HOUR), check("new", ANCHOR - HOUR / 2)];

function matchedIds(search: string) {
  const filters = readLogsFilters(new URLSearchParams(search));
  return runLogsQuery(RESULTS, filters, ANCHOR).matched.map((result) => result.id);
}

describe("readLogsFilters window", () => {
  it("reads a custom window from from/to params", () => {
    const filters = readLogsFilters(new URLSearchParams(`from=${HOUR}&to=${2 * HOUR}`));
    expect(filters.window).toEqual({ from: HOUR, to: 2 * HOUR });
  });

  it("ignores a window that ends before it starts", () => {
    expect(readLogsFilters(new URLSearchParams(`from=${2 * HOUR}&to=${HOUR}`)).window).toBeNull();
  });

  it("ignores a window with only one edge", () => {
    expect(readLogsFilters(new URLSearchParams(`from=${HOUR}`)).window).toBeNull();
  });
});

describe("runLogsQuery time range", () => {
  it("uses the relative range when there is no window", () => {
    expect(matchedIds("range=24h")).toEqual(["new", "mid"]);
  });

  it("keeps only checks inside a custom window", () => {
    expect(matchedIds(`from=${ANCHOR - 40 * HOUR}&to=${ANCHOR - 5 * HOUR}`)).toEqual(["mid", "old"]);
  });

  it("labels relative and custom ranges", () => {
    expect(logsRangeLabel(readLogsFilters(new URLSearchParams("range=24h")))).toBe("Last 24h");
    expect(logsRangeLabel(readLogsFilters(new URLSearchParams(`from=${HOUR}&to=${2 * HOUR}`)))).toContain(" to ");
  });
});
