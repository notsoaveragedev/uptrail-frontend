import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { PublicShell } from "./PublicShell";

const ROWS = [0, 1, 2];

export function StatusPageSkeleton() {
  return (
    <PublicShell>
      <span role="status" className="sr-only">
        Loading status
      </span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBlock isInset className="size-8" />
          <SkeletonBlock isInset className="h-6 w-36" />
        </div>
        <SkeletonBlock isInset className="h-8 w-44" />
      </div>
      <SkeletonBlock isInset className="h-14" />
      <div className="flex flex-col rounded-lg border border-line bg-card">
        <SkeletonBlock isInset className="m-4 h-5 w-32" />
        {ROWS.map((row) => (
          <div key={row} className="flex flex-col gap-2.5 border-t border-line px-4 py-3.5">
            <SkeletonBlock isInset className="h-5 w-40" />
            <SkeletonBlock isInset className="h-8" />
          </div>
        ))}
      </div>
    </PublicShell>
  );
}
