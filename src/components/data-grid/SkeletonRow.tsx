import { Skeleton } from "antd";
import { Fragment } from "react";
import { cellStyle, isFirstPinnedRight, pinClass, type ResolvedColumn, rowOffset } from "@/lib/dataGrid";

type SkeletonRowProps<Row> = {
  index: number;
  columns: ResolvedColumn<Row>[];
};

function barWidth(index: number, colIndex: number) {
  return `${45 + ((index * 17 + colIndex * 29) % 45)}%`;
}

export function SkeletonRow<Row>({ index, columns }: SkeletonRowProps<Row>) {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 flex h-8 border-b border-line" style={rowOffset(index)}>
      {columns.map((column) => (
        <Fragment key={column.key}>
          {isFirstPinnedRight(column) && <div className="flex-1" />}
          <div
            className={`flex h-full flex-none items-center px-3 ${pinClass(column, "skeleton")}`}
            style={cellStyle(column)}
          >
            {column.title && (
              <Skeleton.Node
                active
                className={`flex w-full ${column.align === "right" ? "justify-end" : ""}`}
                style={{ width: barWidth(index, column.colIndex), height: "0.625rem" }}
              />
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
