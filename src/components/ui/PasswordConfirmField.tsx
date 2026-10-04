import type { ReactNode } from "react";
import { CustomInput } from "./CustomInput";

type PasswordConfirmFieldProps = {
  description: ReactNode;
  onChange: (password: string) => void;
};

export function PasswordConfirmField({ description, onChange }: PasswordConfirmFieldProps) {
  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="text-muted">{description}</div>
      <CustomInput
        label="Current password"
        type="password"
        size="middle"
        autoFocus
        autoComplete="current-password"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
