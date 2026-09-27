type LoaderProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const SIZES = {
  sm: { box: "h-3 gap-0.5", tick: "w-0.5" },
  md: { box: "h-4 gap-0.75", tick: "w-0.75" },
  lg: { box: "h-8 gap-1.5", tick: "w-1.5" },
};

const TICKS = [0, 1, 2, 3, 4];

export function Loader({ size = "md", label = "Loading", className = "text-muted" }: LoaderProps) {
  const { box, tick } = SIZES[size];

  return (
    <span role="status" className={`inline-flex w-auto items-center ${box} ${className}`}>
      {TICKS.map((index) => (
        <span
          key={index}
          aria-hidden
          className={`h-full animate-tick rounded-full bg-current ${tick}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
