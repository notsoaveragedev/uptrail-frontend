import type { ReactNode } from "react";
import { LuCheck } from "react-icons/lu";

type Step = { key: string; label: string; hint?: ReactNode };

type StepRailProps = {
  steps: readonly Step[];
  current: number;
  furthest: number;
  label: string;
  onSelect: (index: number) => void;
  className?: string;
};

export function StepRail({ steps, current, furthest, label, onSelect, className = "" }: StepRailProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-col gap-0.5">
        {steps.map((step, index) => {
          const isCurrent = index === current;
          const isDone = !isCurrent && index < furthest;
          const isReachable = !isCurrent && index <= furthest;
          return (
            <li key={step.key}>
              <button
                type="button"
                disabled={!isReachable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelect(index)}
                className={`flex min-h-10 w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
                  isCurrent
                    ? "bg-hover font-medium text-ink"
                    : isReachable
                      ? "cursor-pointer text-muted hover:bg-hover hover:text-ink"
                      : "text-subtle"
                }`}
              >
                <StepMark index={index} isCurrent={isCurrent} isDone={isDone} />
                <span className="flex min-w-0 flex-col">
                  {step.label}
                  {step.hint && <span className="truncate font-mono text-xs font-normal text-subtle">{step.hint}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepMark({ index, isCurrent, isDone }: { index: number; isCurrent: boolean; isDone: boolean }) {
  if (isDone) {
    return (
      <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-ink text-canvas">
        <LuCheck aria-label="Done" className="size-3" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span
      className={`grid size-5.5 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold ${
        isCurrent ? "border-ink text-ink" : "border-line-strong text-subtle"
      }`}
    >
      {index + 1}
    </span>
  );
}
