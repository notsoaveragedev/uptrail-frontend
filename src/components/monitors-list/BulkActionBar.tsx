import { Button, Dropdown } from "antd";
import { LuFolderInput, LuPause, LuPlay, LuTag, LuTrash2, LuX } from "react-icons/lu";
import { useParams } from "react-router";
import { useMonitorChange } from "@/api/monitors";
import { CountBadge } from "@/components/ui/CountBadge";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { PROJECT_OPTIONS, TAGS } from "@/lib/monitors";
import type { MonitorChange } from "@/types/monitor";

type BulkActionBarProps = {
  selectedIds: string[];
  onClear: () => void;
};

const plural = (count: number) => `${count} monitor${count === 1 ? "" : "s"}`;

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const { changeWithUndo } = useMonitorChange(orgSlug);
  const count = selectedIds.length;

  useWindowKeydown((event) => {
    if (event.key === "Escape" && count > 0) onClear();
  });

  if (count === 0) return null;

  function runWithUndo(message: string, change: MonitorChange) {
    const undo = changeWithUndo(change);
    toast.success(message, plural(count), { label: "Undo", onClick: undo });
    onClear();
  }

  async function remove() {
    const isConfirmed = await confirm({
      title: `Delete ${plural(count)}?`,
      description: "Their check history, alert rules and status page components will be removed.",
      confirmLabel: "Delete",
      isDanger: true,
    });
    if (isConfirmed) runWithUndo("Monitors deleted", { action: "delete", ids: selectedIds });
  }

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-line-strong bg-tooltip p-1.5 shadow-overlay lg:left-[calc(50%+7.5rem)]"
    >
      <span className="flex items-center gap-2 px-2 text-muted">
        <CountBadge count={count} />
        selected
      </span>
      <span className="mx-1 h-5 w-px bg-line" />
      <Button
        type="text"
        icon={<LuPause />}
        onClick={() => runWithUndo("Monitors paused", { action: "pause", ids: selectedIds })}
      >
        Pause
      </Button>
      <Button
        type="text"
        icon={<LuPlay />}
        onClick={() => runWithUndo("Monitors resumed", { action: "resume", ids: selectedIds })}
      >
        Resume
      </Button>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: PROJECT_OPTIONS.map((project) => ({ key: project.value, label: project.label })),
          onClick: ({ key }) => runWithUndo("Moved to project", { action: "move", ids: selectedIds, project: key }),
        }}
      >
        <Button type="text" icon={<LuFolderInput />}>
          Move to project
        </Button>
      </Dropdown>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: TAGS.map((tag) => ({ key: tag, label: tag })),
          onClick: ({ key }) => runWithUndo(`Tagged ${key}`, { action: "tag", ids: selectedIds, tag: key }),
        }}
      >
        <Button type="text" icon={<LuTag />}>
          Add tag
        </Button>
      </Dropdown>
      <span className="mx-1 h-5 w-px bg-line" />
      <Button type="text" danger icon={<LuTrash2 />} onClick={remove}>
        Delete
      </Button>
      <kbd className="kbd ml-1">Esc</kbd>
      <Button type="text" aria-label="Clear selection" icon={<LuX />} onClick={onClear} />
    </div>
  );
}
