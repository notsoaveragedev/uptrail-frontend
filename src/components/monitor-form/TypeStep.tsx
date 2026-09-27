import { MONITOR_TYPES, type MonitorFieldProps } from "@/lib/monitorForm";

export function TypeStep({ values, onChange }: MonitorFieldProps) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Monitor type</legend>
      {MONITOR_TYPES.map(({ value, label, description, icon: Icon }) => {
        const isSelected = values.type === value;
        return (
          <label
            key={value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
              isSelected ? "border-muted bg-hover" : "border-line hover:border-line-strong"
            }`}
          >
            <input
              type="radio"
              name="monitor-type"
              value={value}
              checked={isSelected}
              onChange={() => onChange({ type: value })}
              className="sr-only"
            />
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-md border ${
                isSelected ? "border-line-strong bg-card text-ink" : "border-line text-muted"
              }`}
            >
              <Icon aria-hidden className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium text-ink">{label}</span>
              <span className="text-xs text-muted">{description}</span>
            </span>
            <span
              aria-hidden
              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${
                isSelected ? "border-ink" : "border-line-strong"
              }`}
            >
              {isSelected && <span className="size-2 rounded-full bg-ink" />}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
