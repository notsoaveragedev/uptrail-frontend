import { LuCheck } from "react-icons/lu";
import { STEPS } from "@/lib/monitorForm";

type StepRailProps = {
  current: number;
  furthest: number;
  onSelect: (index: number) => void;
};

export function StepRail({ current, furthest, onSelect }: StepRailProps) {
  return (
    <nav aria-label="Wizard steps" className="hidden w-52 shrink-0 border-r border-line px-4 py-5 md:block">
      <ol className="flex flex-col gap-0.5">
        {STEPS.map((step, index) => {
          const isCurrent = index === current;
          const isDone = !isCurrent && index < furthest;
          return (
            <li key={step.key}>
              <button
                type="button"
                disabled={!isDone}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelect(index)}
                className={`flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-left transition-colors ${
                  isCurrent
                    ? "bg-hover font-medium text-ink"
                    : isDone
                      ? "cursor-pointer text-muted hover:bg-hover hover:text-ink"
                      : "text-subtle"
                }`}
              >
                <StepMark index={index} isCurrent={isCurrent} isDone={isDone} />
                {step.label}
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
