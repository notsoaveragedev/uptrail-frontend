type SparklineProps = {
  values: number[];
  className?: string;
};

const WIDTH = 56;
const HEIGHT = 18;

export function Sparkline({ values, className = "text-subtle" }: SparklineProps) {
  const max = Math.max(...values) * 1.1;
  const points = values
    .map(
      (value, index) =>
        `${((index * WIDTH) / (values.length - 1)).toFixed(1)},${(HEIGHT - 1 - (value / max) * (HEIGHT - 3)).toFixed(1)}`,
    )
    .join(" ");

  return (
    <svg aria-hidden viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={`h-4.5 w-14 ${className}`} fill="none">
      <polyline points={points} stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}
