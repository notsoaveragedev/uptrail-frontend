import type { ReactNode } from "react";

export type GridColumn<Row> = {
  key: string;
  title: string;
  width: number;
  minWidth?: number;
  align?: "left" | "right";
  sortKey?: string;
  render: (row: Row) => ReactNode;
};

export type ColumnState = {
  order: string[];
  widths: Record<string, number>;
  hidden: string[];
  pinnedLeft: string[];
  pinnedRight: string[];
};

type GridGroup = {
  key: string;
  content: ReactNode;
};

export type GridItem<Row> =
  { type: "row"; key: string; row: Row; groupKey?: string } | { type: "group"; key: string; group: GridGroup };

export type GridSort = {
  key: string;
  isDescending: boolean;
};
