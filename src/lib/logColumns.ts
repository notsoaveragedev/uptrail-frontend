import type { ColumnState, GridColumn } from "@/types/dataGrid";
import type { CheckResult } from "@/types/logs";

type LogColumnMeta = Omit<GridColumn<CheckResult>, "render">;

export const LOG_COLUMNS: LogColumnMeta[] = [
  { key: "time", title: "Time", width: 9, sortKey: "ts" },
  { key: "monitor", title: "Monitor", width: 15, minWidth: 8, sortKey: "monitor" },
  { key: "region", title: "Region", width: 4.5, sortKey: "region" },
  { key: "status", title: "Status", width: 7 },
  { key: "code", title: "Code", width: 4.5, sortKey: "statusCode" },
  { key: "latency", title: "Latency", width: 8.5, align: "right", sortKey: "latency" },
  { key: "timings", title: "Timings", width: 8 },
  { key: "size", title: "Size", width: 5, align: "right" },
  { key: "error", title: "Error", width: 18, minWidth: 12 },
  { key: "id", title: "ID", width: 8 },
  { key: "actions", title: "", width: 4.5, minWidth: 4.5 },
];

export const LOG_COLUMN_LABELS: Record<string, string> = {
  ...Object.fromEntries(LOG_COLUMNS.map((column) => [column.key, column.title])),
  actions: "Actions",
};

export const defaultLogColumnState: ColumnState = {
  order: LOG_COLUMNS.map((column) => column.key),
  widths: {},
  hidden: ["timings", "size", "id"],
  pinnedLeft: ["time"],
  pinnedRight: ["actions"],
};

export const LATENCY_SCALE_MS = 2000;

export function isErrorCode(code: number | null) {
  return code !== null && code >= 400;
}

export function checkLink(id: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("check", id);
  return url.toString();
}
