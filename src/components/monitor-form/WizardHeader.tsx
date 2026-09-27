import { Button, Tooltip } from "antd";
import { LuCloud, LuX } from "react-icons/lu";
import { formatTime } from "@/lib/format";
import { STEPS } from "@/lib/monitorForm";

type WizardHeaderProps = {
  step: number;
  savedAt: number | null;
  onClose: () => void;
};

export function WizardHeader({ step, savedAt, onClose }: WizardHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-line px-5 py-4">
      <div className="flex flex-1 flex-col gap-0.5">
        <h1 tabIndex={-1} className="text-md font-semibold outline-none">
          New monitor
        </h1>
        <span className="text-xs text-muted">
          Step {step + 1} of {STEPS.length} · {STEPS[step].label}
        </span>
      </div>
      {savedAt && (
        <span role="status" className="flex items-center gap-1.5 text-xs text-muted">
          <LuCloud aria-hidden className="size-3.5" />
          Draft saved ·{" "}
          <time dateTime={new Date(savedAt).toISOString()} className="font-mono">
            {formatTime(savedAt)}
          </time>
        </span>
      )}
      <Tooltip title="Close wizard">
        <Button aria-label="Close wizard" icon={<LuX />} onClick={onClose} />
      </Tooltip>
    </header>
  );
}
