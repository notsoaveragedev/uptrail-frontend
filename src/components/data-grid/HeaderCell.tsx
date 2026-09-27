import { Button, Dropdown, type MenuProps } from "antd";
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide, LuEllipsis, LuEyeOff, LuPin, LuPinOff } from "react-icons/lu";
import { ariaSortOf, cellStyle, type ColumnAction, minWidthOf, pinClass, type ResolvedColumn } from "@/lib/dataGrid";
import type { GridSort } from "@/types/dataGrid";
import type { useColumnReorder } from "./useColumnReorder";
import type { useColumnResize } from "./useColumnResize";

type HeaderCellProps<Row> = {
  column: ResolvedColumn<Row>;
  sort: GridSort;
  isFocused: boolean;
  isMenuOpen: boolean;
  isMenuFromKeyboard: boolean;
  isDragging: boolean;
  canHide: boolean;
  reorder: ReturnType<typeof useColumnReorder>;
  resize: ReturnType<typeof useColumnResize>;
  onSort: (columnKey: string) => void;
  onMenuOpenChange: (columnKey: string | null) => void;
  onAction: (columnKey: string, action: ColumnAction) => void;
};

function menuItems<Row>(column: ResolvedColumn<Row>, canHide: boolean): MenuProps["items"] {
  const sortItems = column.sortKey
    ? [
        { key: "sort-asc", icon: <LuArrowUpNarrowWide />, label: "Sort ascending" },
        { key: "sort-desc", icon: <LuArrowDownWideNarrow />, label: "Sort descending" },
        { type: "divider" as const },
      ]
    : [];
  const pinItems = [
    column.zone !== "left" && { key: "pin-left", icon: <LuPin />, label: "Pin left" },
    column.zone !== "right" && { key: "pin-right", icon: <LuPin className="scale-x-[-1]" />, label: "Pin right" },
    column.zone !== "center" && { key: "unpin", icon: <LuPinOff />, label: "Unpin" },
  ].filter((item) => item !== false);
  const hideItems = canHide
    ? [{ type: "divider" as const }, { key: "hide", icon: <LuEyeOff />, label: "Hide column" }]
    : [];
  return [...sortItems, ...pinItems, ...hideItems];
}

function SortArrow({ direction }: { direction: string | undefined }) {
  if (!direction) return null;
  return <span aria-hidden>{direction === "descending" ? "▼" : "▲"}</span>;
}

export function HeaderCell<Row>(props: HeaderCellProps<Row>) {
  const { column, sort, isFocused, isMenuOpen, isDragging, canHide, reorder, resize } = props;
  const direction = ariaSortOf(sort, column.sortKey);
  const isRight = column.align === "right";
  const hasTitle = column.title !== "";

  function handleLabelClick() {
    if (!reorder.consumeDrag() && column.sortKey) props.onSort(column.key);
  }

  return (
    <div
      role="columnheader"
      aria-colindex={column.colIndex}
      aria-sort={direction}
      tabIndex={isFocused ? 0 : -1}
      data-cell
      data-index={-1}
      data-col={column.key}
      data-zone={column.zone}
      className={`group/header flex h-full flex-none items-center outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--muted)] ${pinClass(column, "header")} ${isDragging ? "opacity-40" : ""}`}
      style={cellStyle(column)}
    >
      {hasTitle ? (
        <span
          {...reorder.getDragProps(column.key, column.zone)}
          onClick={handleLabelClick}
          className={`flex h-full min-w-0 flex-1 touch-none items-center gap-1 px-3 select-none ${isRight ? "justify-end" : ""} ${direction ? "text-ink" : ""} ${column.sortKey ? "cursor-pointer hover:text-ink" : "cursor-grab"}`}
        >
          <span className="truncate">{column.title}</span>
          <SortArrow direction={direction} />
        </span>
      ) : (
        <span className="sr-only">{column.key}</span>
      )}
      {hasTitle && (
        <Dropdown
          trigger={["click"]}
          open={isMenuOpen}
          onOpenChange={(open) => props.onMenuOpenChange(open ? column.key : null)}
          menu={{
            items: menuItems(column, canHide),
            onClick: ({ key }) => props.onAction(column.key, key as ColumnAction),
          }}
          autoFocus={props.isMenuFromKeyboard}
        >
          <Button
            type="text"
            size="small"
            tabIndex={-1}
            aria-label={`${column.title} column options`}
            icon={<LuEllipsis />}
            className={`absolute top-1/2 -translate-y-1/2 bg-panel text-subtle hover:text-ink ${isRight ? "left-1" : "right-1.5"} ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover/header:opacity-100 group-focus-visible/header:opacity-100"}`}
          />
        </Dropdown>
      )}
      <span
        aria-hidden
        {...resize.getHandleProps({
          key: column.key,
          width: column.width,
          minWidth: minWidthOf(column),
          zone: column.zone,
        })}
        className={`absolute inset-y-0 z-[2] w-2 cursor-col-resize touch-none after:absolute after:inset-y-2 after:left-1/2 after:w-px after:bg-line-strong after:opacity-0 hover:after:opacity-100 ${column.zone === "right" ? "-left-1" : "-right-1"}`}
      />
    </div>
  );
}
