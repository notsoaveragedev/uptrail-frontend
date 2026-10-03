type DayHeaderProps = { label: string; count?: number; className?: string };

export function DayHeader({ label, count, className = "" }: DayHeaderProps) {
  return (
    <h3
      className={`sticky top-0 z-20 flex items-center gap-2 bg-card/95 px-4 py-1.5 text-caps font-semibold tracking-widest text-subtle uppercase backdrop-blur-sm ${className}`}
    >
      {label}
      {count !== undefined && <span className="font-mono font-normal">{count}</span>}
    </h3>
  );
}
