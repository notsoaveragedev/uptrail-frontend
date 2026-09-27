import { Button, Modal } from "antd";
import { LuGitFork } from "react-icons/lu";
import { useNow } from "@/hooks/useNow";
import { editedAgo } from "@/lib/dashboards";
import type { Dashboard } from "@/types/dashboard";

type ConflictModalProps = {
  latest: Dashboard | null;
  baseVersion: number;
  pendingAction: "copy" | "overwrite" | null;
  onOpenTheirs: () => void;
  onSaveCopy: () => void;
  onOverwrite: () => void;
  onClose: () => void;
};

export function ConflictModal({
  latest,
  baseVersion,
  pendingAction,
  onOpenTheirs,
  onSaveCopy,
  onOverwrite,
  onClose,
}: ConflictModalProps) {
  const now = useNow(30_000);

  return (
    <Modal
      open={latest !== null}
      onCancel={onClose}
      width="30rem"
      title={
        <span className="flex items-center gap-2">
          <LuGitFork aria-hidden className="size-4 text-degraded" />
          Someone else saved this dashboard
        </span>
      }
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            danger
            disabled={pendingAction !== null}
            loading={pendingAction === "overwrite"}
            onClick={onOverwrite}
          >
            Overwrite
          </Button>
          <Button disabled={pendingAction !== null} onClick={onOpenTheirs}>
            Open their version
          </Button>
          <Button
            type="primary"
            loading={pendingAction === "copy"}
            disabled={pendingAction !== null}
            onClick={onSaveCopy}
          >
            Save mine as a copy
          </Button>
        </div>
      }
    >
      {latest && (
        <div className="flex flex-col gap-3">
          <p className="text-muted">
            <span className="text-ink">{latest.updatedBy}</span> saved{" "}
            <span className="font-mono text-ink">v{latest.version}</span> {editedAgo(latest.updatedAt, now)}. Your edits
            are based on <span className="font-mono text-ink">v{baseVersion}</span>.
          </p>
          <p className="text-xs text-subtle">
            Saving a copy keeps both versions. Overwriting replaces their changes with yours.
          </p>
        </div>
      )}
    </Modal>
  );
}
