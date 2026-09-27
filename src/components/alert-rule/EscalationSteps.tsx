import { Button, InputNumber } from "antd";
import { useId, type ReactNode } from "react";
import { LuArrowRight, LuPlus, LuX } from "react-icons/lu";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { newEscalationStep, type EscalationDraft } from "./ruleFormUtils";

type EscalationStepsProps = {
  steps: EscalationDraft[];
  channelOptions: { value: string; label: ReactNode }[];
  error?: string;
  onChange: (steps: EscalationDraft[]) => void;
};

export function EscalationSteps({ steps, channelOptions, error, onChange }: EscalationStepsProps) {
  const labelId = useId();

  function updateStep(id: string, patch: Partial<EscalationDraft>) {
    onChange(steps.map((step) => (step.id === id ? { ...step, ...patch } : step)));
  }

  function addStep() {
    const lastDelay = steps.at(-1)?.afterMinutes ?? 0;
    onChange([...steps, newEscalationStep(lastDelay + 15)]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span id={labelId} className="font-medium text-ink">
          Escalation
        </span>
        <span className="text-xs text-muted">If nobody acknowledges, notify the next channels</span>
      </div>

      {steps.length > 0 && (
        <ol aria-labelledby={labelId} className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-hover font-mono text-caps text-muted">
                {index + 1}
              </span>
              <span className="text-muted">After</span>
              <InputNumber<number>
                aria-label={`Step ${index + 1} delay in minutes`}
                value={step.afterMinutes}
                min={1}
                controls={false}
                onChange={(afterMinutes) => updateStep(step.id, { afterMinutes: afterMinutes ?? 0 })}
                suffix={<span className="font-mono text-xs text-subtle">min</span>}
                className="w-24 shrink-0 font-mono"
              />
              <LuArrowRight aria-hidden className="shrink-0 text-subtle" />
              <div className="min-w-0 flex-1">
                <CustomSelect<string[]>
                  mode="multiple"
                  size="middle"
                  aria-label={`Step ${index + 1} channels`}
                  placeholder="Pick channels"
                  value={step.channelIds}
                  onChange={(channelIds) => updateStep(step.id, { channelIds })}
                  options={channelOptions}
                />
              </div>
              <Button
                type="text"
                size="small"
                aria-label={`Remove step ${index + 1}`}
                icon={<LuX />}
                onClick={() => onChange(steps.filter((item) => item.id !== step.id))}
                className="text-subtle"
              />
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p role="alert" className="text-xs text-down">
          {error}
        </p>
      )}

      <Button type="link" icon={<LuPlus />} onClick={addStep} className="self-start px-1">
        Add step
      </Button>
    </div>
  );
}
