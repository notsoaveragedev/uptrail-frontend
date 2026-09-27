import { LuCheck } from "react-icons/lu";

type ImportStepsProps = {
  steps: { key: string; label: string }[];
  current: string;
};

export function ImportSteps({ steps, current }: ImportStepsProps) {
  const currentIndex = steps.findIndex((step) => step.key === current);

  return (
    <ol aria-label="Import steps" className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.key} aria-current={isCurrent ? "step" : undefined} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden className={`h-px w-6 ${isDone || isCurrent ? "bg-ink" : "bg-line-strong"}`} />
            )}
            <span className="flex items-center gap-2">
              <span
                className={`flex size-5 items-center justify-center rounded-full border font-mono text-caps ${
                  isDone
                    ? "border-ink bg-ink text-canvas"
                    : isCurrent
                      ? "border-ink text-ink"
                      : "border-line-strong text-subtle"
                }`}
              >
                {isDone ? <LuCheck aria-hidden className="size-3" /> : index + 1}
              </span>
              <span className={isCurrent ? "font-medium text-ink" : isDone ? "text-muted" : "text-subtle"}>
                {step.label}
                {isDone && <span className="sr-only"> (done)</span>}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
