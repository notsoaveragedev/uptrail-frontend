import { Button } from "antd";
import { useState, type KeyboardEvent } from "react";
import { LuPlus } from "react-icons/lu";
import { useElementWidth } from "@/hooks/useElementWidth";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { layoutFor } from "@/lib/dashboards";
import { rootFontSize } from "@/lib/dom";
import {
  ARROW_DELTAS,
  dotGridStyle,
  GRID_COLS,
  gridMetrics,
  itemRect,
  layoutHeight,
  liftedRect,
  nudgeItem,
  resizeItem,
  type Layout,
} from "@/lib/gridLayout";
import { WIDGETS } from "@/lib/widgets";
import type { Breakpoint, Dashboard, DashboardRange, LayoutItem } from "@/types/dashboard";
import { EditableWidget } from "./EditableWidget";
import { GridCell } from "./GridCell";
import { useGridDrag } from "./useGridDrag";

const EXTRA_ROWS = 2;

const MIN_ROWS = 6;

type EditableGridProps = {
  dashboard: Dashboard;
  breakpoint: Breakpoint;
  range: DashboardRange;
  selectedId: string | null;
  flashId: string | null;
  onLayoutChange: (breakpoint: Breakpoint, layout: Layout) => void;
  onSelect: (widgetId: string | null) => void;
  onConfigure: (widgetId: string) => void;
  onDuplicate: (widgetId: string) => void;
  onRemove: (widgetId: string) => void;
  onAddWidget: () => void;
};

export function EditableGrid({
  dashboard,
  breakpoint,
  range,
  selectedId,
  flashId,
  onLayoutChange,
  onSelect,
  onConfigure,
  onDuplicate,
  onRemove,
  onAddWidget,
}: EditableGridProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [announcement, setAnnouncement] = useState("");
  const layout = layoutFor(dashboard, breakpoint);
  const metrics = gridMetrics(width, GRID_COLS[breakpoint], rootFontSize());

  function minSizeFor(id: string) {
    const widget = dashboard.widgets.find((entry) => entry.id === id);
    return widget ? WIDGETS[widget.type].minSize : { w: 1, h: 1 };
  }

  function titleOf(id: string) {
    return dashboard.widgets.find((entry) => entry.id === id)?.title ?? "Widget";
  }

  function describe(item: LayoutItem, isResize: boolean) {
    const title = titleOf(item.i);
    if (isResize) return `${title} resized to ${item.w} columns by ${item.h} rows.`;
    return `${title} moved to column ${item.x + 1}, row ${item.y + 1}.`;
  }

  const { drag, handlers, cancel } = useGridDrag({
    layout,
    metrics,
    minSizeFor,
    onTap: onSelect,
    onCommit: (next, id, mode) => {
      onLayoutChange(breakpoint, next);
      onSelect(id);
      const item = next.find((entry) => entry.i === id);
      if (item) setAnnouncement(describe(item, mode === "resize"));
    },
  });

  useWindowKeydown((event) => {
    if (event.key === "Escape" && drag) cancel();
  });

  function handleGripKeyDown(event: KeyboardEvent<HTMLButtonElement>, item: LayoutItem) {
    const delta = ARROW_DELTAS[event.key];
    if (!delta) return;
    event.preventDefault();

    const [dx, dy] = delta;
    const cols = GRID_COLS[breakpoint];
    const next = event.shiftKey
      ? resizeItem(layout, item.i, item.w + dx, item.h + dy, cols, minSizeFor(item.i))
      : nudgeItem(layout, item.i, dx, dy, cols);
    const moved = next.find((entry) => entry.i === item.i);

    if (!moved || (moved.x === item.x && moved.y === item.y && moved.w === item.w && moved.h === item.h)) {
      setAnnouncement(`${titleOf(item.i)} can't go further that way.`);
      return;
    }
    onLayoutChange(breakpoint, next);
    onSelect(item.i);
    setAnnouncement(describe(moved, event.shiftKey));
  }

  const shown = drag?.preview ?? layout;
  const rows = Math.max(layoutHeight(shown) + EXTRA_ROWS, MIN_ROWS);
  const height = rows * metrics.rowHeight + (rows - 1) * metrics.gap;
  const placeholder = drag && shown.find((item) => item.i === drag.id);

  return (
    <>
      <p id="grid-keyboard-help" className="sr-only">
        Arrow keys move the widget. Shift and arrow keys resize it.
      </p>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div
        ref={ref}
        className="relative w-full"
        style={{ height, ...(width > 0 ? dotGridStyle(metrics) : {}) }}
        onPointerDown={(event) => event.target === event.currentTarget && onSelect(null)}
      >
        {dashboard.widgets.length === 0 && <EmptyCanvas onAddWidget={onAddWidget} />}
        {placeholder && (
          <GridCell
            rect={itemRect(placeholder, metrics)}
            isAnimated
            className="rounded-lg border border-dashed border-accent bg-accent-soft"
          />
        )}
        {width > 0 &&
          shown.map((item) => {
            const widget = dashboard.widgets.find((entry) => entry.id === item.i);
            if (!widget) return null;
            const isDragging = drag?.id === item.i;
            const rect = isDragging
              ? liftedRect(drag.origin, metrics, drag.mode, drag.dx, drag.dy)
              : itemRect(item, metrics);
            return (
              <GridCell key={item.i} rect={rect} isAnimated={!isDragging} isLifted={isDragging}>
                <div data-widget-id={item.i} className="h-full">
                  <EditableWidget
                    widget={widget}
                    range={range}
                    syncKey={dashboard.id}
                    isSelected={selectedId === item.i}
                    isFlashing={flashId === item.i}
                    isDragging={isDragging}
                    handlers={(mode) => handlers(item.i, mode)}
                    onGripKeyDown={(event) => handleGripKeyDown(event, item)}
                    onConfigure={() => onConfigure(item.i)}
                    onDuplicate={() => onDuplicate(item.i)}
                    onRemove={() => onRemove(item.i)}
                  />
                </div>
              </GridCell>
            );
          })}
      </div>
    </>
  );
}

function EmptyCanvas({ onAddWidget }: { onAddWidget: () => void }) {
  return (
    <div className="absolute inset-x-0 top-0 flex h-full min-h-40 flex-col items-center justify-center gap-3 text-center">
      <p className="text-md font-semibold">Add your first widget</p>
      <p className="max-w-80 text-muted">Charts, KPIs, heatmaps and live logs snap onto this grid.</p>
      <Button type="primary" icon={<LuPlus />} onClick={onAddWidget}>
        Add widget
      </Button>
    </div>
  );
}
