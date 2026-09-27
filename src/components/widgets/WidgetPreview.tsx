import type { ReactNode } from "react";
import type { WidgetType } from "@/types/dashboard";

const LINE_A = "4,44 16,40 28,42 40,30 52,34 64,22 76,28 88,18 100,24 116,14";
const LINE_B = "4,52 16,50 28,51 40,46 52,48 64,42 76,45 88,40 100,43 116,38";
const HISTOGRAM = [6, 14, 26, 38, 44, 36, 26, 18, 12, 8, 5, 3];
const HEATMAP_ROWS = [[], [17], [9, 10], [], [21, 22, 23]];
const LOG_WIDTHS = [72, 60, 84, 54, 76, 66];
const SLOWEST_WIDTHS = [40, 32, 22];

function ChartGlyph() {
  return (
    <>
      <line x1="4" x2="116" y1="26" y2="26" className="stroke-down" strokeDasharray="3 3" strokeWidth="1" />
      <polyline points={LINE_B} className="stroke-series-2" fill="none" strokeWidth="1.5" />
      <polyline points={LINE_A} className="stroke-series-1" fill="none" strokeWidth="1.5" />
    </>
  );
}

function KpiGlyph() {
  return (
    <>
      <rect x="6" y="10" width="30" height="4" rx="1" className="fill-line-strong" />
      <rect x="6" y="24" width="52" height="16" rx="2" className="fill-ink" />
      <rect x="84" y="10" width="28" height="7" rx="2" className="fill-up-soft" />
      <polyline
        points="70,48 80,44 88,46 96,38 104,40 114,32"
        className="stroke-series-1"
        fill="none"
        strokeWidth="1.5"
      />
    </>
  );
}

function HeatmapGlyph() {
  return HEATMAP_ROWS.map((bad, row) => [
    <rect key={row} x="4" y={8 + row * 11} width="15" height="3.5" rx="1" className="fill-line-strong" />,
    ...Array.from({ length: 24 }, (_, column) => (
      <rect
        key={`${row}-${column}`}
        x={24 + column * 3.8}
        y={6 + row * 11}
        width="2.8"
        height="8"
        rx="0.5"
        className={bad.includes(column) ? (row === 4 ? "fill-down" : "fill-degraded") : "fill-up"}
      />
    )),
  ]);
}

function HistogramGlyph() {
  return HISTOGRAM.map((height, index) => (
    <g key={index}>
      <rect x={8 + index * 9} y={56 - height} width="8" height={height} className="fill-series-1" opacity="0.18" />
      <rect x={8 + index * 9} y={56 - height} width="8" height="1.5" className="fill-series-1" />
    </g>
  ));
}

function TimelineGlyph() {
  return (
    <>
      {[16, 32, 48].map((y) => (
        <line key={y} x1="4" x2="116" y1={y} y2={y} className="stroke-line-strong" strokeWidth="1" />
      ))}
      <rect x="22" y="12" width="18" height="8" rx="1" className="fill-degraded-soft stroke-degraded" />
      <rect x="66" y="28" width="10" height="8" rx="1" className="fill-down-soft stroke-down" />
      <rect x="96" y="44" width="20" height="8" rx="1" className="fill-down-soft stroke-down" />
    </>
  );
}

function RegionGlyph() {
  return Array.from({ length: 6 }, (_, index) => (
    <rect
      key={index}
      x={6 + (index % 3) * 37}
      y={6 + Math.floor(index / 3) * 27}
      width="34"
      height="24"
      rx="3"
      className={index === 1 ? "fill-down-soft stroke-down" : "fill-hover stroke-line-strong"}
    />
  ));
}

function SlowestGlyph() {
  return SLOWEST_WIDTHS.map((width, index) => (
    <g key={index}>
      <rect x="6" y={10 + index * 16} width="50" height="4" rx="1" className="fill-line-strong" />
      <rect x={66} y={9 + index * 16} width={width} height="6" rx="1" className="fill-accent" />
    </g>
  ));
}

function LogGlyph() {
  return LOG_WIDTHS.map((width, index) => (
    <rect
      key={index}
      x="6"
      y={6 + index * 9}
      width={width + 30}
      height="3.5"
      rx="1"
      className={index === 2 ? "fill-down" : "fill-line-strong"}
    />
  ));
}

function TextGlyph() {
  return (
    <>
      <rect x="6" y="10" width="56" height="6" rx="1" className="fill-ink" />
      <rect x="6" y="26" width="100" height="4" rx="1" className="fill-line-strong" />
      <rect x="6" y="36" width="84" height="4" rx="1" className="fill-line-strong" />
      <rect x="6" y="46" width="44" height="4" rx="1" className="fill-accent" />
    </>
  );
}

const GLYPHS: Record<WidgetType, () => ReactNode> = {
  latency_chart: ChartGlyph,
  kpi: KpiGlyph,
  heatmap: HeatmapGlyph,
  histogram: HistogramGlyph,
  incident_timeline: TimelineGlyph,
  region_map: RegionGlyph,
  slowest: SlowestGlyph,
  live_log: LogGlyph,
  text: TextGlyph,
};

export function WidgetPreview({ type, className = "" }: { type: WidgetType; className?: string }) {
  const Glyph = GLYPHS[type];

  return (
    <div aria-hidden className={`rounded-md border border-line bg-panel p-2 ${className}`}>
      <svg viewBox="0 0 120 60" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <Glyph />
      </svg>
    </div>
  );
}
