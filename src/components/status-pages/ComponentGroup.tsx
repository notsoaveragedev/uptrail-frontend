import { Button, Dropdown, Input, type InputRef } from "antd";
import { useRef } from "react";
import { LuEllipsis, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { CheckboxMenu } from "@/components/ui/CheckboxMenu";
import { StatusDot } from "@/components/ui/StatusDot";
import { STATUS_FILL } from "@/lib/status";
import type { Monitor } from "@/types/monitor";
import type { StatusComponentConfig, StatusGroupConfig } from "@/types/statusPage";
import { ComponentRow } from "./ComponentRow";
import type { ComponentReorder } from "./useComponentReorder";

type ComponentGroupProps = {
  group: StatusGroupConfig;
  otherGroups: StatusGroupConfig[];
  monitors: Monitor[];
  availableMonitors: Monitor[];
  reorder: ComponentReorder;
  onRename: (name: string) => void;
  onRemove: () => void;
  onSetMonitors: (monitorIds: string[]) => void;
  onUpdateComponent: (monitorId: string, patch: Partial<StatusComponentConfig>) => void;
  onMoveComponent: (monitorId: string, groupId: string) => void;
  onRemoveComponent: (monitorId: string) => void;
};

export function ComponentGroup({
  group,
  otherGroups,
  monitors,
  availableMonitors,
  reorder,
  onRename,
  onRemove,
  onSetMonitors,
  onUpdateComponent,
  onMoveComponent,
  onRemoveComponent,
}: ComponentGroupProps) {
  const nameRef = useRef<InputRef>(null);
  const selected = group.components.map((item) => item.monitorId);
  const options = availableMonitors.map((monitor) => ({
    value: monitor.id,
    label: (
      <span className="flex min-w-0 items-center gap-2">
        <StatusDot fill={STATUS_FILL[monitor.status]} />
        <span className="truncate">{monitor.name}</span>
      </span>
    ),
  }));

  return (
    <section aria-label={`${group.name || "Untitled"} group`} className="rounded-md border border-line">
      <header className="flex items-center gap-1 border-b border-line py-1 pr-1 pl-1">
        <Input
          ref={nameRef}
          variant="borderless"
          aria-label="Group name"
          value={group.name}
          placeholder="Untitled group"
          onChange={(event) => onRename(event.target.value)}
          className="font-semibold"
        />
        <span className="shrink-0 font-mono text-xs text-subtle">{group.components.length}</span>
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "rename", label: "Rename", icon: <LuPencil /> },
              { type: "divider" },
              { key: "delete", label: "Delete group", icon: <LuTrash2 />, danger: true },
            ],
            onClick: ({ key }) => (key === "rename" ? nameRef.current?.focus({ cursor: "all" }) : onRemove()),
          }}
        >
          <Button type="text" size="small" aria-label={`Actions for ${group.name || "group"}`} icon={<LuEllipsis />} />
        </Dropdown>
      </header>
      {group.components.length === 0 ? (
        <p className="px-3 py-3 text-xs text-subtle">No components yet. Add monitors to show them in this group.</p>
      ) : (
        <ol className="flex flex-col px-1 py-1">
          {group.components.map((item, index) => (
            <ComponentRow
              key={item.monitorId}
              item={item}
              group={group}
              index={index}
              otherGroups={otherGroups}
              monitor={monitors.find((monitor) => monitor.id === item.monitorId)}
              reorder={reorder}
              onUpdate={(patch) => onUpdateComponent(item.monitorId, patch)}
              onMoveToGroup={(groupId) => onMoveComponent(item.monitorId, groupId)}
              onRemove={() => onRemoveComponent(item.monitorId)}
            />
          ))}
        </ol>
      )}
      <footer className="border-t border-line px-1 py-1">
        <CheckboxMenu options={options} selected={selected} onChange={onSetMonitors} widthClassName="w-64">
          <Button type="text" size="small" icon={<LuPlus />} disabled={options.length === 0}>
            Add monitors
          </Button>
        </CheckboxMenu>
      </footer>
    </section>
  );
}
