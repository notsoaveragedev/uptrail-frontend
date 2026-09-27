import { useMemo } from "react";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { useWidgetData } from "@/hooks/useWidgetData";
import { latencyText } from "@/lib/format";
import { latencyChartConfigSchema, METRIC_LABELS, readConfig, type LatencyChartConfig } from "@/lib/widgetConfig";
import type { WidgetProps } from "@/types/dashboard";
import type { LatencyChartData } from "@/types/widgetData";
import { WidgetEmpty, WidgetState } from "./WidgetState";

export function LatencyChartWidget({ widget, range, syncKey, isPreview = false }: WidgetProps) {
  const query = useWidgetData<"latency_chart">(widget, range);
  const config = readConfig(latencyChartConfigSchema, widget);

  return (
    <WidgetState type="latency_chart" query={query} noun="latency data">
      {(data) => <LatencyChartView data={data} config={config} syncKey={isPreview ? undefined : syncKey} />}
    </WidgetState>
  );
}

type LatencyChartViewProps = {
  data: LatencyChartData;
  config: LatencyChartConfig;
  syncKey?: string;
};

function LatencyChartView({ data, config, syncKey }: LatencyChartViewProps) {
  const { warn, critical, showLegend, metric } = config;
  const series = useMemo(
    () =>
      data.series.map((item, index) => ({ label: item.label, values: item.values, colorVar: `--series-${index + 1}` })),
    [data],
  );
  const thresholds = useMemo(
    () => [
      ...(warn === null ? [] : [{ value: warn, label: `warn ${latencyText(warn)}`, colorVar: "--degraded" }]),
      ...(critical === null ? [] : [{ value: critical, label: latencyText(critical), colorVar: "--down" }]),
    ],
    [warn, critical],
  );

  if (series.length === 0) return <WidgetEmpty>Pick monitors to chart.</WidgetEmpty>;

  return (
    <div className="flex size-full flex-col gap-2">
      {showLegend && <ChartLegend labels={series.map((item) => item.label)} />}
      <div className="-mx-2 min-h-0 flex-1">
        <TimeSeriesChart
          timestamps={data.timestamps}
          series={series}
          thresholds={thresholds}
          height="fill"
          syncKey={syncKey}
          formatValue={latencyText}
        />
      </div>
      <p className="sr-only">{chartSummary(series, METRIC_LABELS[metric])}</p>
    </div>
  );
}

function ChartLegend({ labels }: { labels: string[] }) {
  return (
    <ul aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
      {labels.map((label, index) => (
        <li key={label} className="flex min-w-0 items-center gap-1.5">
          <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: `var(--series-${index + 1})` }} />
          <span className="truncate">{label}</span>
        </li>
      ))}
    </ul>
  );
}

function chartSummary(series: { label: string; values: (number | null)[] }[], metric: string) {
  return series
    .map((item) => {
      const values = item.values.filter((value) => value !== null);
      const peak = values.length ? Math.max(...values) : 0;
      return `${item.label} ${metric} peaked at ${latencyText(peak)}`;
    })
    .join(". ");
}
