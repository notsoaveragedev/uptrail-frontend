import { useWidgetData } from "@/hooks/useWidgetData";
import { formatDateTime, formatUptime } from "@/lib/format";
import { STATUS_FILL, STATUS_LABELS, uptimeTone } from "@/lib/status";
import { widgetRange } from "@/lib/widgetConfig";
import { timeAxisLabels } from "@/lib/widgetFormat";
import type { DashboardRange, WidgetProps } from "@/types/dashboard";
import type { HeatmapCell, HeatmapData, HeatmapRow } from "@/types/widgetData";
import { WidgetEmpty, WidgetState } from "./WidgetState";

export function HeatmapWidget({ widget, range }: WidgetProps) {
  const query = useWidgetData<"heatmap">(widget, range);

  return (
    <WidgetState type="heatmap" query={query} noun="status history">
      {(data) => <HeatmapView data={data} range={widgetRange(widget, range)} />}
    </WidgetState>
  );
}

function cellFill(cell: HeatmapCell) {
  if (cell === "none") return "bg-line-strong";
  return cell === "up" ? `${STATUS_FILL.up} opacity-60` : STATUS_FILL[cell];
}

function HeatmapView({ data, range }: { data: HeatmapData; range: DashboardRange }) {
  if (data.rows.length === 0) return <WidgetEmpty>No monitors match this widget.</WidgetEmpty>;
  const end = data.start + data.rows[0].cells.length * data.stepMs;

  return (
    <div className="flex size-full flex-col gap-2">
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {data.rows.map((row) => (
          <HeatmapRowView key={row.monitorId} row={row} start={data.start} stepMs={data.stepMs} />
        ))}
      </ul>
      <div aria-hidden className="mr-17 ml-35 flex justify-between font-mono text-xs text-subtle">
        {timeAxisLabels(data.start, end, range).map((label) => (
          <span key={label}>{label}</span>
        ))}
        <span>Now</span>
      </div>
    </div>
  );
}

function HeatmapRowView({ row, start, stepMs }: { row: HeatmapRow; start: number; stepMs: number }) {
  return (
    <li className="flex max-h-8 min-h-4 flex-1 items-stretch gap-3">
      <span className="w-32 shrink-0 self-center truncate text-xs text-muted">{row.name}</span>
      <span role="img" aria-label={`${row.name}: ${formatUptime(row.uptime)} uptime`} className="flex flex-1 gap-0.5">
        {row.cells.map((cell, index) => (
          <span
            key={index}
            title={`${formatDateTime(start + index * stepMs)} · ${cell === "none" ? "No data" : STATUS_LABELS[cell]}`}
            className={`flex-1 rounded-xs hover:opacity-100 ${cellFill(cell)}`}
          />
        ))}
      </span>
      <span className={`w-14 shrink-0 self-center text-right font-mono text-xs ${uptimeTone(row.uptime)}`}>
        {formatUptime(row.uptime)}
      </span>
    </li>
  );
}
