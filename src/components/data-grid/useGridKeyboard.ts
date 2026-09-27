import { type FocusEvent, type KeyboardEvent, type RefObject, useLayoutEffect, useRef, useState } from "react";
import { clampFocus, type GridFocus, nextFocus, revealCell, revealRow } from "@/lib/dataGrid";
import type { GridItem } from "@/types/dataGrid";

type Options<Row> = {
  scrollRef: RefObject<HTMLElement | null>;
  items: GridItem<Row>[];
  columnKeys: string[];
  activeIndex: number;
  isRowOpen: boolean;
  collapsedGroups: Set<string>;
  rowPx: number;
  headerPx: number;
  pinnedPx: { left: number; right: number };
  onOpenRow: (key: string) => void;
  onToggleGroup: (key: string) => void;
  onSortColumn: (columnKey: string) => void;
  onMoveColumn: (columnKey: string, delta: -1 | 1) => void;
  onOpenMenu: (columnKey: string) => void;
};

const HEADER_INDEX = -1;

function cellSelector(focus: GridFocus, isGroup: boolean) {
  if (isGroup) return `[data-cell][data-index="${focus.index}"]`;
  return `[data-cell][data-index="${focus.index}"][data-col="${CSS.escape(focus.columnKey)}"]`;
}

function isFocusStranded() {
  const element = document.activeElement;
  if (!element || element === document.body) return true;
  return element.closest('[role="dialog"]') !== null || element.querySelector('[role="dialog"]') !== null;
}

export function useGridKeyboard<Row>(options: Options<Row>) {
  const { scrollRef, items, columnKeys, activeIndex, isRowOpen, collapsedGroups, rowPx, headerPx, pinnedPx } = options;
  const [rawFocus, setRawFocus] = useState<GridFocus>({ index: 0, columnKey: "" });
  const [syncedActiveIndex, setSyncedActiveIndex] = useState(activeIndex);
  const shouldFocusCell = useRef(false);
  const wasRowOpen = useRef(isRowOpen);

  if (activeIndex !== syncedActiveIndex) {
    setSyncedActiveIndex(activeIndex);
    if (activeIndex >= 0) setRawFocus({ ...rawFocus, index: activeIndex });
  }

  const focus = clampFocus(rawFocus, items.length, columnKeys);
  const focusedItem = items[focus.index];
  const isGroupFocused = focusedItem?.type === "group";

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !shouldFocusCell.current) return;
    shouldFocusCell.current = false;
    if (focus.index >= 0) revealRow(scroller, focus.index, rowPx, headerPx);
    const cell = scroller.querySelector<HTMLElement>(cellSelector(focus, isGroupFocused));
    if (!cell) return;
    cell.focus({ preventScroll: true });
    revealCell(scroller, cell, pinnedPx.left, pinnedPx.right);
  });

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (scroller && activeIndex >= 0) revealRow(scroller, activeIndex, rowPx, headerPx);
  }, [scrollRef, activeIndex, rowPx, headerPx]);

  useLayoutEffect(() => {
    const hasClosed = wasRowOpen.current && !isRowOpen;
    wasRowOpen.current = isRowOpen;
    if (!hasClosed || !isFocusStranded()) return;
    scrollRef.current?.querySelector<HTMLElement>('[data-cell][tabindex="0"]')?.focus({ preventScroll: true });
  }, [scrollRef, isRowOpen]);

  function moveTo(next: GridFocus) {
    shouldFocusCell.current = true;
    setRawFocus(next);
  }

  function pageSize() {
    const scroller = scrollRef.current;
    return scroller ? Math.max(1, Math.floor((scroller.clientHeight - headerPx) / rowPx)) : 1;
  }

  function handleHeaderKey(event: KeyboardEvent) {
    if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      options.onMoveColumn(focus.columnKey, event.key === "ArrowLeft" ? -1 : 1);
      shouldFocusCell.current = true;
      return true;
    }
    if (event.altKey && event.key === "ArrowDown") {
      options.onOpenMenu(focus.columnKey);
      return true;
    }
    if (event.key === "Enter") {
      options.onSortColumn(focus.columnKey);
      return true;
    }
    return false;
  }

  function handleGroupKey(event: KeyboardEvent, key: string) {
    const isCollapsed = collapsedGroups.has(key);
    const shouldToggle =
      event.key === " " ||
      event.key === "Enter" ||
      (event.key === "ArrowLeft" && !isCollapsed) ||
      (event.key === "ArrowRight" && isCollapsed);
    if (shouldToggle) options.onToggleGroup(key);
    return shouldToggle || event.key === "ArrowLeft" || event.key === "ArrowRight";
  }

  function handleItemKey(event: KeyboardEvent) {
    if (focus.index === HEADER_INDEX) return handleHeaderKey(event);
    if (!focusedItem) return false;
    if (focusedItem.type === "group") return handleGroupKey(event, focusedItem.key);
    if (event.key === "Enter") {
      options.onOpenRow(focusedItem.key);
      return true;
    }
    return event.key === " ";
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!(event.target as HTMLElement).hasAttribute("data-cell")) return;
    const isHandled = handleItemKey(event);
    const next = isHandled
      ? null
      : nextFocus(focus, {
          key: event.key,
          isCtrl: event.ctrlKey || event.metaKey,
          columnKeys,
          lastIndex: items.length - 1,
          pageSize: pageSize(),
        });
    if (next) moveTo(next);
    if (isHandled || next) event.preventDefault();
  }

  function onFocus(event: FocusEvent<HTMLElement>) {
    const cell = event.target as HTMLElement;
    if (!cell.hasAttribute("data-cell")) return;
    const index = Number(cell.dataset.index);
    const columnKey = cell.dataset.col ?? focus.columnKey;
    if (index !== focus.index || columnKey !== focus.columnKey) setRawFocus({ index, columnKey });
  }

  return { focus, onKeyDown, onFocus, focusCell: moveTo };
}
