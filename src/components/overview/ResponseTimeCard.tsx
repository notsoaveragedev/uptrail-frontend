import { LuTriangleAlert } from "react-icons/lu";
import { LatencyChart, LatencyLegend } from "@/components/charts/LatencyChart";
import { Card } from "@/components/ui/Card";
import { LATENCY_THRESHOLD_MS, latencyText } from "@/lib/format";
import type { ResponseSeries } from "@/types/overview";

const CHART_HEIGHT = 380;

type ResponseTimeCardProps = {
  series: ResponseSeries;
  anomalies: string[];
};

export function ResponseTimeCard({ series, anomalies }: ResponseTimeCardProps) {
  const peak = Math.max(...series.p95);
  const average = Math.round(series.p95.reduce((sum, value) => sum + value, 0) / series.p95.length);

  return (
    <Card
      title={
        <>
          Response time <span className="text-sm font-normal text-subtle">All monitors · all regions</span>
        </>
      }
      extra={<LatencyLegend thresholdLabel={`${LATENCY_THRESHOLD_MS} ms alert`} />}
    >
      <div className="px-2">
        <LatencyChart timestamps={series.timestamps} p50={series.p50} p95={series.p95} height={CHART_HEIGHT} />
        <p className="sr-only">
          p95 response time averaged {latencyText(average)}, peaking at {latencyText(peak)}.
        </p>
      </div>

      <div className="m-4 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-panel px-3 py-2">
        <span className="flex items-center gap-2 font-medium">
          <LuTriangleAlert aria-hidden className="size-4 text-degraded" />
          {anomalies.length} anomalies detected
        </span>
        {anomalies.map((anomaly) => (
          <span key={anomaly} className="flex items-center gap-2 text-muted">
            <span className="size-1.5 rounded-xs bg-degraded" />
            {anomaly}
          </span>
        ))}
      </div>
    </Card>
  );
}
