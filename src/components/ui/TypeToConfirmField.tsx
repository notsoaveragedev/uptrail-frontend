import { useState, type ReactNode } from "react";
import { CustomInput } from "./CustomInput";

type TypeToConfirmFieldProps = {
  expected: string;
  description: ReactNode;
  consequences?: string[];
  onMatchChange: (isMatch: boolean) => void;
};

export function TypeToConfirmField({
  expected,
  description,
  consequences = [],
  onMatchChange,
}: TypeToConfirmFieldProps) {
  const [value, setValue] = useState("");

  function change(next: string) {
    setValue(next);
    onMatchChange(next === expected);
  }

  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="text-muted">{description}</div>
      {consequences.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-md border border-down/40 bg-down-soft/40 px-3 py-2.5 text-xs text-ink">
          {consequences.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className="text-down">
                ×
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
      <CustomInput
        size="middle"
        autoFocus
        autoComplete="off"
        label={`Type ${expected} to confirm`}
        value={value}
        onChange={(event) => change(event.target.value)}
        className="font-mono"
      />
    </div>
  );
}
