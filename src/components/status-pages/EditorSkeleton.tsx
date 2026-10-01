import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export function EditorSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-4 lg:h-[calc(100dvh-6.5rem)]">
      <div className="flex flex-col gap-3">
        <SkeletonBlock isInset className="h-4 w-48" />
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <SkeletonBlock isInset className="h-7 w-56" />
            <SkeletonBlock isInset className="h-4 w-80" />
          </div>
          <SkeletonBlock isInset className="h-8 w-64" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <SkeletonBlock className="h-96 border border-line lg:h-auto lg:w-104" />
        <SkeletonBlock className="h-96 flex-1 border border-line lg:h-auto" />
      </div>
    </div>
  );
}
