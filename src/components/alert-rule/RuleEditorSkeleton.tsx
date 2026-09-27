import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export function RuleEditorSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <title>Alert rule · Uptrail</title>
      <div className="flex flex-col gap-3">
        <SkeletonBlock isInset className="h-4 w-48" />
        <SkeletonBlock isInset className="h-7 w-72" />
        <SkeletonBlock isInset className="h-4 w-80" />
      </div>
      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <SkeletonBlock className="h-160 w-full border border-line xl:flex-1" />
        <SkeletonBlock className="h-100 w-full border border-line xl:w-104" />
      </div>
    </div>
  );
}
