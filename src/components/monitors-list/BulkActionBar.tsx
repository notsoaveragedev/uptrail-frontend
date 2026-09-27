import { Button, Dropdown } from "antd";
import { LuFolderInput, LuPause, LuPlay, LuTag, LuTrash2 } from "react-icons/lu";
import { useParams } from "react-router";
import { useMonitorChange } from "@/api/monitors";
import { SelectionBar, SelectionBarDivider } from "@/components/ui/SelectionBar";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
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
    <SelectionBar count={count} onClear={onClear}>
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
      <SelectionBarDivider />
      <Button type="text" danger icon={<LuTrash2 />} onClick={remove}>
        Delete
      </Button>
    </SelectionBar>
  );
}
