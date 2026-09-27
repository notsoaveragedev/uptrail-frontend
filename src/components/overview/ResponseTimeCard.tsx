import { lazy, Suspense, useMemo } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import { Card } from "@/components/ui/Card";
import { formatLatency } from "@/lib/format";
import { importWithReload } from "@/lib/lazyPage";
import type { ResponseSeries } from "@/types/overview";

const TimeSeriesChart = lazy(() =>
  importWithReload(() => import("@/components/charts/TimeSeriesChart")).then((module) => ({
    default: module.TimeSeriesChart,
  })),
);

const THRESHOLD_MS = 800;
const CHART_HEIGHT = 380;

function formatAxisLatency(ms: number) {
  const { value, unit } = formatLatency(ms);
  return `${value} ${unit}`;
}

type ResponseTimeCardProps = {
  series: ResponseSeries;
  anomalies: string[];
};

export function ResponseTimeCard({ series, anomalies }: ResponseTimeCardProps) {
  const chartSeries = useMemo(
    () => [
      { label: "p50", values: series.p50, colorVar: "--series-5" },
      { label: "p95", values: series.p95, colorVar: "--series-1" },
    ],
    [series],
  );

  const peak = Math.max(...series.p95);
  const average = Math.round(series.p95.reduce((sum, value) => sum + value, 0) / series.p95.length);

  return (
    <Card
      title={
        <>
          Response time <span className="text-sm font-normal text-subtle">All monitors · all regions</span>
        </>
      }
      extra={
        <div className="flex items-center gap-4 font-mono text-xs text-muted">
          <LegendItem colorClass="bg-series-5" label="p50" />
          <LegendItem colorClass="bg-series-1" label="p95" />
          <LegendItem colorClass="bg-down" label={`${THRESHOLD_MS} ms alert`} isDashed />
        </div>
      }
    >
      <div className="px-2">
        <Suspense fallback={<div className="animate-pulse rounded-md bg-hover" style={{ height: CHART_HEIGHT }} />}>
          <TimeSeriesChart
            timestamps={series.timestamps}
            series={chartSeries}
            threshold={THRESHOLD_MS}
            height={CHART_HEIGHT}
            formatValue={formatAxisLatency}
          />
        </Suspense>
        <p className="sr-only">
          p95 response time averaged {formatAxisLatency(average)}, peaking at {formatAxisLatency(peak)}.
        </p>
      </div>

      <div className="m-4 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-panel px-3 py-2">
        <span className="flex items-center gap-2 font-medium">
          <LuTriangleAlert aria-hidden className="size-4 text-degraded" />
          {anomalies.length} anomalies detected
        </span>
        {anomalies.map((anomaly) => (
          <span key={anomaly} className="flex items-center gap-2 text-muted">
            <span className="size-1.5 rounded-[1px] bg-degraded" />
            {anomaly}
          </span>
        ))}
      </div>
    </Card>
  );
}

function LegendItem({
  colorClass,
  label,
  isDashed = false,
}: {
  colorClass: string;
  label: string;
  isDashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-0.5 w-3 ${isDashed ? "border-t border-dashed border-down" : `rounded-full ${colorClass}`}`} />
      {label}
    </span>
  );
}
