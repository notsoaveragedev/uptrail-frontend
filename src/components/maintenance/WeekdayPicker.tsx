import { WEEKDAYS } from "@/lib/maintenance";
import { toggleItem } from "@/lib/list";

type WeekdayPickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
  labelId: string;
};

export function WeekdayPicker({ value, onChange, labelId }: WeekdayPickerProps) {
  return (
    <div role="group" aria-labelledby={labelId} className="flex gap-1">
      {WEEKDAYS.map((day, index) => {
        const key = String(index);
        const isOn = value.includes(key);
        return (
          <button
            key={day}
            type="button"
            aria-pressed={isOn}
            onClick={() => onChange(toggleItem(value, key))}
            className={`h-8 w-10 cursor-pointer rounded-md border text-xs font-medium transition-colors ${isOn ? "border-line-strong bg-hover text-ink" : "border-line text-muted hover:border-line-strong"}`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
