import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import type { WidgetType } from "@/types/dashboard";

const BAR_HEIGHTS = [18, 34, 58, 82, 96, 74, 52, 40, 28, 20, 14, 10, 8, 6];

function Rows({ count, className }: { count: number; className: string }) {
  return (
    <div className="flex size-full flex-col gap-2 overflow-hidden">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonBlock key={index} isInset className={className} />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex size-full flex-col gap-3">
      <SkeletonBlock isInset className="h-3 w-48" />
      <SkeletonBlock isInset className="min-h-0 flex-1" />
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="flex size-full flex-col justify-between gap-2">
      <div className="flex justify-between">
        <SkeletonBlock isInset className="h-3 w-20" />
        <SkeletonBlock isInset className="h-4 w-12" />
      </div>
      <div className="flex items-end justify-between">
        <SkeletonBlock isInset className="h-8 w-28" />
        <SkeletonBlock isInset className="h-4 w-14" />
      </div>
    </div>
  );
}

function HistogramSkeleton() {
  return (
    <div className="flex size-full items-end gap-0.5">
      {BAR_HEIGHTS.map((height, index) => (
        <SkeletonBlock key={index} isInset className="flex-1 rounded-xs" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function StripSkeleton({ count }: { count: number }) {
  return (
    <div className="flex size-full flex-col gap-2 overflow-hidden">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex h-5 shrink-0 items-center gap-3">
          <SkeletonBlock isInset className="h-3 w-24" />
          <SkeletonBlock isInset className="h-full flex-1 rounded-xs" />
        </div>
      ))}
    </div>
  );
}

function TileSkeleton() {
  return (
    <div className="grid size-full auto-rows-fr grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
      {Array.from({ length: 5 }, (_, index) => (
        <SkeletonBlock key={index} isInset />
      ))}
    </div>
  );
}

export function WidgetSkeleton({ type }: { type: WidgetType }) {
  return (
    <div role="status" aria-label="Loading widget" className="size-full">
      {type === "latency_chart" && <ChartSkeleton />}
      {type === "kpi" && <KpiSkeleton />}
      {type === "histogram" && <HistogramSkeleton />}
      {type === "heatmap" && <StripSkeleton count={6} />}
      {type === "incident_timeline" && <StripSkeleton count={4} />}
      {type === "region_map" && <TileSkeleton />}
      {type === "slowest" && <Rows count={5} className="h-9 shrink-0" />}
      {type === "live_log" && <Rows count={14} className="h-3.5 shrink-0" />}
      {type === "text" && <Rows count={3} className="h-3 w-3/4 shrink-0" />}
    </div>
  );
}
