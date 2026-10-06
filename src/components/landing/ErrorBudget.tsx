import { TickMeter } from "@/components/ui/TickMeter";
import { ERROR_BUDGET } from "@/lib/landing";

const TICKS = 40;

export function ErrorBudget() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-display font-medium tracking-tight">
          {ERROR_BUDGET.remaining}
          <span className="ml-1 text-xs text-subtle">% left</span>
        </p>
        <span className="font-mono text-xs text-subtle">SLO {ERROR_BUDGET.slo}</span>
      </div>
      <TickMeter
        value={Math.round((ERROR_BUDGET.remaining / 100) * TICKS)}
        total={TICKS}
        fillClassName="bg-accent"
        label="Error budget left"
      />
      <p className="font-mono text-xs text-subtle">
        {ERROR_BUDGET.used} of {ERROR_BUDGET.total} used this month
      </p>
    </div>
  );
}
