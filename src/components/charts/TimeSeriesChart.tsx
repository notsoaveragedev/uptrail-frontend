import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useThemeMode } from "@/theme/ThemeContext";

export type ChartSeries = {
  label: string;
  values: (number | null)[];
  colorVar: string;
};

export type ChartBand = {
  start: number;
  end: number;
  label: string;
};

export type ChartPoint = {
  timestamp: number;
  value: number;
};

type TimeSeriesChartProps = {
  timestamps: number[];
  series: ChartSeries[];
  threshold?: number;
  thresholdLabel?: string;
  bands?: ChartBand[];
  markers?: ChartPoint[];
  height?: number;
  formatValue: (value: number) => string;
};

const NO_BANDS: ChartBand[] = [];
const NO_MARKERS: ChartPoint[] = [];

type Cursor = {
  index: number;
  left: number;
  top: number;
};

function readVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function formatTime(seconds: number) {
  return new Date(seconds * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scaleFont(font: string) {
  return font.replace(/^(\d+)px/, (_match, size: string) => `${Number(size) * devicePixelRatio}px`);
}

function formatPoint(value: number | null | undefined, formatValue: (value: number) => string) {
  return value == null ? "—" : formatValue(value);
}

function drawBands(chart: uPlot, bands: ChartBand[], color: string, font: string) {
  const { ctx, bbox } = chart;
  ctx.save();
  ctx.font = scaleFont(font);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  for (const band of bands) {
    const left = Math.max(bbox.left, chart.valToPos(band.start, "x", true));
    const right = Math.min(bbox.left + bbox.width, chart.valToPos(band.end, "x", true));
    const width = Math.max(right - left, 3 * devicePixelRatio);
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = color;
    ctx.fillRect(left, bbox.top, width, bbox.height);
    ctx.globalAlpha = 0.7;
    ctx.fillRect(left, bbox.top, 1 * devicePixelRatio, bbox.height);
    ctx.fillRect(left + width - devicePixelRatio, bbox.top, devicePixelRatio, bbox.height);
    ctx.globalAlpha = 1;
    const labelWidth = ctx.measureText(band.label).width;
    const fitsRight = left + width + 6 * devicePixelRatio + labelWidth < bbox.left + bbox.width;
    const labelX = fitsRight ? left + width + 6 * devicePixelRatio : left - 6 * devicePixelRatio - labelWidth;
    ctx.fillText(band.label, labelX, bbox.top + 14 * devicePixelRatio);
  }
  ctx.restore();
}

function drawMarkers(chart: uPlot, markers: ChartPoint[], color: string) {
  const { ctx } = chart;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5 * devicePixelRatio;
  for (const marker of markers) {
    ctx.beginPath();
    ctx.arc(
      chart.valToPos(marker.timestamp, "x", true),
      chart.valToPos(marker.value, "y", true),
      4 * devicePixelRatio,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function TimeSeriesChart({
  timestamps,
  series,
  threshold,
  thresholdLabel,
  bands = NO_BANDS,
  markers = NO_MARKERS,
  height = 280,
  formatValue,
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mode } = useThemeMode();
  const [cursor, setCursor] = useState<Cursor | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const font = `11px ${readVar("--font-mono")}`;
    const axis = { stroke: readVar("--subtle"), font, ticks: { show: false } };
    const thresholdColor = readVar("--down");
    const markerColor = readVar("--degraded");

    const chart = new uPlot(
      {
        width: container.clientWidth,
        height,
        legend: { show: false },
        cursor: { y: false, drag: { x: false, y: false }, points: { size: 7, width: 2 } },
        scales: { y: { range: (_chart, _min, max) => [0, Math.max(max, threshold ?? 0) * 1.15] } },
        axes: [
          { ...axis, grid: { show: false } },
          {
            ...axis,
            size: 56,
            grid: { stroke: readVar("--grid"), width: 1 },
            values: (_chart, splits) => splits.map(formatValue),
          },
        ],
        series: [
          {},
          ...series.map((item) => ({
            label: item.label,
            stroke: readVar(item.colorVar),
            width: 1.5,
            points: { show: false },
          })),
        ],
        hooks: {
          drawClear: [(chart) => drawBands(chart, bands, thresholdColor, font)],
          setCursor: [
            (chart) => {
              const { idx, left = 0, top = 0 } = chart.cursor;
              setCursor(idx == null ? null : { index: idx, left: left + chart.over.offsetLeft, top });
            },
          ],
          draw: [
            (chart) => {
              if (threshold === undefined) return;
              const y = chart.valToPos(threshold, "y", true);
              const { ctx, bbox } = chart;
              ctx.save();
              ctx.strokeStyle = thresholdColor;
              ctx.lineWidth = devicePixelRatio;
              ctx.setLineDash([4 * devicePixelRatio, 4 * devicePixelRatio]);
              ctx.beginPath();
              ctx.moveTo(bbox.left, y);
              ctx.lineTo(bbox.left + bbox.width, y);
              ctx.stroke();
              if (thresholdLabel) {
                ctx.fillStyle = thresholdColor;
                ctx.font = scaleFont(font);
                ctx.textAlign = "left";
                ctx.textBaseline = "alphabetic";
                ctx.fillText(thresholdLabel, bbox.left + 8 * devicePixelRatio, y - 6 * devicePixelRatio);
              }
              ctx.restore();
            },
            (chart) => drawMarkers(chart, markers, markerColor),
          ],
        },
      },
      [timestamps, ...series.map((item) => item.values)],
      container,
    );

    const observer = new ResizeObserver(() => chart.setSize({ width: container.clientWidth, height }));
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.destroy();
    };
  }, [timestamps, series, threshold, thresholdLabel, bands, markers, height, formatValue, mode]);

  return (
    <div className="relative" onMouseLeave={() => setCursor(null)}>
      <div ref={containerRef} className="w-full" />
      {cursor && (
        <div
          role="presentation"
          className="pointer-events-none absolute z-10 min-w-44 rounded-md border border-line-strong bg-tooltip px-3 py-2 shadow-overlay"
          style={{
            left: cursor.left,
            top: cursor.top,
            transform: `translate(${cursor.left > 400 ? "-110%" : "10%"}, -50%)`,
          }}
        >
          <p className="font-mono text-xs text-subtle">{formatTime(timestamps[cursor.index])}</p>
          {series.map((item) => (
            <p key={item.label} className="mt-1 flex items-center gap-2 text-xs">
              <span className="h-0.5 w-3 rounded-full" style={{ background: `var(${item.colorVar})` }} />
              <span className="flex-1 text-muted">{item.label}</span>
              <span className="font-mono text-ink">{formatPoint(item.values[cursor.index], formatValue)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
