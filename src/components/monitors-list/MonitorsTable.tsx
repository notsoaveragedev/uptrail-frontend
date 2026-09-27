import { Table, Tag, type TableColumnsType, type TableProps } from "antd";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { LastCheckedCell } from "@/components/monitors/LastCheckedCell";
import { MonitorLatency } from "@/components/monitors/MonitorLatency";
import { RegionDots } from "@/components/monitors/RegionDots";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { UptimeMeter } from "@/components/monitors/UptimeMeter";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { useMonitorFilters } from "@/hooks/useMonitorFilters";
import { PAGE_SIZE, type SortKey } from "@/lib/monitorList";
import { displayUrl, formatInterval, MONITOR_TYPE_LABELS } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { Monitor } from "@/types/monitor";

type MonitorsTableProps = {
  monitors: Monitor[];
  isLoading: boolean;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  emptyText: ReactNode;
};

export function MonitorsTable({ monitors, isLoading, selectedIds, onSelect, emptyText }: MonitorsTableProps) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const { filters, setParam, setSort } = useMonitorFilters();

  const sortOrder = (key: SortKey) =>
    filters.sort.key === key ? (filters.sort.isDescending ? ("descend" as const) : ("ascend" as const)) : null;

  const columns: TableColumnsType<Monitor> = [
    {
      title: "Status",
      key: "status",
      width: 108,
      sorter: true,
      sortOrder: sortOrder("status"),
      render: (_, monitor) => <StatusBadge status={monitor.status} />,
    },
    {
      title: "Name",
      key: "name",
      width: 200,
      sorter: true,
      sortOrder: sortOrder("name"),
      render: (_, monitor) => (
        <span className="flex min-w-0 flex-col">
          <Link
            to={paths.monitor(orgSlug, monitor.id)}
            onClick={(event) => event.stopPropagation()}
            className="truncate font-medium text-ink hover:text-ink hover:underline"
          >
            {monitor.name}
          </Link>
          <span className="truncate font-mono text-xs text-subtle">{displayUrl(monitor.url)}</span>
        </span>
      ),
    },
    {
      title: "Type · every",
      key: "type",
      width: 132,
      render: (_, monitor) => (
        <span className="flex items-center gap-2">
          <Tag className="m-0 font-mono text-xs">{MONITOR_TYPE_LABELS[monitor.type]}</Tag>
          <span className="font-mono text-xs text-subtle">{formatInterval(monitor.intervalSec)}</span>
        </span>
      ),
    },
    {
      title: "Regions",
      key: "regions",
      width: 136,
      render: (_, monitor) => <RegionDots regions={monitor.regions} />,
    },
    {
      title: "Response",
      key: "latency",
      width: 104,
      align: "right",
      sorter: true,
      sortOrder: sortOrder("latency"),
      render: (_, monitor) => <MonitorLatency ms={monitor.latencyMs} status={monitor.status} />,
    },
    {
      title: "Uptime 30d",
      key: "uptime",
      width: 136,
      sorter: true,
      sortOrder: sortOrder("uptime"),
      render: (_, monitor) => (
        <span className="flex items-center justify-end gap-3">
          <UptimeMeter uptime={monitor.uptime30d} />
          <UptimeValue value={monitor.uptime30d} className="w-14 text-right" />
        </span>
      ),
    },
    {
      title: "Checks",
      key: "checks",
      width: 108,
      render: (_, monitor) => <CheckTrail checks={monitor.checks.slice(-20)} />,
    },
    {
      title: "Checked",
      key: "checked",
      width: 128,
      align: "right",
      sorter: true,
      sortOrder: sortOrder("checked"),
      render: (_, monitor) => <LastCheckedCell monitor={monitor} />,
    },
  ];

  const handleChange: TableProps<Monitor>["onChange"] = (pagination, _filters, sorter, { action }) => {
    if (action === "paginate") setParam("page", pagination.current === 1 ? null : String(pagination.current));
    if (action !== "sort" || Array.isArray(sorter)) return;
    setSort(sorter.order ? (sorter.columnKey as SortKey) : null, sorter.order === "descend");
  };

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={monitors}
      loading={isLoading}
      onChange={handleChange}
      tableLayout="fixed"
      scroll={{ x: 1084 }}
      rowClassName={(monitor) =>
        `group cursor-pointer ${monitor.status === "paused" ? "text-muted" : ""} ${monitor.status === "down" ? "[&>td]:bg-down-soft/40" : ""}`
      }
      onRow={(monitor) => ({
        onClick: (event) => {
          if ((event.target as HTMLElement).closest("a, button, input, label, .ant-table-selection-column")) return;
          navigate(paths.monitor(orgSlug, monitor.id));
        },
      })}
      rowSelection={{
        selectedRowKeys: selectedIds,
        onChange: (keys) => onSelect(keys as string[]),
        columnWidth: 44,
      }}
      pagination={{
        current: filters.page,
        pageSize: PAGE_SIZE,
        total: monitors.length,
        showSizeChanger: false,
        hideOnSinglePage: false,
        showTotal: (total, [from, to]) => (
          <span className="text-muted">
            Showing{" "}
            <span className="font-mono text-ink">
              {from}–{to}
            </span>{" "}
            of <span className="font-mono text-ink">{total}</span>
          </span>
        ),
      }}
      locale={{ emptyText }}
      className="rounded-lg border border-line bg-card [&_.ant-table-pagination]:px-4"
    />
  );
}
