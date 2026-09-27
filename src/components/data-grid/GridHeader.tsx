import { Fragment } from "react";
import { type ColumnAction, isFirstPinnedRight, type ResolvedColumn } from "@/lib/dataGrid";
import type { GridSort } from "@/types/dataGrid";
import { HeaderCell } from "./HeaderCell";
import type { useColumnReorder } from "./useColumnReorder";
import type { useColumnResize } from "./useColumnResize";

type GridHeaderProps<Row> = {
  columns: ResolvedColumn<Row>[];
  totalWidth: number;
  sort: GridSort;
  focusedColumnKey: string | null;
  menuColumnKey: string | null;
  isMenuFromKeyboard: boolean;
  reorder: ReturnType<typeof useColumnReorder>;
  resize: ReturnType<typeof useColumnResize>;
  onSort: (columnKey: string) => void;
  onMenuOpenChange: (columnKey: string | null) => void;
  onAction: (columnKey: string, action: ColumnAction) => void;
};

export function GridHeader<Row>({
  columns,
  totalWidth,
  focusedColumnKey,
  menuColumnKey,
  ...props
}: GridHeaderProps<Row>) {
  return (
    <div role="rowgroup" className="sticky top-0 z-[2] min-w-full" style={{ width: `${totalWidth}rem` }}>
      <div
        role="row"
        aria-rowindex={1}
        className="flex h-9 border-b border-line bg-panel text-caps font-medium tracking-wider text-subtle uppercase"
      >
        {columns.map((column) => (
          <Fragment key={column.key}>
            {isFirstPinnedRight(column) && <div aria-hidden className="flex-1" />}
            <HeaderCell
              column={column}
              isFocused={focusedColumnKey === column.key}
              isMenuOpen={menuColumnKey === column.key}
              isDragging={props.reorder.drop?.key === column.key}
              canHide={columns.length > 1}
              {...props}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
