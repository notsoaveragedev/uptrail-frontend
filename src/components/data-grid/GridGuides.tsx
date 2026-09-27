type ResizeGuideProps = { x: number; widthPx: number };

export function ResizeGuide({ x, widthPx }: ResizeGuideProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-ink"
      style={{ left: `${x}rem` }}
    >
      <span className="absolute top-1.5 left-2 rounded-sm bg-tooltip px-1.5 py-0.5 font-mono text-caps whitespace-nowrap text-ink shadow-overlay">
        {Math.round(widthPx)} px
      </span>
    </div>
  );
}

export function DropIndicator({ x }: { x: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-ink"
      style={{ left: `${x}rem` }}
    />
  );
}
