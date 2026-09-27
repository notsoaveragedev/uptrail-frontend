import { LatencyValue } from "@/components/monitors/LatencyValue";
import { StatusDot } from "@/components/ui/StatusDot";
import { useWidgetData } from "@/hooks/useWidgetData";
import { formatUptime } from "@/lib/format";
import { STATUS_FILL, STATUS_LABELS, STATUS_TEXT } from "@/lib/status";
import {
  readConfig,
  REGION_METRIC_LABELS,
  regionMapConfigSchema,
  thresholdStatus,
  type RegionMapConfig,
} from "@/lib/widgetConfig";
import type { WidgetProps } from "@/types/dashboard";
import type { RegionMapData, RegionTile } from "@/types/widgetData";
import { WidgetState } from "./WidgetState";

export function RegionMapWidget({ widget, range }: WidgetProps) {
  const query = useWidgetData<"region_map">(widget, range);
  const config = readConfig(regionMapConfigSchema, widget);

  return (
    <WidgetState type="region_map" query={query} noun="region data">
      {(data) => <RegionMapView data={data} config={config} />}
    </WidgetState>
  );
}

function RegionMapView({ data, config }: { data: RegionMapData; config: RegionMapConfig }) {
  return (
    <ul className="grid size-full auto-rows-fr grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2 overflow-y-auto">
      {data.tiles.map((tile) => (
        <RegionTileView key={tile.code} tile={tile} config={config} />
      ))}
    </ul>
  );
}

function RegionTileView({ tile, config }: { tile: RegionTile; config: RegionMapConfig }) {
  const isDown = tile.status === "down";
  const isUptime = config.metric === "uptime";
  const breach = thresholdStatus(tile.value, config, !isUptime);
  const tone = breach ? STATUS_TEXT[breach] : "text-ink";

  return (
    <li
      aria-label={`${tile.city}: ${STATUS_LABELS[tile.status]}`}
      className={`flex min-h-16 flex-col justify-between rounded-md border px-3 py-2.5 ${isDown ? "border-down/40 bg-down-soft" : "border-line bg-panel"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium">{tile.code}</span>
        <StatusDot fill={STATUS_FILL[tile.status]} />
      </div>
      <span className="truncate text-xs text-muted">{tile.city}</span>
      <p className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-caps tracking-widest text-subtle uppercase">{REGION_METRIC_LABELS[config.metric]}</span>
        {isUptime ? (
          <span className={`font-mono text-md ${tone}`}>{formatUptime(tile.value)}</span>
        ) : (
          <LatencyValue ms={tile.value} tone={tone} className="text-md" />
        )}
      </p>
    </li>
  );
}
