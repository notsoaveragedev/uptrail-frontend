import { Modal } from "antd";
import { LuArrowRight } from "react-icons/lu";
import type { FieldChange } from "@/lib/monitorForm";

type ChangeSummaryModalProps = {
  open: boolean;
  changes: FieldChange[];
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ChangeSummaryModal({ open, changes, isSaving, onConfirm, onCancel }: ChangeSummaryModalProps) {
  return (
    <Modal
      open={open}
      title="Review changes"
      okText="Save changes"
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={isSaving}
      width="36rem"
    >
      <p className="mb-4 text-muted">
        {changes.length} {changes.length === 1 ? "field changes" : "fields change"}. The new config applies from the
        next check.
      </p>
      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
        {changes.map((change) => (
          <li key={change.label} className="flex flex-col gap-1.5 px-3.5 py-3">
            <span className="text-caps font-semibold tracking-wider text-subtle uppercase">{change.label}</span>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 font-mono text-xs">
              <span className="break-all whitespace-pre-line text-muted line-through decoration-faint">
                {change.before}
              </span>
              <LuArrowRight aria-label="changes to" className="mt-0.5 size-3.5 text-subtle" />
              <span className="break-all whitespace-pre-line text-ink">{change.after}</span>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
