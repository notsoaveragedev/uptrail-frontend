import { ONBOARDING_STEPS } from "@/lib/onboarding";

const SECONDS_PER_STEP = 20;

export function ProgressTrail({ current, skipped }: { current: number; skipped: string[] }) {
  const left = (ONBOARDING_STEPS.length - current) * SECONDS_PER_STEP;

  return (
    <div className="flex items-center gap-3">
      <div
        role="meter"
        aria-label="Setup progress"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={ONBOARDING_STEPS.length}
        className="flex gap-1"
      >
        {ONBOARDING_STEPS.map((step, index) => (
          <span
            key={step.key}
            className={`h-1.5 w-6 rounded-full ${
              index === current
                ? "bg-accent"
                : index < current
                  ? skipped.includes(step.key)
                    ? "bg-line-strong"
                    : "bg-ink"
                  : "bg-line"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-subtle">
        {Math.min(current + 1, ONBOARDING_STEPS.length)}/{ONBOARDING_STEPS.length} · about {left} s left
      </span>
    </div>
  );
}
