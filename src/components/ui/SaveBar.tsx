import { Button } from "antd";

type SaveBarProps = {
  isVisible: boolean;
  summary: string;
  saveLabel?: string;
  isSaving?: boolean;
  onDiscard: () => void;
  onSave?: () => void;
  formId?: string;
};

export function SaveBar({
  isVisible,
  summary,
  saveLabel = "Save changes",
  isSaving,
  onDiscard,
  onSave,
  formId,
}: SaveBarProps) {
  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className="sticky bottom-4 z-30 flex items-center gap-3 rounded-lg border border-line-strong bg-tooltip py-2 pr-2 pl-4 shadow-overlay"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      <span className="flex-1 text-muted">{summary}</span>
      <Button type="text" onClick={onDiscard}>
        Discard
      </Button>
      <Button type="primary" htmlType={formId ? "submit" : "button"} form={formId} loading={isSaving} onClick={onSave}>
        {saveLabel}
      </Button>
    </div>
  );
}
