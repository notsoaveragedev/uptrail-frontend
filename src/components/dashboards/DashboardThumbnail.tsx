import { thumbnailBlocks, THUMBNAIL_SIZE, type ThumbnailBlock } from "@/lib/dashboards";
import type { DashboardWidget, LayoutItem } from "@/types/dashboard";

type DashboardThumbnailProps = {
  layout: LayoutItem[];
  widgets: DashboardWidget[];
  className?: string;
};

const CHART_POINTS = [0.62, 0.48, 0.55, 0.3, 0.46, 0.36, 0.42, 0.22];
const HISTOGRAM_HEIGHTS = [0.35, 0.65, 1, 0.6, 0.3];
const LOG_WIDTHS = [0.85, 0.6, 0.75, 0.5];
const SLOWEST_WIDTHS = [0.9, 0.7, 0.5];

export function DashboardThumbnail({ layout, widgets, className = "h-30" }: DashboardThumbnailProps) {
  const blocks = thumbnailBlocks(layout, widgets);

  return (
    <svg
      role="img"
      aria-label={`Layout preview with ${widgets.length} widgets`}
      viewBox={`0 0 ${THUMBNAIL_SIZE.width} ${THUMBNAIL_SIZE.height}`}
      preserveAspectRatio="xMidYMid meet"
      className={`w-full rounded-md bg-panel ${className}`}
    >
      {blocks.map((block) => (
        <g key={block.id}>
          <rect
            x={block.x}
            y={block.y}
            width={block.width}
            height={block.height}
            rx={1.5}
            className="fill-hover stroke-line"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <BlockGlyph block={block} />
        </g>
      ))}
    </svg>
  );
}

function BlockGlyph({ block }: { block: ThumbnailBlock }) {
  const pad = Math.min(4, block.width / 6, block.height / 6);
  const x = block.x + pad;
  const y = block.y + pad;
  const width = block.width - pad * 2;
  const height = block.height - pad * 2;

  switch (block.type) {
    case "latency_chart": {
      const points = CHART_POINTS.map(
        (value, index) => `${x + (index / (CHART_POINTS.length - 1)) * width},${y + value * height}`,
      );
      return (
        <polyline
          points={points.join(" ")}
          fill="none"
          className="stroke-series-1"
          strokeOpacity={0.6}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      );
    }
    case "kpi":
      return (
        <>
          <rect x={x} y={y + height * 0.2} width={width * 0.4} height={height * 0.34} rx={1} className="fill-subtle" />
          <rect x={x} y={y + height * 0.72} width={width * 0.62} height={1.2} className="fill-line-strong" />
        </>
      );
    case "heatmap":
      return (
        <>
          {Array.from({ length: 18 }, (_, index) => (
            <circle
              key={index}
              cx={x + ((index % 6) + 0.5) * (width / 6)}
              cy={y + (Math.floor(index / 6) + 0.5) * (height / 3)}
              r={Math.min(width / 18, height / 9, 2.2)}
              className={index === 9 ? "fill-down" : "fill-line-strong"}
            />
          ))}
        </>
      );
    case "histogram":
      return (
        <>
          {HISTOGRAM_HEIGHTS.map((value, index) => {
            const columnWidth = width / HISTOGRAM_HEIGHTS.length;
            const columnHeight = value * height;
            const left = x + index * columnWidth + 1;
            return (
              <g key={index}>
                <rect
                  x={left}
                  y={y + height - columnHeight}
                  width={columnWidth - 2}
                  height={columnHeight}
                  className="fill-line-strong"
                  fillOpacity={0.45}
                />
                <rect
                  x={left}
                  y={y + height - columnHeight}
                  width={columnWidth - 2}
                  height={1}
                  className="fill-subtle"
                />
              </g>
            );
          })}
        </>
      );
    case "incident_timeline":
      return (
        <>
          <rect x={x + width * 0.1} y={y + height * 0.2} width={width * 0.35} height={2} rx={1} className="fill-down" />
          <rect
            x={x + width * 0.5}
            y={y + height * 0.65}
            width={width * 0.45}
            height={2}
            rx={1}
            className="fill-degraded"
          />
        </>
      );
    case "slowest":
      return (
        <>
          {SLOWEST_WIDTHS.map((value, index) => {
            const rowY = y + (index + 0.5) * (height / SLOWEST_WIDTHS.length);
            return (
              <g key={index}>
                <rect x={x} y={rowY - 0.6} width={width * 0.5} height={1.2} className="fill-line-strong" />
                <rect
                  x={x + width * 0.56}
                  y={rowY - 1.5}
                  width={width * 0.3 * value}
                  height={3}
                  className="fill-subtle"
                />
              </g>
            );
          })}
        </>
      );
    case "region_map":
      return (
        <>
          {Array.from({ length: 6 }, (_, index) => (
            <rect
              key={index}
              x={x + (index % 3) * (width / 3) + 0.5}
              y={y + Math.floor(index / 3) * (height / 2) + 0.5}
              width={width / 3 - 1}
              height={height / 2 - 1}
              rx={1}
              className={index === 1 ? "fill-down-soft stroke-down" : "fill-card stroke-line-strong"}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </>
      );
    case "live_log":
      return (
        <>
          {LOG_WIDTHS.map((value, index) => (
            <rect
              key={index}
              x={x}
              y={y + (index + 0.5) * (height / LOG_WIDTHS.length) - 0.6}
              width={width * value}
              height={1.2}
              className={index === 1 ? "fill-down" : "fill-line-strong"}
            />
          ))}
        </>
      );
    case "text":
      return (
        <>
          <rect x={x} y={y + height * 0.25} width={width * 0.6} height={1.4} className="fill-subtle" />
          <rect x={x} y={y + height * 0.55} width={width * 0.4} height={1.2} className="fill-line-strong" />
        </>
      );
  }
}
