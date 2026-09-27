import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

const BLOCKS = [
  "col-span-3 h-32",
  "col-span-3 h-32",
  "col-span-3 h-32",
  "col-span-3 h-32",
  "col-span-8 h-96",
  "col-span-4 h-96",
  "col-span-12 h-80",
];

export function DashboardSkeleton() {
  return (
    <div aria-busy aria-label="Loading dashboard" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <SkeletonBlock isInset className="h-4 w-44" />
        <SkeletonBlock isInset className="h-7 w-64" />
        <SkeletonBlock isInset className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-12 gap-4">
        {BLOCKS.map((className, index) => (
          <SkeletonBlock key={index} className={`border border-line ${className}`} />
        ))}
      </div>
    </div>
  );
}
