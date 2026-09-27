import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Segmented } from "antd";
import { lazy, Suspense, useMemo } from "react";
import { useParams } from "react-router";
import { responseHistoryQuery } from "@/api/monitorDetail";
import { Card } from "@/components/ui/Card";
import { importWithReload } from "@/lib/lazyPage";
import { DETAIL_RANGES, LATENCY_THRESHOLD_MS, latencyText } from "@/lib/monitorDetail";
import type { Monitor } from "@/types/monitor";
import type { ResponseHistory } from "@/types/monitorDetail";
import type { TimeRange } from "@/types/overview";

const TimeSeriesChart = lazy(() =>
  importWithReload(() => import("@/components/charts/TimeSeriesChart")).then((module) => ({
    default: module.TimeSeriesChart,
  })),
);

const CHART_HEIGHT = 300;

type ResponseChartCardProps = {
  monitor: Monitor;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

export function ResponseChartCard({ monitor, range, onRangeChange }: ResponseChartCardProps) {
  const { orgSlug = "" } = useParams();
  const {
    data: history,
    error,
    isPlaceholderData,
  } = useQuery({
    ...responseHistoryQuery(orgSlug, monitor, range),
    placeholderData: keepPreviousData,
  });

  if (error) throw error;

  return (
    <Card
      title="Response time"
      extra={
        <div className="flex flex-wrap items-center justify-end gap-4">
          <ChartLegend />
          <Segmented
            aria-label="Time range"
            size="small"
            value={range}
            onChange={onRangeChange}
            options={DETAIL_RANGES}
            className="font-mono"
          />
        </div>
      }
    >
      <div className={`px-2 pb-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
        {history ? <ResponseChart history={history} /> : <ChartPlaceholder />}
      </div>
    </Card>
  );
}

function ResponseChart({ history }: { history: ResponseHistory }) {
  const series = useMemo(
    () => [
      { label: "p50", values: history.p50, colorVar: "--series-5" },
      { label: "p95", values: history.p95, colorVar: "--series-1" },
    ],
    [history],
  );

  return (
    <>
      <Suspense fallback={<ChartPlaceholder />}>
        <TimeSeriesChart
          timestamps={history.timestamps}
          series={series}
          threshold={LATENCY_THRESHOLD_MS}
          thresholdLabel={`${LATENCY_THRESHOLD_MS} ms alert threshold`}
          bands={history.downBands}
          markers={history.anomalies}
          height={CHART_HEIGHT}
          formatValue={latencyText}
        />
      </Suspense>
      <p className="sr-only">{summarize(history)}</p>
    </>
  );
}

function summarize(history: ResponseHistory) {
  const values = history.p95.filter((value) => value !== null);
  if (values.length === 0) return "No response time data in this range.";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return `p95 averaged ${latencyText(average)}, peaking at ${latencyText(Math.max(...values))}. ${history.anomalies.length} anomalies and ${history.downBands.length} down periods in this range.`;
}

function ChartPlaceholder() {
  return <div className="animate-pulse rounded-md bg-hover" style={{ height: CHART_HEIGHT }} />;
}

function ChartLegend() {
  return (
    <div aria-hidden className="hidden items-center gap-4 font-mono text-xs text-muted lg:flex">
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-3 rounded-full bg-series-5" />
        p50
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-3 rounded-full bg-series-1" />
        p95
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 border-t border-dashed border-down" />
        Threshold
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[1px] border border-down/70 bg-down-soft" />
        Down
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full border-2 border-degraded" />
        Anomaly
      </span>
    </div>
  );
}
