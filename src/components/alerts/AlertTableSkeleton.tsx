import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

type AlertTableSkeletonProps = {
  columns: string[];
  rows?: number;
};

export function AlertTableSkeleton({ columns, rows = 6 }: AlertTableSkeletonProps) {
  return (
    <div aria-busy aria-label="Loading" className="overflow-hidden rounded-lg border border-line bg-card">
      <div className="flex items-center gap-6 border-b border-line px-4 py-3">
        {columns.map((width, index) => (
          <SkeletonBlock key={index} isInset className={`h-3 ${width}`} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-6 border-b border-line px-4 py-4 last:border-b-0">
          {columns.map((width, index) => (
            <SkeletonBlock key={index} isInset className={`h-3.5 ${width}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
