import { Input, type InputProps } from "antd";
import { useId, type ReactNode } from "react";
import { LuSearch } from "react-icons/lu";
import { FieldShell } from "./FieldShell";

type CustomInputProps = Omit<InputProps, "type" | "status"> & {
  label?: string;
  type?: "text" | "email" | "password" | "search";
  error?: string | null;
  hint?: ReactNode;
  labelAction?: ReactNode;
};

export function CustomInput({
  label,
  type = "text",
  error,
  hint,
  labelAction,
  id,
  size = "large",
  ...props
}: CustomInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  const inputProps = {
    ...props,
    id: inputId,
    size,
    status: error ? ("error" as const) : undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? messageId : undefined,
  };

  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      labelAction={labelAction}
      error={error}
      hint={hint}
      messageId={messageId}
    >
      {type === "password" && <Input.Password {...inputProps} />}
      {type === "search" && (
        <Input {...inputProps} type="search" prefix={<LuSearch className="text-subtle" />} allowClear />
      )}
      {type !== "password" && type !== "search" && <Input {...inputProps} type={type} />}
    </FieldShell>
  );
}
