import { useState, type PointerEvent } from "react";
import {
  itemRect,
  moveItem,
  pixelsToCells,
  resizeItem,
  spanFromPixels,
  type GridMetrics,
  type Layout,
} from "@/lib/gridLayout";
import type { LayoutItem, WidgetSize } from "@/types/dashboard";

export type DragMode = "move" | "resize";

type DragState = {
  id: string;
  mode: DragMode;
  pointerId: number;
  startX: number;
  startY: number;
  origin: LayoutItem;
  dx: number;
  dy: number;
  hasMoved: boolean;
  preview: Layout;
};

type GridDragOptions = {
  layout: Layout;
  metrics: GridMetrics;
  minSizeFor: (id: string) => WidgetSize;
  onCommit: (layout: Layout, id: string, mode: DragMode) => void;
  onTap: (id: string) => void;
};

const DRAG_THRESHOLD_PX = 4;

function isSameLayout(a: Layout, b: Layout) {
  return a.every((item) => {
    const other = b.find((entry) => entry.i === item.i);
    return other && other.x === item.x && other.y === item.y && other.w === item.w && other.h === item.h;
  });
}

export function useGridDrag({ layout, metrics, minSizeFor, onCommit, onTap }: GridDragOptions) {
  const [drag, setDrag] = useState<DragState | null>(null);

  function previewFor(state: DragState, dx: number, dy: number) {
    const origin = itemRect(state.origin, metrics);
    const { colWidth, rowHeight, gap, cols } = metrics;

    if (state.mode === "move") {
      const x = pixelsToCells(origin.left + dx, colWidth, gap);
      const y = pixelsToCells(origin.top + dy, rowHeight, gap);
      return moveItem(layout, state.id, x, y, cols);
    }

    const w = spanFromPixels(origin.width + dx, colWidth, gap);
    const h = spanFromPixels(origin.height + dy, rowHeight, gap);
    return resizeItem(layout, state.id, w, h, cols, minSizeFor(state.id));
  }

  function start(event: PointerEvent<HTMLElement>, id: string, mode: DragMode) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("[data-no-drag]")) return;
    const origin = layout.find((item) => item.i === id);
    if (!origin) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      id,
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin,
      dx: 0,
      dy: 0,
      hasMoved: false,
      preview: layout,
    });
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const hasMoved = drag.hasMoved || Math.hypot(dx, dy) > DRAG_THRESHOLD_PX;
    if (!hasMoved) return;
    setDrag({ ...drag, dx, dy, hasMoved, preview: previewFor(drag, dx, dy) });
  }

  function end(event: PointerEvent<HTMLElement>) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    setDrag(null);
    if (!drag.hasMoved) {
      if (drag.mode === "move") onTap(drag.id);
      return;
    }
    if (!isSameLayout(drag.preview, layout)) onCommit(drag.preview, drag.id, drag.mode);
  }

  function cancel() {
    setDrag(null);
  }

  function handlers(id: string, mode: DragMode) {
    return {
      onPointerDown: (event: PointerEvent<HTMLElement>) => start(event, id, mode),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: cancel,
      onLostPointerCapture: cancel,
    };
  }

  return { drag: drag?.hasMoved ? drag : null, handlers, cancel };
}
