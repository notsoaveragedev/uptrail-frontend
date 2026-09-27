import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export function OverviewSkeleton() {
  return (
    <div aria-busy aria-label="Loading overview" className="flex flex-col gap-6">
      <SkeletonBlock className="h-12 w-96" />
      <div className="grid gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-36" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-34" />
        ))}
      </div>
      <SkeletonBlock className="h-96" />
    </div>
  );
}
