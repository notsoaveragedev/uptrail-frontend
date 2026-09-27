import { Fragment, memo } from "react";
import { cellStyle, isFirstPinnedRight, pinClass, type ResolvedColumn, rowOffset } from "@/lib/dataGrid";

type GridRowProps<Row> = {
  rowKey: string;
  row: Row;
  index: number;
  columns: ResolvedColumn<Row>[];
  level: number | undefined;
  isActive: boolean;
  focusedColumnKey: string | null;
  className: string;
  onOpen: (key: string) => void;
};

function GridRowComponent<Row>(props: GridRowProps<Row>) {
  const { rowKey, row, index, columns, isActive, focusedColumnKey } = props;

  return (
    <div
      role="row"
      aria-rowindex={index + 2}
      aria-level={props.level}
      aria-selected={isActive}
      data-active={isActive || undefined}
      className={`group/row absolute inset-x-0 top-0 flex h-8 cursor-pointer border-b border-line hover:bg-hover data-active:bg-hover ${props.className}`}
      style={rowOffset(index)}
      onClick={() => props.onOpen(rowKey)}
    >
      {isActive && (
        <span aria-hidden className="sticky left-0 z-[2] w-0">
          <span className="absolute inset-y-0 left-0 w-0.5 bg-ink" />
        </span>
      )}
      {columns.map((column) => (
        <Fragment key={column.key}>
          {isFirstPinnedRight(column) && <div aria-hidden className="flex-1" />}
          <div
            role="gridcell"
            aria-colindex={column.colIndex}
            tabIndex={focusedColumnKey === column.key ? 0 : -1}
            data-cell
            data-index={index}
            data-col={column.key}
            data-zone={column.zone}
            className={`flex h-full flex-none items-center px-3 outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--muted)] ${column.align === "right" ? "justify-end" : ""} ${pinClass(column, "body")}`}
            style={cellStyle(column)}
          >
            <div className="flex min-w-0 items-center overflow-hidden whitespace-nowrap">{column.render(row)}</div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export const GridRow = memo(GridRowComponent) as typeof GridRowComponent;
