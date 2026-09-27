import { Input } from "antd";
import { useId } from "react";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import { FieldShell } from "@/components/ui/FieldShell";
import { jsonError, type MonitorFieldProps } from "@/lib/monitorForm";

export function BodyEditor({ values, errors, onChange }: MonitorFieldProps) {
  const bodyId = useId();
  const messageId = `${bodyId}-message`;
  const lineCount = Math.max(values.body.split("\n").length, 4);
  const parseError = jsonError(values.body);
  const error = errors.body;

  return (
    <FieldShell
      label="Request body"
      htmlFor={bodyId}
      error={error}
      messageId={messageId}
      labelAction={values.body.trim() && !error ? <JsonStatus parseError={parseError} /> : undefined}
    >
      <div
        className={`flex overflow-hidden rounded-md border bg-canvas font-mono text-xs leading-5 transition-colors focus-within:border-subtle ${
          error ? "border-down" : "border-line-strong hover:border-line-strong"
        }`}
      >
        <div aria-hidden className="shrink-0 py-2.5 pr-3 pl-2 text-right text-faint select-none">
          {Array.from({ length: lineCount }, (_, index) => (
            <div key={index} className="min-w-5">
              {index + 1}
            </div>
          ))}
        </div>
        <Input.TextArea
          id={bodyId}
          variant="borderless"
          value={values.body}
          onChange={(event) => onChange({ body: event.target.value })}
          placeholder={'{\n  "key": "value"\n}'}
          autoSize={{ minRows: 4 }}
          wrap="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? messageId : undefined}
          className="resize-none rounded-none px-0 py-2.5 font-mono text-xs leading-5"
        />
      </div>
    </FieldShell>
  );
}

function JsonStatus({ parseError }: { parseError: string | null }) {
  if (parseError) {
    return (
      <span className="flex min-w-0 items-center gap-1.5 text-xs text-down">
        <LuCircleAlert aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">{parseError}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-up">
      <LuCircleCheck aria-hidden className="size-3.5" />
      Valid JSON
    </span>
  );
}
