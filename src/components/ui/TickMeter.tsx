type TickMeterProps = {
  value: number;
  total: number;
  fillClassName: string;
  label: string;
};

export function TickMeter({ value, total, fillClassName, label }: TickMeterProps) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      className="flex gap-0.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={`h-3 w-0.75 rounded-[1px] ${index < value ? fillClassName : "bg-line-strong"}`} />
      ))}
    </div>
  );
}
