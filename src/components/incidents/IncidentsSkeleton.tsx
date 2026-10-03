import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

const COLUMNS = ["w-4", "w-12", "flex-1", "w-14", "w-20", "w-32", "w-14", "w-6", "w-12"];

export function IncidentsSkeleton() {
  return (
    <div aria-busy aria-label="Loading incidents" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SkeletonBlock isInset className="h-7 w-36" />
        <SkeletonBlock isInset className="h-4 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-40 border border-line" />
        <SkeletonBlock className="h-40 border border-line" />
      </div>
      <SkeletonBlock isInset className="h-8 w-96" />
      <TableSkeleton columns={COLUMNS} />
    </div>
  );
}
