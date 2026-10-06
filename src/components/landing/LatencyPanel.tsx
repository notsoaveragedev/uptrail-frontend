import { Segmented } from "antd";
import { useMemo, useRef, useState } from "react";
import { ChartPlaceholder, LatencyChart, LatencyLegend } from "@/components/charts/LatencyChart";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CHART_MONITOR } from "@/lib/landing";
import { TIME_RANGES } from "@/lib/timeRange";
import { buildResponseHistory } from "@/mocks/monitorDetail";
import type { TimeRange } from "@/types/overview";

export function LatencyPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { rootMargin: "200px 0px" });
  const isNarrow = useMediaQuery("(max-width: 40rem)");
  const [range, setRange] = useState<TimeRange>("24h");
  const history = useMemo(() => buildResponseHistory(CHART_MONITOR, range), [range]);
  const height = isNarrow ? 200 : 360;

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LatencyLegend thresholdLabel="Alert threshold" hasEvents className="flex flex-wrap" />
        <Segmented
          aria-label="Time range"
          size="small"
          value={range}
          onChange={setRange}
          options={TIME_RANGES}
          className="font-mono"
        />
      </div>
      {isInView ? (
        <LatencyChart
          timestamps={history.timestamps}
          p50={history.p50}
          p95={history.p95}
          height={height}
          thresholdLabel="Alert threshold"
          bands={history.downBands}
          markers={history.anomalies}
        />
      ) : (
        <ChartPlaceholder height={height} />
      )}
    </div>
  );
}
