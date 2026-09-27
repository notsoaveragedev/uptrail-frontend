import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Segmented } from "antd";
import { useParams } from "react-router";
import { responseHistoryQuery } from "@/api/monitorDetail";
import { ChartPlaceholder, LatencyChart, LatencyLegend } from "@/components/charts/LatencyChart";
import { Card } from "@/components/ui/Card";
import { LATENCY_THRESHOLD_MS, latencyText } from "@/lib/format";
import { TIME_RANGES } from "@/lib/timeRange";
import type { Monitor } from "@/types/monitor";
import type { ResponseHistory } from "@/types/monitorDetail";
import type { TimeRange } from "@/types/overview";

const CHART_HEIGHT = 300;

type ResponseChartCardProps = {
  monitor: Monitor;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

export function ResponseChartCard({ monitor, range, onRangeChange }: ResponseChartCardProps) {
  const { orgSlug = "" } = useParams();
  const { data: history, isPlaceholderData } = useQuery({
    ...responseHistoryQuery(orgSlug, monitor, range),
    placeholderData: keepPreviousData,
  });

  return (
    <Card
      title="Response time"
      extra={
        <div className="flex flex-wrap items-center justify-end gap-4">
          <LatencyLegend thresholdLabel="Threshold" hasEvents className="hidden lg:flex" />
          <Segmented
            aria-label="Time range"
            size="small"
            value={range}
            onChange={onRangeChange}
            options={TIME_RANGES}
            className="font-mono"
          />
        </div>
      }
    >
      <div className={`px-2 pb-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
        {history ? (
          <>
            <LatencyChart
              timestamps={history.timestamps}
              p50={history.p50}
              p95={history.p95}
              height={CHART_HEIGHT}
              thresholdLabel={`${LATENCY_THRESHOLD_MS} ms alert threshold`}
              bands={history.downBands}
              markers={history.anomalies}
            />
            <p className="sr-only">{summarize(history)}</p>
          </>
        ) : (
          <ChartPlaceholder height={CHART_HEIGHT} />
        )}
      </div>
    </Card>
  );
}

function summarize(history: ResponseHistory) {
  const values = history.p95.filter((value) => value !== null);
  if (values.length === 0) return "No response time data in this range.";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return `p95 averaged ${latencyText(average)}, peaking at ${latencyText(Math.max(...values))}. ${history.anomalies.length} anomalies and ${history.downBands.length} down periods in this range.`;
}
