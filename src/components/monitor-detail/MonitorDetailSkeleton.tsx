function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-card ${className}`} />;
}

export function MonitorDetailSkeleton() {
  return (
    <div aria-busy aria-label="Loading monitor" className="flex flex-col gap-4">
      <Block className="h-4 w-48" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Block className="h-7 w-80" />
          <Block className="h-4 w-md" />
        </div>
        <Block className="h-8 w-80" />
      </div>
      <Block className="h-9 w-96" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }, (_, index) => (
          <Block key={index} className="h-22" />
        ))}
      </div>
      <Block className="h-96" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Block className="h-64" />
        <Block className="h-64" />
      </div>
    </div>
  );
}
