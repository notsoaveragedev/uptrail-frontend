import type { CSSProperties } from "react";
import type { ColumnState, GridColumn, GridSort } from "@/types/dataGrid";

export const ROW_HEIGHT_REM = 2;
export const HEADER_HEIGHT_REM = 2.25;
export const OVERSCAN_ROWS = 10;
export const END_REACHED_THRESHOLD = 20;
export const LOADING_ROWS = 14;
export const FETCHING_MORE_ROWS = 3;
const DEFAULT_MIN_WIDTH_REM = 4;
const MAX_WIDTH_REM = 40;

export type PinZone = "left" | "center" | "right";

export type ColumnAction = "sort-asc" | "sort-desc" | "pin-left" | "pin-right" | "unpin" | "hide";

export type ResolvedColumn<Row> = GridColumn<Row> & {
  zone: PinZone;
  offset: number;
  isZoneEdge: boolean;
  colIndex: number;
};

export type GridFocus = { index: number; columnKey: string };

type WidthOverride = { key: string; width: number } | null;

export function minWidthOf(column: { minWidth?: number }) {
  return column.minWidth ?? DEFAULT_MIN_WIDTH_REM;
}

export function clampWidth(width: number, minWidth: number) {
  return Math.round(Math.min(MAX_WIDTH_REM, Math.max(minWidth, width)) * 16) / 16;
}

function zoneOf(key: string, state: ColumnState): PinZone {
  if (state.pinnedLeft.includes(key)) return "left";
  if (state.pinnedRight.includes(key)) return "right";
  return "center";
}

function orderedKeys<Row>(columns: GridColumn<Row>[], state: ColumnState) {
  const missing = columns.map((column) => column.key).filter((key) => !state.order.includes(key));
  return [...state.order, ...missing];
}

export function resolveColumns<Row>(
  columns: GridColumn<Row>[],
  state: ColumnState,
  override: WidthOverride,
): ResolvedColumn<Row>[] {
  const byKey = new Map(columns.map((column) => [column.key, column]));
  const visible = orderedKeys(columns, state)
    .filter((key) => byKey.has(key) && !state.hidden.includes(key))
    .map((key) => {
      const column = byKey.get(key)!;
      const width = override?.key === key ? override.width : (state.widths[key] ?? column.width);
      return { ...column, width, zone: zoneOf(key, state) };
    });
  const left = visible.filter((column) => column.zone === "left");
  const center = visible.filter((column) => column.zone === "center");
  const right = visible.filter((column) => column.zone === "right");

  const leftResolved = left.map((column, index) => ({
    ...column,
    offset: sumWidths(left.slice(0, index)),
    isZoneEdge: index === left.length - 1,
  }));
  const centerResolved = center.map((column) => ({ ...column, offset: 0, isZoneEdge: false }));
  const rightResolved = right.map((column, index) => ({
    ...column,
    offset: sumWidths(right.slice(index + 1)),
    isZoneEdge: index === 0,
  }));

  return [...leftResolved, ...centerResolved, ...rightResolved].map((column, index) => ({
    ...column,
    colIndex: index + 1,
  }));
}

export function sumWidths(columns: { width: number }[]) {
  return columns.reduce((total, column) => total + column.width, 0);
}

export function zoneWidth<Row>(columns: ResolvedColumn<Row>[], zone: PinZone) {
  return sumWidths(columns.filter((column) => column.zone === zone));
}

export function moveColumn(state: ColumnState, key: string, targetKey: string, placeAfter: boolean): ColumnState {
  if (key === targetKey) return state;
  const order = state.order.filter((item) => item !== key);
  const targetIndex = order.indexOf(targetKey);
  if (targetIndex === -1) return state;
  order.splice(placeAfter ? targetIndex + 1 : targetIndex, 0, key);
  return { ...state, order };
}

export function moveColumnBy<Row>(
  state: ColumnState,
  columns: ResolvedColumn<Row>[],
  key: string,
  delta: -1 | 1,
): ColumnState {
  const column = columns.find((item) => item.key === key);
  if (!column) return state;
  const zone = columns.filter((item) => item.zone === column.zone);
  const neighbor = zone[zone.indexOf(column) + delta];
  return neighbor ? moveColumn(state, key, neighbor.key, delta > 0) : state;
}

export function applyColumnAction(state: ColumnState, key: string, action: ColumnAction): ColumnState {
  const pinnedLeft = state.pinnedLeft.filter((item) => item !== key);
  const pinnedRight = state.pinnedRight.filter((item) => item !== key);
  if (action === "pin-left") return { ...state, pinnedLeft: [...pinnedLeft, key], pinnedRight };
  if (action === "pin-right") return { ...state, pinnedLeft, pinnedRight: [...pinnedRight, key] };
  if (action === "unpin") return { ...state, pinnedLeft, pinnedRight };
  if (action === "hide") return { ...state, hidden: [...state.hidden, key] };
  return state;
}

export function setColumnWidth(state: ColumnState, key: string, width: number): ColumnState {
  return { ...state, widths: { ...state.widths, [key]: width } };
}

export function toggleSort(sort: GridSort, sortKey: string): GridSort {
  return sort.key === sortKey
    ? { key: sortKey, isDescending: !sort.isDescending }
    : { key: sortKey, isDescending: true };
}

export function ariaSortOf(sort: GridSort, sortKey?: string) {
  if (!sortKey || sort.key !== sortKey) return undefined;
  return sort.isDescending ? "descending" : "ascending";
}

export function clampFocus(focus: GridFocus, itemCount: number, columnKeys: string[]): GridFocus {
  const index = Math.min(focus.index, itemCount - 1);
  const columnKey = columnKeys.includes(focus.columnKey) ? focus.columnKey : (columnKeys[0] ?? "");
  return { index, columnKey };
}

type FocusMove = {
  key: string;
  isCtrl: boolean;
  columnKeys: string[];
  lastIndex: number;
  pageSize: number;
};

export function nextFocus(focus: GridFocus, move: FocusMove): GridFocus | null {
  const { key, isCtrl, columnKeys, lastIndex, pageSize } = move;
  const column = columnKeys.indexOf(focus.columnKey);
  const toRow = (index: number) => ({ ...focus, index: Math.max(-1, Math.min(lastIndex, index)) });
  const toColumn = (index: number) => ({
    ...focus,
    columnKey: columnKeys[Math.max(0, Math.min(columnKeys.length - 1, index))],
  });

  if (key === "ArrowUp") return toRow(focus.index - 1);
  if (key === "ArrowDown") return toRow(focus.index + 1);
  if (key === "ArrowLeft") return toColumn(column - 1);
  if (key === "ArrowRight") return toColumn(column + 1);
  if (key === "Home") return isCtrl ? toRow(Math.min(0, lastIndex)) : toColumn(0);
  if (key === "End") return isCtrl ? toRow(lastIndex) : toColumn(columnKeys.length - 1);
  if (key === "PageUp") return toRow(focus.index < 0 ? -1 : Math.max(0, focus.index - pageSize));
  if (key === "PageDown") return toRow(focus.index + pageSize);
  return null;
}

export function renderedIndices(start: number, end: number, focusIndex: number) {
  const indices: number[] = [];
  for (let index = start; index < end; index++) indices.push(index);
  if (focusIndex >= 0 && (focusIndex < start || focusIndex >= end)) indices.push(focusIndex);
  return indices;
}

export function revealRow(scroller: HTMLElement, index: number, rowPx: number, headerPx: number) {
  const top = index * rowPx;
  const bodyHeight = scroller.clientHeight - headerPx;
  if (top < scroller.scrollTop) scroller.scrollTop = top;
  else if (top + rowPx > scroller.scrollTop + bodyHeight) scroller.scrollTop = top + rowPx - bodyHeight;
}

export function revealCell(scroller: HTMLElement, cell: HTMLElement, pinnedLeftPx: number, pinnedRightPx: number) {
  if (cell.dataset.zone !== "center") return;
  const box = scroller.getBoundingClientRect();
  const rect = cell.getBoundingClientRect();
  const minX = box.left + pinnedLeftPx;
  const maxX = box.left + scroller.clientWidth - pinnedRightPx;
  if (rect.left < minX) scroller.scrollLeft -= minX - rect.left;
  else if (rect.right > maxX) scroller.scrollLeft += rect.right - maxX;
}

export function measureColumnWidth(scroller: HTMLElement, key: string, remPx: number) {
  const cells = [...scroller.querySelectorAll<HTMLElement>(`[data-col="${CSS.escape(key)}"]`)];
  const previous = cells.map((cell) => cell.style.width);
  cells.forEach((cell) => (cell.style.width = "max-content"));
  const widest = Math.max(0, ...cells.map((cell) => cell.getBoundingClientRect().width));
  cells.forEach((cell, index) => (cell.style.width = previous[index]));
  return widest / remPx + 1;
}

const PIN_EDGE_CLASS = {
  left: "border-r border-line-strong after:pointer-events-none after:absolute after:inset-y-0 after:-right-2 after:w-2 after:bg-linear-to-r after:from-black/25 after:to-transparent after:opacity-0 after:transition-opacity group-data-overflow-left/grid:after:opacity-100",
  right:
    "border-l border-line-strong after:pointer-events-none after:absolute after:inset-y-0 after:-left-2 after:w-2 after:bg-linear-to-l after:from-black/25 after:to-transparent after:opacity-0 after:transition-opacity group-data-overflow-right/grid:after:opacity-100",
};

const PIN_SURFACE_CLASS = {
  header: "bg-panel",
  body: "bg-card group-hover/row:bg-hover group-data-active/row:bg-hover",
  skeleton: "bg-card",
};

export function pinClass(column: { zone: PinZone; isZoneEdge: boolean }, surface: keyof typeof PIN_SURFACE_CLASS) {
  if (column.zone === "center") return "relative";
  const edge = column.isZoneEdge ? PIN_EDGE_CLASS[column.zone] : "";
  return `sticky z-[1] ${PIN_SURFACE_CLASS[surface]} ${edge}`;
}

export function cellStyle(column: { zone: PinZone; offset: number; width: number }): CSSProperties {
  if (column.zone === "left") return { width: `${column.width}rem`, left: `${column.offset}rem` };
  if (column.zone === "right") return { width: `${column.width}rem`, right: `${column.offset}rem` };
  return { width: `${column.width}rem` };
}

export function rowOffset(index: number): CSSProperties {
  return { transform: `translateY(${index * ROW_HEIGHT_REM}rem)` };
}

export function isFirstPinnedRight(column: { zone: PinZone; isZoneEdge: boolean }) {
  return column.zone === "right" && column.isZoneEdge;
}
