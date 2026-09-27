import { useWidgetData } from "@/hooks/useWidgetData";
import { latencyText } from "@/lib/format";
import { logPercentOf } from "@/lib/widgetFormat";
import type { WidgetProps } from "@/types/dashboard";
import type { HistogramData } from "@/types/widgetData";
import { WidgetEmpty, WidgetState } from "./WidgetState";

export function HistogramWidget({ widget, range }: WidgetProps) {
  const query = useWidgetData<"histogram">(widget, range);

  return (
    <WidgetState type="histogram" query={query} noun="latency data">
      {(data) => <HistogramView data={data} />}
    </WidgetState>
  );
}

function HistogramView({ data }: { data: HistogramData }) {
  const { bins, p50, p95, total } = data;
  if (total === 0) return <WidgetEmpty>No checks in this range.</WidgetEmpty>;
  const peak = Math.max(...bins.map((bin) => bin.count));
  const start = bins[0].start;
  const end = bins[bins.length - 1].end;

  return (
    <div className="flex size-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
        <MarkerLegend label="p50" value={p50} swatch="border-muted" />
        <MarkerLegend label="p95" value={p95} swatch="border-ink" />
        <span className="ml-auto text-subtle">{total.toLocaleString()} checks</span>
      </div>
      <div className="relative min-h-0 flex-1 border-b border-line">
        <div className="absolute inset-0 flex items-end gap-0.5">
          {bins.map((bin) => (
            <div
              key={bin.start}
              title={`${latencyText(bin.start)}–${latencyText(bin.end)} · ${bin.count} checks`}
              className="group flex h-full flex-1 items-end"
            >
              {bin.count > 0 && (
                <div
                  className="w-full rounded-t-xs border-t-2 border-series-1 bg-linear-to-b from-series-1/18 to-series-1/2 group-hover:from-series-1/45 group-hover:to-series-1/10"
                  style={{ height: `${(bin.count / peak) * 100}%` }}
                />
              )}
            </div>
          ))}
        </div>
        <Marker left={logPercentOf(p50, start, end)} className="border-muted" />
        <Marker left={logPercentOf(p95, start, end)} className="border-ink" />
      </div>
      <div aria-hidden className="flex justify-between font-mono text-xs text-subtle">
        <span>{latencyText(start)}</span>
        <span>{latencyText(Math.sqrt(start * end))}</span>
        <span>{latencyText(end)}</span>
      </div>
      <p className="sr-only">
        {total} checks. Median {latencyText(p50)}, p95 {latencyText(p95)}.
      </p>
    </div>
  );
}

function Marker({ left, className }: { left: number; className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 border-l border-dashed ${className}`}
      style={{ left: `${left}%` }}
    />
  );
}

function MarkerLegend({ label, value, swatch }: { label: string; value: number; swatch: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 border-l border-dashed ${swatch}`} />
      {label} <span className="text-ink">{latencyText(value)}</span>
    </span>
  );
}
