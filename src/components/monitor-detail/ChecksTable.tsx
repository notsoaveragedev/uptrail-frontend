import { Table, type TableColumnsType, type TablePaginationConfig } from "antd";
import { StatusLabel } from "@/components/monitors/StatusLabel";
import { formatClock } from "@/lib/format";
import type { RecentCheck } from "@/types/monitorDetail";

const COLUMNS: TableColumnsType<RecentCheck> = [
  {
    title: "Time",
    key: "time",
    width: 128,
    render: (_, check) => <span className="font-mono">{formatClock(check.checkedAt)}</span>,
  },
  {
    title: "Region",
    key: "region",
    width: 96,
    render: (_, check) => <span className="font-mono">{check.region}</span>,
  },
  {
    title: "Status code",
    key: "code",
    width: 120,
    render: (_, check) => (
      <span className={`font-mono ${check.status === "down" ? "text-down" : "text-muted"}`}>
        {check.statusCode ?? "—"}
      </span>
    ),
  },
  {
    title: "Response",
    key: "response",
    width: 128,
    align: "right",
    render: (_, check) => (
      <span className={`font-mono ${check.status === "down" ? "text-down" : ""}`}>
        {check.responseMs.toLocaleString()}
        <span className="ml-1 text-xs text-subtle">ms</span>
      </span>
    ),
  },
  { title: "Result", key: "result", width: 148, render: (_, check) => <StatusLabel status={check.status} /> },
  {
    title: "Error",
    key: "error",
    render: (_, check) =>
      check.error ? (
        <span className={`font-mono text-xs ${check.status === "down" ? "text-down" : "text-degraded"}`}>
          {check.error}
        </span>
      ) : (
        <span className="text-faint">—</span>
      ),
  },
];

type ChecksTableProps = {
  checks: RecentCheck[];
  pagination?: false | TablePaginationConfig;
};

export function ChecksTable({ checks, pagination = false }: ChecksTableProps) {
  return (
    <Table
      rowKey="id"
      size="middle"
      columns={COLUMNS}
      dataSource={checks}
      pagination={pagination}
      scroll={{ x: 760 }}
      rowClassName={(check) => (check.status === "down" ? "[&>td]:bg-down-soft/30" : "")}
    />
  );
}
