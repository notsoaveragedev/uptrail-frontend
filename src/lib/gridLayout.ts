import type { Breakpoint, LayoutItem, WidgetSize } from "@/types/dashboard";

export type Layout = LayoutItem[];

export const GRID_COLS: Record<Breakpoint, number> = { lg: 12, md: 8, sm: 4 };

export const BREAKPOINTS: Breakpoint[] = ["lg", "md", "sm"];

export const ROW_HEIGHT_REM = 2.5;

export const GAP_REM = 1;

export function breakpointForWidth(widthPx: number): Breakpoint {
  if (widthPx >= 1100) return "lg";
  if (widthPx >= 640) return "md";
  return "sm";
}

export function collides(a: LayoutItem, b: LayoutItem) {
  return a.i !== b.i && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function layoutHeight(layout: Layout) {
  return layout.reduce((height, item) => Math.max(height, item.y + item.h), 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function fitToCols(item: LayoutItem, cols: number): LayoutItem {
  const w = clamp(item.w, 1, cols);
  return { ...item, w, x: clamp(item.x, 0, cols - w), y: Math.max(0, item.y) };
}

function byPosition(a: LayoutItem, b: LayoutItem) {
  return a.y - b.y || a.x - b.x;
}

function replaceItem(layout: Layout, next: LayoutItem) {
  return layout.map((item) => (item.i === next.i ? next : item));
}

export function compact(layout: Layout): Layout {
  const placed: LayoutItem[] = [];

  for (const item of [...layout].sort(byPosition)) {
    let next = item;
    while (placed.some((other) => collides(next, other))) next = { ...next, y: next.y + 1 };
    while (next.y > 0 && !placed.some((other) => collides({ ...next, y: next.y - 1 }, other))) {
      next = { ...next, y: next.y - 1 };
    }
    placed.push(next);
  }

  return layout.map((item) => placed.find((other) => other.i === item.i) ?? item);
}

function pushAway(layout: Layout, mover: LayoutItem, isUserAction: boolean): Layout {
  let next = layout;
  const colliders = layout.filter((item) => collides(item, mover)).sort(byPosition);

  for (const { i } of colliders) {
    const current = next.find((item) => item.i === i);
    if (!current || !collides(current, mover)) continue;

    const lifted = { ...current, y: mover.y - current.h };
    if (isUserAction && lifted.y >= 0 && !next.some((other) => collides(lifted, other))) {
      next = replaceItem(next, lifted);
      continue;
    }

    const pushed = { ...current, y: mover.y + mover.h };
    next = pushAway(replaceItem(next, pushed), pushed, false);
  }

  return next;
}

export function moveItem(layout: Layout, id: string, x: number, y: number, cols: number): Layout {
  const item = layout.find((entry) => entry.i === id);
  if (!item) return layout;

  const moved = fitToCols({ ...item, x, y }, cols);
  return compact(pushAway(replaceItem(layout, moved), moved, true));
}

export function resizeItem(
  layout: Layout,
  id: string,
  w: number,
  h: number,
  cols: number,
  minSize: WidgetSize = { w: 1, h: 1 },
): Layout {
  const item = layout.find((entry) => entry.i === id);
  if (!item) return layout;

  const minW = Math.min(minSize.w, cols);
  const width = clamp(w, minW, cols - item.x);
  const resized = { ...item, w: Math.max(width, minW), h: Math.max(h, minSize.h) };
  const fitted = fitToCols(resized, cols);
  return compact(pushAway(replaceItem(layout, fitted), fitted, false));
}

export function nudgeItem(layout: Layout, id: string, dx: number, dy: number, cols: number): Layout {
  const item = layout.find((entry) => entry.i === id);
  if (!item) return layout;
  if (dy === 0) return moveItem(layout, id, item.x + dx, item.y, cols);

  const limit = layoutHeight(layout);
  for (let step = 1; step <= limit; step++) {
    const next = moveItem(layout, id, item.x + dx, item.y + dy * step, cols);
    const moved = next.find((entry) => entry.i === id);
    if (moved && moved.y !== item.y) return next;
  }
  return layout;
}

export function firstFreeSlot(layout: Layout, size: WidgetSize, cols: number) {
  const w = Math.min(size.w, cols);
  const bottom = layoutHeight(layout);

  for (let y = 0; y < bottom; y++) {
    for (let x = 0; x <= cols - w; x++) {
      const candidate = { i: "__candidate", x, y, w, h: size.h };
      if (!layout.some((item) => collides(candidate, item))) return { x, y, w, h: size.h };
    }
  }
  return { x: 0, y: bottom, w, h: size.h };
}

export function addItem(layout: Layout, id: string, size: WidgetSize, cols: number): Layout {
  return [...layout, { i: id, ...firstFreeSlot(layout, size, cols) }];
}

export function insertItem(layout: Layout, item: LayoutItem, cols: number): Layout {
  return moveItem([...layout.filter((entry) => entry.i !== item.i), item], item.i, item.x, item.y, cols);
}

export function removeItem(layout: Layout, id: string): Layout {
  return compact(layout.filter((item) => item.i !== id));
}

export function scaleLayout(lgLayout: Layout, cols: number): Layout {
  const ratio = cols / GRID_COLS.lg;
  const scaled = [...lgLayout].sort(byPosition).map((item) => {
    if (cols <= GRID_COLS.sm) return { ...item, x: 0, w: cols };
    const w = clamp(Math.round(item.w * ratio), 1, cols);
    return { ...item, w, x: clamp(Math.round(item.x * ratio), 0, cols - w) };
  });
  return compact(scaled);
}

export type GridMetrics = {
  cols: number;
  colWidth: number;
  rowHeight: number;
  gap: number;
};

export function gridMetrics(widthPx: number, cols: number, remPx: number): GridMetrics {
  const gap = GAP_REM * remPx;
  return { cols, gap, rowHeight: ROW_HEIGHT_REM * remPx, colWidth: (widthPx - gap * (cols - 1)) / cols };
}

export function itemRect(item: LayoutItem, metrics: GridMetrics) {
  const { colWidth, rowHeight, gap } = metrics;
  return {
    left: item.x * (colWidth + gap),
    top: item.y * (rowHeight + gap),
    width: item.w * colWidth + (item.w - 1) * gap,
    height: item.h * rowHeight + (item.h - 1) * gap,
  };
}

export function gridPixelHeight(layout: Layout, metrics: GridMetrics) {
  const rows = layoutHeight(layout);
  return rows === 0 ? 0 : rows * metrics.rowHeight + (rows - 1) * metrics.gap;
}

export function pixelsToCells(px: number, cellPx: number, gap: number) {
  return Math.round(px / (cellPx + gap));
}

export function spanFromPixels(px: number, cellPx: number, gap: number) {
  return Math.max(1, Math.round((px + gap) / (cellPx + gap)));
}

export const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function liftedRect(origin: LayoutItem, metrics: GridMetrics, mode: "move" | "resize", dx: number, dy: number) {
  const rect = itemRect(origin, metrics);
  if (mode === "move") return { ...rect, left: rect.left + dx, top: rect.top + dy };
  return {
    ...rect,
    width: Math.max(metrics.colWidth, rect.width + dx),
    height: Math.max(metrics.rowHeight, rect.height + dy),
  };
}

export function dotGridStyle(metrics: GridMetrics) {
  const pitchX = metrics.colWidth + metrics.gap;
  const pitchY = metrics.rowHeight + metrics.gap;
  return {
    backgroundImage: "radial-gradient(circle, var(--line-strong) 1px, transparent 1.5px)",
    backgroundSize: `${pitchX}px ${pitchY}px`,
    backgroundPosition: `${-(metrics.gap + pitchX) / 2}px ${-(metrics.gap + pitchY) / 2}px`,
  };
}
