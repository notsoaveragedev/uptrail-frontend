import { Button, Dropdown, Segmented, Tooltip } from "antd";
import type { ReactNode } from "react";
import {
  LuDownload,
  LuEllipsis,
  LuMonitor,
  LuPlus,
  LuRedo2,
  LuSmartphone,
  LuTablet,
  LuUndo2,
  LuUsers,
} from "react-icons/lu";
import { StatusDot } from "@/components/ui/StatusDot";
import { BREAKPOINT_OPTIONS } from "@/lib/dashboards";
import type { Breakpoint } from "@/types/dashboard";

const BREAKPOINT_ICONS: Record<Breakpoint, ReactNode> = {
  lg: <LuMonitor aria-hidden />,
  md: <LuTablet aria-hidden />,
  sm: <LuSmartphone aria-hidden />,
};

type EditToolbarProps = {
  changeCount: number;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  breakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  onAddWidget: () => void;
  onDiscard: () => void;
  onSave: () => void;
  isSaving: boolean;
  onExportJson: () => void;
  onSimulateTeammate: () => void;
};

export function EditToolbar({
  changeCount,
  isDirty,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  breakpoint,
  onBreakpointChange,
  onAddWidget,
  onDiscard,
  onSave,
  isSaving,
  onExportJson,
  onSimulateTeammate,
}: EditToolbarProps) {
  const moreItems = [
    { key: "export", icon: <LuDownload />, label: "Export JSON", onClick: onExportJson },
    { key: "teammate", icon: <LuUsers />, label: "Simulate a teammate's save", onClick: onSimulateTeammate },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Dashboard editor"
      className="sticky top-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-line bg-card px-3 py-2"
    >
      <span className="flex min-w-36 items-center gap-2" aria-live="polite">
        {isDirty ? (
          <>
            <StatusDot fill="bg-degraded" />
            <span className="text-ink">
              Unsaved changes <span className="font-mono text-xs text-muted">({Math.max(changeCount, 1)})</span>
            </span>
          </>
        ) : (
          <span className="text-subtle">No changes</span>
        )}
      </span>

      <span className="flex items-center gap-0.5">
        <Tooltip title={<ShortcutHint label="Undo" keys="⌘Z" />}>
          <Button type="text" aria-label="Undo" icon={<LuUndo2 />} disabled={!canUndo} onClick={onUndo} />
        </Tooltip>
        <Tooltip title={<ShortcutHint label="Redo" keys="⇧⌘Z" />}>
          <Button type="text" aria-label="Redo" icon={<LuRedo2 />} disabled={!canRedo} onClick={onRedo} />
        </Tooltip>
      </span>

      <Segmented
        aria-label="Preview breakpoint"
        value={breakpoint}
        onChange={onBreakpointChange}
        options={BREAKPOINT_OPTIONS.map(({ value, label }) => ({
          value,
          label: (
            <span className="flex items-center gap-1.5">
              {BREAKPOINT_ICONS[value]}
              <span className="max-md:sr-only">{label}</span>
            </span>
          ),
        }))}
      />

      <span className="ml-auto flex items-center gap-2">
        <Button icon={<LuPlus />} onClick={onAddWidget}>
          Add widget
        </Button>
        <Button onClick={onDiscard}>{isDirty ? "Discard" : "Done"}</Button>
        <Button type="primary" disabled={!isDirty} loading={isSaving} onClick={onSave}>
          Save
        </Button>
        <Dropdown trigger={["click"]} menu={{ items: moreItems }} placement="bottomRight">
          <Button type="text" aria-label="More editor actions" icon={<LuEllipsis />} />
        </Dropdown>
      </span>
    </div>
  );
}

function ShortcutHint({ label, keys }: { label: string; keys: string }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      <span className="kbd">{keys}</span>
    </span>
  );
}
