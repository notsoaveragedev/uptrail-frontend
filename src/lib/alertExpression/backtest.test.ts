import { describe, expect, it } from "vitest";
import { backtestSeries, type BacktestSeries } from "@/mocks/backtest";
import type { ExpressionNode } from "@/types/alerts";
import { firingRanges, runBacktest } from "./backtest";
import { parse } from "./parse";

function ast(text: string): ExpressionNode {
  const result = parse(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.ast;
}

function flatSeries(latencies: number[]): BacktestSeries {
  return {
    timestamps: latencies.map((_, index) => index * 60),
    sslDaysRemaining: 30,
    regions: [
      {
        code: "FRA",
        samples: latencies.map((latency) => ({ latency, status: "up", errorRate: 0, statusCode: 200 })),
      },
    ],
  };
}

describe("firingRanges", () => {
  const matches = [false, true, true, true, false, true, false];

  it("fires on every run without a for duration", () => {
    expect(firingRanges(matches, 0, 60)).toEqual([
      { first: 1, last: 3 },
      { first: 5, last: 5 },
    ]);
  });

  it("waits for the for duration before firing", () => {
    expect(firingRanges(matches, 120, 60)).toEqual([{ first: 3, last: 3 }]);
    expect(firingRanges(matches, 180, 60)).toEqual([]);
  });

  it("closes a run at the end of the series", () => {
    expect(firingRanges([true, true], 60, 60)).toEqual([{ first: 1, last: 1 }]);
  });
});

describe("runBacktest", () => {
  const series = flatSeries([100, 900, 950, 1000, 100, 100, 900, 100]);

  it("returns intervals, count and minutes", () => {
    const result = runBacktest(ast("latency > 800"), 0, series);
    expect(result.intervals).toEqual([
      { start: 60, end: 240, peak: 1000 },
      { start: 360, end: 420, peak: 900 },
    ]);
    expect(result).toMatchObject({ count: 2, totalMinutes: 4, threshold: 800, metric: "latency" });
  });

  it("honours forSeconds", () => {
    const result = runBacktest(ast("latency > 800"), 120, series);
    expect(result.intervals).toEqual([{ start: 180, end: 240, peak: 1000 }]);
  });

  it("evaluates windowed functions and enum fields", () => {
    expect(runBacktest(ast('max(latency) > 800 and region == "FRA"'), 0, series).count).toBe(1);
    expect(runBacktest(ast('latency > 800 and region == "BOM"'), 0, series).count).toBe(0);
  });

  it("charts latency when the rule has no numeric threshold", () => {
    const result = runBacktest(ast('status == "down"'), 0, series);
    expect(result).toMatchObject({ metric: "p95(latency)", threshold: null, count: 0 });
  });

  it("is deterministic for a monitor", () => {
    const now = Date.UTC(2026, 8, 27, 12);
    const first = runBacktest(ast("p95(latency) > 800"), 300, backtestSeries("mon_checkout", now));
    const second = runBacktest(ast("p95(latency) > 800"), 300, backtestSeries("mon_checkout", now));
    expect(first.intervals).toEqual(second.intervals);
    expect(first.timestamps).toHaveLength(1440);
  });
});
