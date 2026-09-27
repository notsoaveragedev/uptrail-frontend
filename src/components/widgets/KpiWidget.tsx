import { Sparkline } from "@/components/charts/Sparkline";
import { useWidgetData } from "@/hooks/useWidgetData";
import { latencyTone, STATUS_TEXT, TONE_BADGE, uptimeTone } from "@/lib/status";
import { kpiConfigSchema, readConfig, thresholdStatus, widgetRange, type KpiConfig } from "@/lib/widgetConfig";
import { kpiDelta, kpiValue, trendShape } from "@/lib/widgetFormat";
import type { DashboardRange, WidgetProps } from "@/types/dashboard";
import type { KpiData } from "@/types/widgetData";
import { WidgetState } from "./WidgetState";

export function KpiWidget({ widget, range }: WidgetProps) {
  const query = useWidgetData<"kpi">(widget, range);
  const config = readConfig(kpiConfigSchema, widget);

  return (
    <WidgetState type="kpi" query={query} noun="this stat">
      {(data) => <KpiView data={data} config={config} range={widgetRange(widget, range)} />}
    </WidgetState>
  );
}

function valueTone({ stat, warn, critical }: KpiConfig, value: number) {
  const status = thresholdStatus(value, { warn, critical }, stat !== "uptime");
  if (status) return STATUS_TEXT[status];
  if (warn !== null || critical !== null) return "text-ink";
  if (stat === "uptime") return uptimeTone(value);
  return stat === "incidents" ? "text-ink" : latencyTone(value);
}

function KpiView({ data, config, range }: { data: KpiData; config: KpiConfig; range: DashboardRange }) {
  const display = kpiValue(config.stat, data.value, config.decimals);
  const delta = kpiDelta(config.stat, data.value, data.previous);
  const hasSpark = config.showSparkline && Math.max(...data.spark) > 0;
  const pillTone = delta.isGood === null ? "bg-hover text-muted" : TONE_BADGE[delta.isGood ? "up" : "down"];

  return (
    <div className="flex size-full min-h-0 flex-col justify-between gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caps font-semibold tracking-widest text-subtle uppercase">vs prev {range}</span>
        <span className={`rounded-sm px-1.5 py-0.5 font-mono text-xs whitespace-nowrap ${pillTone}`}>{delta.text}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className={`font-mono text-display font-medium tracking-tight ${valueTone(config, data.value)}`}>
          {display.value}
          {display.unit && <span className="ml-1 text-xs text-subtle">{display.unit}</span>}
        </p>
        {hasSpark && <Sparkline values={trendShape(data.spark)} className="mb-2 shrink-0 text-series-1" />}
      </div>
    </div>
  );
}
