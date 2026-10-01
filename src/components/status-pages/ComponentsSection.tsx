import { Button } from "antd";
import { LuPlus } from "react-icons/lu";
import { useConfirm } from "@/hooks/useConfirm";
import {
  addGroup,
  monitorsInOtherGroups,
  moveComponentToGroup,
  removeComponent,
  removeGroup,
  renameGroup,
  setGroupMonitors,
  updateComponent,
} from "@/lib/statusPages";
import type { Monitor } from "@/types/monitor";
import type { StatusGroupConfig, StatusPage } from "@/types/statusPage";
import { ComponentGroup } from "./ComponentGroup";
import { useComponentReorder } from "./useComponentReorder";

type ComponentsSectionProps = {
  page: StatusPage;
  monitors: Monitor[];
  onChange: (page: StatusPage) => void;
};

export function ComponentsSection({ page, monitors, onChange }: ComponentsSectionProps) {
  const confirm = useConfirm();
  const reorder = useComponentReorder(page, onChange);
  const projectMonitors = monitors.filter((monitor) => monitor.project === page.project);

  async function deleteGroup(group: StatusGroupConfig) {
    const count = group.components.length;
    if (count > 0) {
      const isConfirmed = await confirm({
        title: `Delete ${group.name || "this group"}?`,
        description: `Its ${count} ${count === 1 ? "component is" : "components are"} removed from the page. The monitors keep running.`,
        confirmLabel: "Delete group",
        isDanger: true,
      });
      if (!isConfirmed) return;
    }
    onChange(removeGroup(page, group.id));
  }

  return (
    <div className="flex flex-col gap-3">
      {page.groups.map((group) => {
        const taken = monitorsInOtherGroups(page, group.id);
        return (
          <ComponentGroup
            key={group.id}
            group={group}
            otherGroups={page.groups.filter((other) => other.id !== group.id)}
            monitors={monitors}
            availableMonitors={projectMonitors.filter((monitor) => !taken.includes(monitor.id))}
            reorder={reorder}
            onRename={(name) => onChange(renameGroup(page, group.id, name))}
            onRemove={() => deleteGroup(group)}
            onSetMonitors={(ids) => onChange(setGroupMonitors(page, group.id, ids, projectMonitors))}
            onUpdateComponent={(monitorId, patch) => onChange(updateComponent(page, group.id, monitorId, patch))}
            onMoveComponent={(monitorId, groupId) => onChange(moveComponentToGroup(page, monitorId, group.id, groupId))}
            onRemoveComponent={(monitorId) => onChange(removeComponent(page, group.id, monitorId))}
          />
        );
      })}
      <Button icon={<LuPlus />} onClick={() => onChange(addGroup(page))} className="self-start">
        Group
      </Button>
      <p id={reorder.instructionsId} className="sr-only">
        Press Space to pick up, the arrow keys to move, and Space again to drop.
      </p>
      <p aria-live="assertive" className="sr-only">
        {reorder.announcement}
      </p>
    </div>
  );
}
