import { Button, Tooltip } from "antd";
import type { KeyboardEvent, PointerEvent } from "react";
import { LuCopy, LuGripVertical, LuSettings2, LuX } from "react-icons/lu";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";
import type { DragMode } from "./useGridDrag";
import { WidgetFrame } from "./WidgetFrame";

type PointerHandlers = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onLostPointerCapture: () => void;
};

type EditableWidgetProps = {
  widget: DashboardWidget;
  range: DashboardRange;
  syncKey: string;
  isSelected: boolean;
  isFlashing: boolean;
  isDragging: boolean;
  handlers: (mode: DragMode) => PointerHandlers;
  onGripKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onConfigure: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
};

function borderClass(isSelected: boolean, isFlashing: boolean) {
  if (isFlashing) return "border-accent transition-colors duration-700";
  if (isSelected) return "border-ink";
  return "border-line hover:border-line-strong";
}

export function EditableWidget({
  widget,
  range,
  syncKey,
  isSelected,
  isFlashing,
  isDragging,
  handlers,
  onGripKeyDown,
  onConfigure,
  onDuplicate,
  onRemove,
}: EditableWidgetProps) {
  const actionsVisibility = isSelected
    ? "opacity-100"
    : "opacity-0 group-focus-within/widget:opacity-100 group-hover/widget:opacity-100";

  return (
    <WidgetFrame
      widget={widget}
      range={range}
      syncKey={syncKey}
      className={borderClass(isSelected, isFlashing)}
      titleBarProps={{
        ...handlers("move"),
        className: `touch-none select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`,
      }}
      bodyProps={{
        onClick: onConfigure,
        className: "cursor-pointer select-none [&>*]:pointer-events-none",
      }}
      lead={
        <button
          type="button"
          aria-label={`Move ${widget.title}`}
          aria-describedby="grid-keyboard-help"
          onKeyDown={onGripKeyDown}
          className="-ml-1 flex size-5 shrink-0 cursor-grab items-center justify-center rounded-sm text-subtle hover:text-ink"
        >
          <LuGripVertical aria-hidden className="size-3.5" />
        </button>
      }
      actions={
        <span
          data-no-drag
          className={`absolute top-1.5 right-2 flex items-center gap-0.5 rounded-md bg-card transition-opacity ${actionsVisibility}`}
        >
          <Tooltip title="Configure">
            <Button
              size="small"
              type="text"
              aria-label={`Configure ${widget.title}`}
              icon={<LuSettings2 />}
              onClick={onConfigure}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              size="small"
              type="text"
              aria-label={`Duplicate ${widget.title}`}
              icon={<LuCopy />}
              onClick={onDuplicate}
            />
          </Tooltip>
          <Tooltip title="Remove">
            <Button size="small" type="text" aria-label={`Remove ${widget.title}`} icon={<LuX />} onClick={onRemove} />
          </Tooltip>
        </span>
      }
    >
      <span
        aria-hidden
        {...handlers("resize")}
        className="absolute right-0 bottom-0 flex size-4 cursor-se-resize touch-none items-end justify-end p-1"
      >
        <span
          className={`size-3 rounded-br-sm border-r-2 border-b-2 transition-colors ${
            isSelected ? "border-ink" : "border-line-strong group-hover/widget:border-muted"
          }`}
        />
      </span>
    </WidgetFrame>
  );
}
