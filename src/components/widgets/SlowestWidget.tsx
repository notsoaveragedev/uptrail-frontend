import { LatencyValue } from "@/components/monitors/LatencyValue";
import { TickMeter } from "@/components/ui/TickMeter";
import { useWidgetData } from "@/hooks/useWidgetData";
import { latencyText } from "@/lib/format";
import { displayUrl } from "@/lib/monitors";
import { STATUS_FILL, STATUS_TEXT } from "@/lib/status";
import { readConfig, slowestConfigSchema, thresholdStatus, type SlowestConfig } from "@/lib/widgetConfig";
import type { WidgetProps } from "@/types/dashboard";
import type { SlowestData, SlowestRow } from "@/types/widgetData";
import { WidgetEmpty, WidgetState } from "./WidgetState";

const METER_TICKS = 10;

export function SlowestWidget({ widget, range }: WidgetProps) {
  const query = useWidgetData<"slowest">(widget, range);
  const config = readConfig(slowestConfigSchema, widget);

  return (
    <WidgetState type="slowest" query={query} noun="endpoints">
      {(data) => <SlowestView data={data} config={config} />}
    </WidgetState>
  );
}

function SlowestView({ data, config }: { data: SlowestData; config: SlowestConfig }) {
  if (data.rows.length === 0) return <WidgetEmpty>No active monitors to rank.</WidgetEmpty>;
  const slowest = data.rows[0].valueMs;

  return (
    <ol className="flex size-full flex-col overflow-y-auto">
      {data.rows.map((row, index) => (
        <SlowestRowView key={row.monitorId} row={row} rank={index + 1} slowest={slowest} config={config} />
      ))}
    </ol>
  );
}

type SlowestRowViewProps = {
  row: SlowestRow;
  rank: number;
  slowest: number;
  config: SlowestConfig;
};

function SlowestRowView({ row, rank, slowest, config }: SlowestRowViewProps) {
  const status = row.status === "down" ? "down" : thresholdStatus(row.valueMs, config);
  const ticks = Math.max(1, Math.round((row.valueMs / slowest) * METER_TICKS));

  return (
    <li className="flex items-center gap-3 border-b border-line py-2 last:border-0">
      <span className="w-4 shrink-0 font-mono text-xs text-subtle">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate">{row.name}</p>
        <p className="truncate font-mono text-xs text-subtle">{displayUrl(row.url)}</p>
      </div>
      <TickMeter
        value={ticks}
        total={METER_TICKS}
        fillClassName={status ? STATUS_FILL[status] : "bg-accent"}
        label={`${row.name}: ${latencyText(row.valueMs)}`}
      />
      <LatencyValue
        ms={row.valueMs}
        tone={status ? STATUS_TEXT[status] : "text-ink"}
        className="w-16 shrink-0 text-right"
      />
    </li>
  );
}
