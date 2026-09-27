import type { ReactNode } from "react";

type FieldShellProps = {
  label?: string;
  htmlFor?: string;
  labelId?: string;
  labelAction?: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  messageId?: string;
  children: ReactNode;
};

export function FieldShell({
  label,
  htmlFor,
  labelId,
  labelAction,
  error,
  hint,
  messageId,
  children,
}: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {(label || labelAction) && (
        <div className="flex items-center justify-between">
          {label && (
            <label id={labelId} htmlFor={htmlFor} className="font-medium text-ink">
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}

      {children}

      {error && (
        <p id={messageId} role="alert" className="text-xs text-down">
          {error}
        </p>
      )}
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}
