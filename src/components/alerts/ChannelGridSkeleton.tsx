import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export function ChannelGridSkeleton() {
  return (
    <div aria-busy aria-label="Loading channels" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex flex-col rounded-lg border border-line bg-card">
          <div className="flex items-start gap-3 px-4 pt-4">
            <SkeletonBlock isInset className="size-9" />
            <div className="flex flex-1 flex-col gap-2 pt-0.5">
              <SkeletonBlock isInset className="h-3.5 w-28" />
              <SkeletonBlock isInset className="h-3 w-40" />
            </div>
            <SkeletonBlock isInset className="h-4 w-14" />
          </div>
          <div className="mt-4 flex h-12 items-center border-t border-line px-4">
            <SkeletonBlock isInset className="h-3 w-44" />
          </div>
        </div>
      ))}
    </div>
  );
}
