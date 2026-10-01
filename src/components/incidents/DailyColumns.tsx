import { useId } from "react";

type DailyColumnsProps = {
  values: (number | null)[];
  mean: number;
  label: string;
  activeIndex: number | null;
  onActiveChange: (index: number | null) => void;
};

const COLUMN = 10;
const GAP = 3;
const HEIGHT = 48;
const CAP = 2;

export function DailyColumns({ values, mean, label, activeIndex, onActiveChange }: DailyColumnsProps) {
  const gradientId = useId();
  const activeGradientId = useId();
  const max = Math.max(mean, ...values.map((value) => value ?? 0)) * 1.1 || 1;
  const toY = (value: number) => HEIGHT - (value / max) * (HEIGHT - CAP);
  const width = values.length * (COLUMN + GAP) - GAP;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="h-12 w-full text-series-1"
      onMouseLeave={() => onActiveChange(null)}
    >
      <defs>
        <Gradient id={gradientId} from={0.18} to={0.02} />
        <Gradient id={activeGradientId} from={0.45} to={0.1} />
      </defs>
      {values.map((value, index) => {
        const x = index * (COLUMN + GAP);
        const isActive = index === activeIndex;
        return (
          <g key={index} onMouseEnter={() => onActiveChange(index)}>
            <rect x={x} y={0} width={COLUMN + GAP} height={HEIGHT} fill="transparent" />
            {value !== null && value > 0 && (
              <>
                <rect
                  x={x}
                  y={toY(value)}
                  width={COLUMN}
                  height={HEIGHT - toY(value)}
                  fill={`url(#${isActive ? activeGradientId : gradientId})`}
                />
                <rect x={x} y={toY(value)} width={COLUMN} height={CAP} fill="currentColor" />
              </>
            )}
          </g>
        );
      })}
      <line
        x1={0}
        x2={width}
        y1={toY(mean)}
        y2={toY(mean)}
        stroke="var(--muted)"
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Gradient({ id, from, to }: { id: string; from: number; to: number }) {
  return (
    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="currentColor" stopOpacity={from} />
      <stop offset="100%" stopColor="currentColor" stopOpacity={to} />
    </linearGradient>
  );
}
