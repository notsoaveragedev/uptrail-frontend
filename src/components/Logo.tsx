const DIAMONDS = [
  [3, 7.5],
  [12, 7.5],
  [21, 7.5],
  [7.5, 12],
  [16.5, 12],
  [12, 16.5],
];

const SIDE = 3.8;

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-ink">
      <svg aria-hidden viewBox="0 3 24 18" className="h-4.5 w-6 text-accent" fill="currentColor">
        {DIAMONDS.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x - SIDE / 2}
            y={y - SIDE / 2}
            width={SIDE}
            height={SIDE}
            rx={0.7}
            transform={`rotate(45 ${x} ${y})`}
          />
        ))}
      </svg>
      <span className="text-md font-semibold tracking-tight">uptrail</span>
    </span>
  );
}
