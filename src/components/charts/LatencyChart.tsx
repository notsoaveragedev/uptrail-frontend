import { lazy, Suspense, useMemo } from "react";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { LATENCY_THRESHOLD_MS, latencyText } from "@/lib/format";
import { importWithReload } from "@/lib/lazyPage";
import type { ChartMarker, DownBand } from "@/types/monitorDetail";

const TimeSeriesChart = lazy(() =>
  importWithReload(() => import("./TimeSeriesChart")).then((module) => ({ default: module.TimeSeriesChart })),
);

type LatencyChartProps = {
  timestamps: number[];
  p50: (number | null)[];
  p95: (number | null)[];
  height: number;
  thresholdLabel?: string;
  bands?: DownBand[];
  markers?: ChartMarker[];
};

export function LatencyChart({ timestamps, p50, p95, height, thresholdLabel, bands, markers }: LatencyChartProps) {
  const series = useMemo(
    () => [
      { label: "p50", values: p50, colorVar: "--series-5" },
      { label: "p95", values: p95, colorVar: "--series-1" },
    ],
    [p50, p95],
  );

  return (
    <Suspense fallback={<ChartPlaceholder height={height} />}>
      <TimeSeriesChart
        timestamps={timestamps}
        series={series}
        threshold={LATENCY_THRESHOLD_MS}
        thresholdLabel={thresholdLabel}
        bands={bands}
        markers={markers}
        height={height}
        formatValue={latencyText}
      />
    </Suspense>
  );
}

export function ChartPlaceholder({ height }: { height: number }) {
  return <SkeletonBlock isInset style={{ height }} />;
}

type LatencyLegendProps = {
  thresholdLabel: string;
  hasEvents?: boolean;
  className?: string;
};

export function LatencyLegend({ thresholdLabel, hasEvents = false, className = "flex" }: LatencyLegendProps) {
  return (
    <div aria-hidden className={`items-center gap-4 font-mono text-xs text-muted ${className}`}>
      <LegendItem swatch="h-0.5 w-3 rounded-full bg-series-5" label="p50" />
      <LegendItem swatch="h-0.5 w-3 rounded-full bg-series-1" label="p95" />
      <LegendItem swatch="w-3 border-t border-dashed border-down" label={thresholdLabel} />
      {hasEvents && (
        <>
          <LegendItem swatch="size-2.5 rounded-xs border border-down/70 bg-down-soft" label="Down" />
          <LegendItem swatch="size-2 rounded-full border-2 border-degraded" label="Anomaly" />
        </>
      )}
    </div>
  );
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={swatch} />
      {label}
    </span>
  );
}
