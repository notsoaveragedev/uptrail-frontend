import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export function IncidentDetailSkeleton() {
  return (
    <div aria-busy aria-label="Loading incident" className="flex flex-col gap-4">
      <SkeletonBlock isInset className="h-4 w-40" />
      <SkeletonBlock isInset className="h-7 w-96" />
      <SkeletonBlock isInset className="h-5 w-80" />
      <SkeletonBlock className="h-16 border border-line" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-4">
          <SkeletonBlock isInset className="h-10" />
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <SkeletonBlock isInset className="size-6 rounded-full" />
              <SkeletonBlock isInset className={`h-3.5 ${index % 2 ? "w-2/3" : "w-1/2"}`} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-48 border border-line" />
          <SkeletonBlock className="h-32 border border-line" />
        </div>
      </div>
    </div>
  );
}
