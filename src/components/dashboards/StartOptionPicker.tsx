import { START_OPTIONS } from "@/lib/dashboards";
import { StartOptionCard } from "./StartOptionCard";

type StartOptionPickerProps = {
  value: string;
  onChange: (templateId: string) => void;
};

export function StartOptionPicker({ value, onChange }: StartOptionPickerProps) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 font-medium text-ink">Start from</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {START_OPTIONS.map((option) => {
          const isSelected = option.id === value;
          return (
            <label
              key={option.id}
              className={`cursor-pointer rounded-lg border p-2.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                isSelected ? "border-muted bg-hover" : "border-line hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="template"
                value={option.id}
                checked={isSelected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              <StartOptionCard option={option} isSelected={isSelected} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
