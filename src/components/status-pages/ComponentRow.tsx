import { Button, Dropdown, Switch } from "antd";
import { useId } from "react";
import { LuArrowDown, LuArrowUp, LuEllipsis, LuFolderInput, LuX } from "react-icons/lu";
import { CustomInput } from "@/components/ui/CustomInput";
import { RowGrip } from "@/components/ui/RowGrip";
import { StatusDot } from "@/components/ui/StatusDot";
import { STATUS_FILL } from "@/lib/status";
import { componentGripId } from "@/lib/statusPages";
import type { Monitor } from "@/types/monitor";
import type { StatusComponentConfig, StatusGroupConfig } from "@/types/statusPage";
import type { ComponentReorder } from "./useComponentReorder";

type ComponentRowProps = {
  item: StatusComponentConfig;
  group: StatusGroupConfig;
  index: number;
  otherGroups: StatusGroupConfig[];
  monitor: Monitor | undefined;
  reorder: ComponentReorder;
  onUpdate: (patch: Partial<StatusComponentConfig>) => void;
  onMoveToGroup: (groupId: string) => void;
  onRemove: () => void;
};

export function ComponentRow({
  item,
  group,
  index,
  otherGroups,
  monitor,
  reorder,
  onUpdate,
  onMoveToGroup,
  onRemove,
}: ComponentRowProps) {
  const chartId = useId();
  const name = item.displayName || monitor?.name || "component";
  const isPicked = reorder.pickedId === item.monitorId;
  const isDragging = reorder.draggingId === item.monitorId;

  const menuItems = [
    { key: "up", label: "Move up", icon: <LuArrowUp />, disabled: index === 0 },
    { key: "down", label: "Move down", icon: <LuArrowDown />, disabled: index === group.components.length - 1 },
    {
      key: "group",
      label: "Move to group",
      icon: <LuFolderInput />,
      disabled: otherGroups.length === 0,
      children: otherGroups.map((other) => ({ key: `group:${other.id}`, label: other.name || "Untitled group" })),
    },
    { type: "divider" as const },
    { key: "remove", label: "Remove", icon: <LuX />, danger: true },
  ];

  function handleMenu(key: string) {
    if (key === "up" || key === "down") reorder.moveBy(group.id, item, key === "up" ? -1 : 1);
    else if (key === "remove") onRemove();
    else if (key.startsWith("group:")) onMoveToGroup(key.slice("group:".length));
  }

  return (
    <li
      data-node={item.monitorId}
      data-parent={group.id}
      className={`group/row flex items-start gap-1.5 rounded-md py-1.5 pr-1 pl-0.5 ${isPicked || isDragging ? "bg-hover outline outline-1 outline-line-strong outline-dashed" : ""}`}
    >
      <span className="flex h-8 items-center gap-1.5">
        <RowGrip
          id={componentGripId(item.monitorId)}
          label={`Reorder ${name}`}
          isPicked={isPicked}
          describedBy={reorder.instructionsId}
          onPointerDown={(event) => reorder.startDrag(event, item.monitorId)}
          onTogglePick={() => reorder.togglePick(group.id, item)}
          onMove={(offset) => reorder.moveBy(group.id, item, offset)}
        />
        <StatusDot fill={monitor ? STATUS_FILL[monitor.status] : "bg-line-strong"} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <CustomInput
          size="middle"
          aria-label={`Public name for ${monitor?.name ?? "monitor"}`}
          value={item.displayName}
          placeholder={monitor?.name}
          onChange={(event) => onUpdate({ displayName: event.target.value })}
        />
        <span className="truncate px-0.5 font-mono text-xs text-subtle">{monitor?.name ?? "Deleted monitor"}</span>
      </div>
      <span className="flex h-8 items-center gap-1.5">
        <Switch id={chartId} size="small" checked={item.showChart} onChange={(showChart) => onUpdate({ showChart })} />
        <label htmlFor={chartId} className="text-xs text-muted">
          Chart
        </label>
      </span>
      <span className="flex h-8 items-center">
        <Dropdown trigger={["click"]} menu={{ items: menuItems, onClick: ({ key }) => handleMenu(key) }}>
          <Button type="text" size="small" aria-label={`More actions for ${name}`} icon={<LuEllipsis />} />
        </Dropdown>
        <Button
          type="text"
          size="small"
          aria-label={`Remove ${name}`}
          icon={<LuX />}
          onClick={onRemove}
          className="text-subtle"
        />
      </span>
    </li>
  );
}
