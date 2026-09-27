function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-card ${className}`} />;
}

export function OverviewSkeleton() {
  return (
    <div aria-busy aria-label="Loading overview" className="flex flex-col gap-6">
      <Block className="h-12 w-96" />
      <div className="grid gap-3 xl:grid-cols-4">
        <Block className="h-36" />
        <Block className="h-36" />
        <Block className="h-36" />
        <Block className="h-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Block className="h-34" />
        <Block className="h-34" />
        <Block className="h-34" />
        <Block className="h-34" />
      </div>
      <Block className="h-96" />
    </div>
  );
}
