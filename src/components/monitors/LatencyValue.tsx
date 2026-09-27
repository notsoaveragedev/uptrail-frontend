import { formatLatency } from "@/lib/format";

type LatencyValueProps = {
  ms: number;
  tone?: string;
  className?: string;
};

export function LatencyValue({ ms, tone = "text-ink", className = "" }: LatencyValueProps) {
  const { value, unit } = formatLatency(ms);
  return (
    <span className={`font-mono ${tone} ${className}`}>
      {value}
      <span className="ml-0.5 text-xs text-subtle">{unit}</span>
    </span>
  );
}
