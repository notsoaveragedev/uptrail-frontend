import { Select, type SelectProps } from "antd";
import { useId, type ReactNode } from "react";
import { FieldShell } from "./FieldShell";

type CustomSelectProps<Value> = Omit<SelectProps<Value>, "status"> & {
  label?: string;
  error?: string | null;
  hint?: ReactNode;
  labelAction?: ReactNode;
};

export function CustomSelect<Value>({
  label,
  error,
  hint,
  labelAction,
  id,
  size = "large",
  className = "w-full",
  ...props
}: CustomSelectProps<Value>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;

  return (
    <FieldShell
      label={label}
      htmlFor={selectId}
      labelAction={labelAction}
      error={error}
      hint={hint}
      messageId={messageId}
    >
      <Select<Value>
        {...props}
        id={selectId}
        size={size}
        className={className}
        status={error ? "error" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
      />
    </FieldShell>
  );
}
