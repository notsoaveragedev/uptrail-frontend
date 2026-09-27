import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { readCssVar, rootFontSize } from "@/lib/dom";
import { formatDateTime } from "@/lib/format";
import { useThemeMode } from "@/theme/ThemeContext";
import type { ChartMarker, DownBand } from "@/types/monitorDetail";

type ChartSeries = {
  label: string;
  values: (number | null)[];
  colorVar: string;
};

type ChartThreshold = {
  value: number;
  label?: string;
  colorVar: string;
};

type TimeSeriesChartProps = {
  timestamps: number[];
  series: ChartSeries[];
  threshold?: number;
  thresholdLabel?: string;
  thresholds?: ChartThreshold[];
  bands?: DownBand[];
  markers?: ChartMarker[];
  height?: number | "fill";
  syncKey?: string;
  formatValue: (value: number) => string;
};

const NO_BANDS: DownBand[] = [];
const NO_MARKERS: ChartMarker[] = [];
const NO_THRESHOLDS: ChartThreshold[] = [];

type Cursor = {
  index: number;
  left: number;
  top: number;
  isFlipped: boolean;
};

type ThresholdLine = {
  value: number;
  label?: string;
  color: string;
  align: "left" | "right";
};

function axisFont() {
  const sizePx = parseFloat(readCssVar("--text-xs")) * rootFontSize();
  return `${sizePx}px ${readCssVar("--font-mono")}`;
}

function scaleFont(font: string) {
  return font.replace(/^([\d.]+)px/, (_match, size: string) => `${Number(size) * devicePixelRatio}px`);
}

function formatPoint(value: number | null | undefined, formatValue: (value: number) => string) {
  return value == null ? "—" : formatValue(value);
}

function drawBands(chart: uPlot, bands: DownBand[], color: string, font: string) {
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

function drawMarkers(chart: uPlot, markers: ChartMarker[], color: string) {
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

function drawThreshold(chart: uPlot, line: ThresholdLine, font: string) {
  const y = chart.valToPos(line.value, "y", true);
  const { ctx, bbox } = chart;
  ctx.save();
  ctx.strokeStyle = line.color;
  ctx.lineWidth = devicePixelRatio;
  ctx.setLineDash([4 * devicePixelRatio, 4 * devicePixelRatio]);
  ctx.beginPath();
  ctx.moveTo(bbox.left, y);
  ctx.lineTo(bbox.left + bbox.width, y);
  ctx.stroke();
  if (line.label) {
    const isLeft = line.align === "left";
    ctx.fillStyle = line.color;
    ctx.font = scaleFont(font);
    ctx.textAlign = line.align;
    ctx.textBaseline = "alphabetic";
    const x = isLeft ? bbox.left + 8 * devicePixelRatio : bbox.left + bbox.width - 4 * devicePixelRatio;
    ctx.fillText(line.label, x, y - 6 * devicePixelRatio);
  }
  ctx.restore();
}

export function TimeSeriesChart({
  timestamps,
  series,
  threshold,
  thresholdLabel,
  thresholds = NO_THRESHOLDS,
  bands = NO_BANDS,
  markers = NO_MARKERS,
  height = 280,
  syncKey,
  formatValue,
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const { mode } = useThemeMode();
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const isFill = height === "fill";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const size = () => ({
      width: container.clientWidth,
      height: height === "fill" ? Math.max(container.clientHeight, 40) : height,
    });
    const font = axisFont();
    const axis = { stroke: readCssVar("--subtle"), font, ticks: { show: false } };
    const thresholdColor = readCssVar("--down");
    const markerColor = readCssVar("--degraded");
    const lines: ThresholdLine[] = [
      ...(threshold === undefined
        ? []
        : [{ value: threshold, label: thresholdLabel, color: thresholdColor, align: "left" as const }]),
      ...thresholds.map((line) => ({
        value: line.value,
        label: line.label,
        color: readCssVar(line.colorVar),
        align: "right" as const,
      })),
    ];
    const ceiling = Math.max(0, ...lines.map((line) => line.value));

    const chart = new uPlot(
      {
        ...size(),
        legend: { show: false },
        cursor: {
          y: false,
          drag: { x: false, y: false },
          points: { size: 7, width: 2 },
          sync: syncKey ? { key: syncKey, setSeries: false } : undefined,
        },
        scales: { y: { range: (_chart, _min, max) => [0, Math.max(max, ceiling) * 1.15] } },
        axes: [
          { ...axis, grid: { show: false } },
          {
            ...axis,
            size: 3.5 * rootFontSize(),
            grid: { stroke: readCssVar("--grid"), width: 1 },
            values: (_chart, splits) => splits.map(formatValue),
          },
        ],
        series: [
          {},
          ...series.map((item) => ({
            label: item.label,
            stroke: readCssVar(item.colorVar),
            width: 1.5,
            points: { show: false },
          })),
        ],
        hooks: {
          drawClear: [(chart) => drawBands(chart, bands, thresholdColor, font)],
          setCursor: [
            (chart) => {
              if (!isHoveredRef.current) return;
              const { idx, left = 0, top = 0 } = chart.cursor;
              const isFlipped = left > chart.over.clientWidth / 2;
              setCursor(idx == null ? null : { index: idx, left: left + chart.over.offsetLeft, top, isFlipped });
            },
          ],
          draw: [
            (chart) => lines.forEach((line) => drawThreshold(chart, line, font)),
            (chart) => drawMarkers(chart, markers, markerColor),
          ],
        },
      },
      [timestamps, ...series.map((item) => item.values)],
      container,
    );

    const observer = new ResizeObserver(() => chart.setSize(size()));
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.destroy();
    };
  }, [timestamps, series, threshold, thresholdLabel, thresholds, bands, markers, height, syncKey, formatValue, mode]);

  function handleLeave() {
    isHoveredRef.current = false;
    setCursor(null);
  }

  return (
    <div
      className={isFill ? "relative size-full" : "relative"}
      onMouseEnter={() => (isHoveredRef.current = true)}
      onMouseLeave={handleLeave}
    >
      <div ref={containerRef} className={isFill ? "absolute inset-0" : "w-full"} />
      {cursor && (
        <div
          role="presentation"
          data-theme="dark"
          className="pointer-events-none absolute z-10 min-w-44 rounded-md border border-line-strong bg-tooltip px-3 py-2 shadow-overlay"
          style={{
            left: cursor.left,
            top: cursor.top,
            transform: `translate(${cursor.isFlipped ? "-110%" : "10%"}, -50%)`,
          }}
        >
          <p className="font-mono text-xs text-subtle">{formatDateTime(timestamps[cursor.index] * 1000)}</p>
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
