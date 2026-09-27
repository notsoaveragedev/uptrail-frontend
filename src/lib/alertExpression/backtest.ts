import type { BacktestRegion, BacktestSeries } from "@/mocks/backtest";
import type { CompareOperator, ExpressionNode, ExpressionOperand, ExpressionValue } from "@/types/alerts";
import { operandField, operandKey, type FieldDefinition } from "./catalog";

export const AGGREGATION_WINDOW = 5;

export type BacktestInterval = {
  start: number;
  end: number;
  peak: number | null;
};

export type BacktestResult = {
  timestamps: number[];
  values: (number | null)[];
  metric: string;
  field: FieldDefinition;
  threshold: number | null;
  intervals: BacktestInterval[];
  count: number;
  totalMinutes: number;
};

type Context = {
  series: BacktestSeries;
  region: BacktestRegion;
  index: number;
};

const FALLBACK_METRIC: ExpressionOperand = { type: "fn", name: "p95", arg: "latency" };

function percentile(values: number[], fraction: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))];
}

const AGGREGATES: Record<string, (values: number[]) => number> = {
  avg: (values) => values.reduce((sum, value) => sum + value, 0) / values.length,
  p50: (values) => percentile(values, 0.5),
  p95: (values) => percentile(values, 0.95),
  p99: (values) => percentile(values, 0.99),
  max: (values) => Math.max(...values),
};

function regionCount(context: Context) {
  return context.series.regions.filter((region) => region.samples[context.index].status === "down").length;
}

function fieldValue(name: string, context: Context): ExpressionValue {
  const sample = context.region.samples[context.index];
  switch (name) {
    case "status":
      return sample.status;
    case "latency":
      return sample.latency;
    case "error_rate":
      return sample.errorRate;
    case "status_code":
      return sample.statusCode;
    case "region":
      return context.region.code;
    case "region_count":
      return regionCount(context);
    default:
      return context.series.sslDaysRemaining;
  }
}

function operandValue(operand: ExpressionOperand, context: Context): ExpressionValue {
  if (operand.type === "field") return fieldValue(operand.name, context);
  const from = Math.max(0, context.index - AGGREGATION_WINDOW + 1);
  const window = context.region.samples.slice(from, context.index + 1).map((sample) => sample.latency);
  return AGGREGATES[operand.name](window);
}

function compare(op: CompareOperator, left: ExpressionValue, right: ExpressionValue) {
  switch (op) {
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "==":
      return left === right;
    case "!=":
      return left !== right;
  }
}

export function evaluate(node: ExpressionNode, context: Context): boolean {
  if (node.type === "compare") return compare(node.op, operandValue(node.left, context), node.right);
  const check = (child: ExpressionNode) => evaluate(child, context);
  return node.type === "and" ? node.children.every(check) : node.children.some(check);
}

export function matchingSamples(ast: ExpressionNode, series: BacktestSeries) {
  return series.timestamps.map((_, index) => series.regions.some((region) => evaluate(ast, { series, region, index })));
}

export function firingRanges(matches: boolean[], forSeconds: number, stepSeconds: number) {
  const delay = Math.ceil(forSeconds / stepSeconds);
  const ranges: { first: number; last: number }[] = [];
  let runStart = -1;

  matches.forEach((isMatch, index) => {
    if (isMatch && runStart === -1) runStart = index;
    const isRunEnd = isMatch && (index === matches.length - 1 || !matches[index + 1]);
    if (!isRunEnd) return;
    if (runStart + delay <= index) ranges.push({ first: runStart + delay, last: index });
    runStart = -1;
  });

  return ranges;
}

function firstNumericComparison(node: ExpressionNode): { left: ExpressionOperand; right: number } | null {
  if (node.type === "compare") {
    const isNumeric = operandField(node.left).type === "number" && typeof node.right === "number";
    return isNumeric ? { left: node.left, right: node.right as number } : null;
  }
  for (const child of node.children) {
    const found = firstNumericComparison(child);
    if (found) return found;
  }
  return null;
}

function chartValues(operand: ExpressionOperand, series: BacktestSeries) {
  return series.timestamps.map((_, index) => {
    const values = series.regions.map((region) => operandValue(operand, { series, region, index }));
    return Math.max(...values.map(Number));
  });
}

function peakOf(values: (number | null)[], first: number, last: number) {
  const window = values.slice(first, last + 1).filter((value): value is number => value !== null);
  return window.length > 0 ? Math.max(...window) : null;
}

export function runBacktest(ast: ExpressionNode, forSeconds: number, series: BacktestSeries): BacktestResult {
  const step = series.timestamps[1] - series.timestamps[0];
  const primary = firstNumericComparison(ast);
  const operand = primary?.left ?? FALLBACK_METRIC;
  const values = chartValues(operand, series);
  const ranges = firingRanges(matchingSamples(ast, series), forSeconds, step);
  const intervals = ranges.map(({ first, last }) => ({
    start: series.timestamps[first],
    end: series.timestamps[last] + step,
    peak: peakOf(values, first, last),
  }));

  return {
    timestamps: series.timestamps,
    values,
    metric: operandKey(operand),
    field: operandField(operand),
    threshold: primary?.right ?? null,
    intervals,
    count: intervals.length,
    totalMinutes: intervals.reduce((sum, interval) => sum + (interval.end - interval.start) / 60, 0),
  };
}
