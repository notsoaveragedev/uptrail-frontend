import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useThemeMode } from "@/theme/ThemeContext";

export type ChartSeries = {
  label: string;
  values: number[];
  colorVar: string;
};

type TimeSeriesChartProps = {
  timestamps: number[];
  series: ChartSeries[];
  threshold?: number;
  height?: number;
  formatValue: (value: number) => string;
};

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

export function TimeSeriesChart({ timestamps, series, threshold, height = 280, formatValue }: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mode } = useThemeMode();
  const [cursor, setCursor] = useState<Cursor | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const font = `11px ${readVar("--font-mono")}`;
    const axis = { stroke: readVar("--subtle"), font, ticks: { show: false } };
    const thresholdColor = readVar("--down");

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
              ctx.restore();
            },
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
  }, [timestamps, series, threshold, height, formatValue, mode]);

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
              <span className="font-mono text-ink">{formatValue(item.values[cursor.index])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
