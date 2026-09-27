import { useState } from "react";
import { CustomInput } from "@/components/ui/CustomInput";
import { TickMeter } from "@/components/ui/TickMeter";
import { getPasswordStrength } from "@/lib/password";

const STRENGTH_FILLS = ["bg-down", "bg-down", "bg-degraded", "bg-degraded", "bg-up"];

type NewPasswordFieldProps = {
  label: string;
  error?: string;
};

export function NewPasswordField({ label, error }: NewPasswordFieldProps) {
  const [password, setPassword] = useState("");
  const { score, label: strength } = getPasswordStrength(password);

  return (
    <CustomInput
      label={label}
      name="password"
      type="password"
      autoComplete="new-password"
      error={error}
      onChange={(event) => setPassword(event.target.value)}
      hint={
        <div className="flex items-center gap-3">
          <TickMeter value={score * 3} total={12} fillClassName={STRENGTH_FILLS[score]} label="Password strength" />
          <span aria-live="polite">{password ? strength : "8+ characters, upper and lowercase, a number"}</span>
        </div>
      }
    />
  );
}
