import { Switch } from "antd";
import { useId, type ReactNode } from "react";

type SwitchFieldProps = {
  name?: string;
  label: string;
  hint?: ReactNode;
  icon?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SwitchField({ name, label, hint, icon, checked, onChange }: SwitchFieldProps) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex min-w-0 flex-col">
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 font-medium text-ink">
          {icon}
          {label}
        </label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      <Switch id={id} size="small" checked={checked} onChange={onChange} />
      {name && checked && <input type="hidden" name={name} value="on" />}
    </div>
  );
}
