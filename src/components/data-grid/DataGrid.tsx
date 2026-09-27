import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  applyColumnAction,
  clampWidth,
  type ColumnAction,
  END_REACHED_THRESHOLD,
  FETCHING_MORE_ROWS,
  HEADER_HEIGHT_REM,
  LOADING_ROWS,
  measureColumnWidth,
  moveColumn,
  moveColumnBy,
  OVERSCAN_ROWS,
  renderedIndices,
  resolveColumns,
  ROW_HEIGHT_REM,
  setColumnWidth,
  sumWidths,
  toggleSort,
  zoneWidth,
} from "@/lib/dataGrid";
import { rootFontSize } from "@/lib/dom";
import type { ColumnState, GridColumn, GridItem, GridSort } from "@/types/dataGrid";
import { DropIndicator, ResizeGuide } from "./GridGuides";
import { GridHeader } from "./GridHeader";
import { GridRow } from "./GridRow";
import { GroupRow } from "./GroupRow";
import { SkeletonRow } from "./SkeletonRow";
import { useColumnReorder } from "./useColumnReorder";
import { type ResizeTarget, useColumnResize } from "./useColumnResize";
import { useGridKeyboard } from "./useGridKeyboard";
import { useLatestCallback } from "./useLatestCallback";
import { useScrollEdges } from "./useScrollEdges";
import { useVirtualRows } from "./useVirtualRows";

export type DataGridProps<Row> = {
  label: string;
  columns: GridColumn<Row>[];
  columnState: ColumnState;
  onColumnStateChange: (state: ColumnState) => void;
  items: GridItem<Row>[];
  rowCount: number;
  sort: GridSort;
  onSortChange: (sort: GridSort) => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  onEndReached: () => void;
  isLoading: boolean;
  activeRowKey: string | null;
  onOpenRow: (key: string) => void;
  collapsedGroups: Set<string>;
  onToggleGroup: (key: string) => void;
  getRowClassName?: (row: Row) => string;
  emptyState: ReactNode;
  footer?: ReactNode;
};

function range(from: number, count: number) {
  return Array.from({ length: count }, (_, offset) => from + offset);
}

export function DataGrid<Row>(props: DataGridProps<Row>) {
  const { columns, columnState, onColumnStateChange, items, sort, activeRowKey, collapsedGroups } = props;
  const { hasMore, isFetchingMore, isLoading, getRowClassName } = props;
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [remPx] = useState(rootFontSize);
  const [menuColumnKey, setMenuColumnKey] = useState<string | null>(null);
  const [isMenuFromKeyboard, setIsMenuFromKeyboard] = useState(false);
  const rowPx = ROW_HEIGHT_REM * remPx;
  const headerPx = HEADER_HEIGHT_REM * remPx;
  const openRow = useLatestCallback(props.onOpenRow);
  const toggleGroup = useLatestCallback(props.onToggleGroup);
  const reachEnd = useLatestCallback(props.onEndReached);

  function autoFit(target: ResizeTarget) {
    if (!scrollRef.current) return;
    const width = clampWidth(measureColumnWidth(scrollRef.current, target.key, remPx), target.minWidth);
    onColumnStateChange(setColumnWidth(columnState, target.key, width));
  }

  const resize = useColumnResize({
    frameRef,
    remPx,
    onCommit: (key, width) => onColumnStateChange(setColumnWidth(columnState, key, width)),
    onAutoFit: autoFit,
  });
  const reorder = useColumnReorder({
    frameRef,
    remPx,
    onMove: (key, targetKey, placeAfter) => onColumnStateChange(moveColumn(columnState, key, targetKey, placeAfter)),
  });

  const draftKey = resize.draft?.key;
  const draftWidth = resize.draft?.width;
  const visibleColumns = useMemo(
    () => resolveColumns(columns, columnState, draftKey && draftWidth ? { key: draftKey, width: draftWidth } : null),
    [columns, columnState, draftKey, draftWidth],
  );
  const columnKeys = useMemo(() => visibleColumns.map((column) => column.key), [visibleColumns]);
  const totalWidth = sumWidths(visibleColumns);
  const activeIndex = useMemo(
    () => (activeRowKey ? items.findIndex((item) => item.type === "row" && item.key === activeRowKey) : -1),
    [items, activeRowKey],
  );
  const isGrouped = items[0]?.type === "group";

  function sortColumn(columnKey: string) {
    const sortKey = visibleColumns.find((column) => column.key === columnKey)?.sortKey;
    if (sortKey) props.onSortChange(toggleSort(sort, sortKey));
  }

  const keyboard = useGridKeyboard({
    scrollRef,
    items,
    columnKeys,
    activeIndex,
    isRowOpen: activeRowKey !== null,
    collapsedGroups,
    rowPx,
    headerPx,
    pinnedPx: { left: zoneWidth(visibleColumns, "left") * remPx, right: zoneWidth(visibleColumns, "right") * remPx },
    onOpenRow: openRow,
    onToggleGroup: toggleGroup,
    onSortColumn: sortColumn,
    onMoveColumn: (key, delta) => onColumnStateChange(moveColumnBy(columnState, visibleColumns, key, delta)),
    onOpenMenu: (columnKey) => openMenu(columnKey, true),
  });
  const { focus } = keyboard;

  function openMenu(columnKey: string | null, isKeyboard = false) {
    setMenuColumnKey(columnKey);
    setIsMenuFromKeyboard(isKeyboard);
  }

  function handleColumnAction(columnKey: string, action: ColumnAction) {
    setMenuColumnKey(null);
    const column = visibleColumns.find((item) => item.key === columnKey);
    if (action === "sort-asc" || action === "sort-desc") {
      if (column?.sortKey) props.onSortChange({ key: column.sortKey, isDescending: action === "sort-desc" });
    } else {
      onColumnStateChange(applyColumnAction(columnState, columnKey, action));
    }
    const position = columnKeys.indexOf(columnKey);
    const nextKey = action === "hide" ? (columnKeys[position + 1] ?? columnKeys[position - 1]) : columnKey;
    keyboard.focusCell({ index: -1, columnKey: nextKey });
  }

  const visible = useVirtualRows(scrollRef, rowPx, headerPx, OVERSCAN_ROWS);
  useScrollEdges(scrollRef, totalWidth);
  const start = Math.min(visible.start, items.length);
  const end = Math.min(visible.end, items.length);
  const isNearEnd = items.length > 0 && end >= items.length - END_REACHED_THRESHOLD;

  useEffect(() => {
    if (isNearEnd && hasMore && !isFetchingMore && !isLoading) reachEnd();
  }, [isNearEnd, hasMore, isFetchingMore, isLoading, reachEnd]);

  const isEmpty = !isLoading && items.length === 0;
  const trailingRows = isFetchingMore ? FETCHING_MORE_ROWS : 0;
  const bodyRows = isLoading ? LOADING_ROWS : items.length + trailingRows;

  function renderItem(index: number) {
    const item = items[index];
    if (item.type === "group") {
      return (
        <GroupRow
          key={`group:${item.key}`}
          groupKey={item.key}
          content={item.group.content}
          index={index}
          colCount={visibleColumns.length}
          isExpanded={!collapsedGroups.has(item.key)}
          isFocused={focus.index === index}
          onToggle={toggleGroup}
        />
      );
    }
    return (
      <GridRow
        key={`row:${item.key}`}
        rowKey={item.key}
        row={item.row}
        index={index}
        columns={visibleColumns}
        level={isGrouped ? 2 : undefined}
        isActive={item.key === activeRowKey}
        focusedColumnKey={focus.index === index ? focus.columnKey : null}
        className={getRowClassName?.(item.row) ?? ""}
        onOpen={openRow}
      />
    );
  }

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-line bg-card">
      <div ref={frameRef} className="relative min-h-0 overflow-hidden">
        <div
          ref={scrollRef}
          role="grid"
          aria-label={props.label}
          aria-rowcount={Math.max(props.rowCount, items.length) + 1}
          aria-colcount={visibleColumns.length}
          aria-busy={isLoading || isFetchingMore}
          className="group/grid absolute inset-0 overflow-auto overscroll-contain"
          onKeyDown={keyboard.onKeyDown}
          onFocus={keyboard.onFocus}
        >
          <GridHeader
            columns={visibleColumns}
            totalWidth={totalWidth}
            sort={sort}
            focusedColumnKey={focus.index === -1 ? focus.columnKey : null}
            menuColumnKey={menuColumnKey}
            reorder={reorder}
            resize={resize}
            onSort={sortColumn}
            isMenuFromKeyboard={isMenuFromKeyboard}
            onMenuOpenChange={openMenu}
            onAction={handleColumnAction}
          />
          <div
            role="rowgroup"
            className="relative min-w-full"
            style={{ width: `${totalWidth}rem`, height: `${bodyRows * ROW_HEIGHT_REM}rem` }}
          >
            {isLoading
              ? range(0, LOADING_ROWS).map((index) => (
                  <SkeletonRow key={index} index={index} columns={visibleColumns} />
                ))
              : renderedIndices(start, end, focus.index).map(renderItem)}
            {!isLoading &&
              range(items.length, trailingRows).map((index) => (
                <SkeletonRow key={`more:${index}`} index={index} columns={visibleColumns} />
              ))}
          </div>
        </div>
        {isEmpty && (
          <div className="absolute inset-x-0 top-9 bottom-0 flex items-center justify-center p-6">
            {props.emptyState}
          </div>
        )}
        {resize.draft && <ResizeGuide x={resize.draft.lineX} widthPx={resize.draft.width * remPx} />}
        {reorder.drop && <DropIndicator x={reorder.drop.x} />}
      </div>
      {props.footer && <div className="relative z-20 bg-card">{props.footer}</div>}
    </div>
  );
}
