import { Input, Tooltip } from "antd";
import { useRef, useState } from "react";
import { LuCircleAlert } from "react-icons/lu";

type ImportCellProps = {
  label: string;
  line: number;
  value: string;
  error?: string;
  isMono?: boolean;
  onFix: (value: string) => void;
};

export function ImportCell({ label, line, value, error, isMono = false, onFix }: ImportCellProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const isClosed = useRef(false);
  const textClass = isMono ? "font-mono text-xs" : "";

  function startEditing() {
    isClosed.current = false;
    setDraft(value);
  }

  function close(nextValue: string | null) {
    if (isClosed.current) return;
    isClosed.current = true;
    if (nextValue !== null) onFix(nextValue);
    setDraft(null);
  }

  if (draft !== null) {
    return (
      <Input
        autoFocus
        size="small"
        aria-label={`${label}, row ${line}`}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => close(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter") close(draft);
          if (event.key === "Escape") close(null);
        }}
        className={textClass}
      />
    );
  }

  if (!error) {
    return <span className={`block truncate ${textClass} ${value ? "" : "text-subtle"}`}>{value || "—"}</span>;
  }

  return (
    <Tooltip title={`${error} · click to fix`}>
      <button
        type="button"
        onClick={startEditing}
        aria-label={`${label}, row ${line}: ${error}. Edit value ${value || "(empty)"}`}
        className="flex w-full cursor-text items-center gap-1.5 rounded-sm bg-down-soft px-1.5 py-0.5 text-left text-down"
      >
        <LuCircleAlert aria-hidden className="size-3.5 shrink-0" />
        <span className={`truncate ${textClass}`}>{value || "Empty"}</span>
      </button>
    </Tooltip>
  );
}
