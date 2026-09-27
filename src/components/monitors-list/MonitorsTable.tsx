import { Table, Tag, type TableColumnsType, type TableProps } from "antd";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { UptimeMeter } from "@/components/monitors/UptimeMeter";
import { useMonitorFilters } from "@/hooks/useMonitorFilters";
import { useNow } from "@/hooks/useNow";
import { formatAgo, formatLatency, formatUptime, uptimeTone } from "@/lib/format";
import { PAGE_SIZE, type SortKey } from "@/lib/monitorList";
import { displayUrl, formatInterval, MONITOR_TYPE_LABELS } from "@/lib/monitors";
import { STATUS_FILL, STATUS_LABELS } from "@/lib/status";
import type { Monitor } from "@/types/monitor";
import { MonitorActions } from "./MonitorActions";

type MonitorsTableProps = {
  monitors: Monitor[];
  isLoading: boolean;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  emptyText: ReactNode;
};

export function MonitorsTable({ monitors, isLoading, selectedIds, onSelect, emptyText }: MonitorsTableProps) {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const now = useNow();
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
            to={`/o/${orgSlug}/monitors/${monitor.id}`}
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
      render: (_, monitor) => (
        <span className="flex gap-2.5 font-mono text-xs text-muted">
          {monitor.regions.map((region) => (
            <span
              key={region.code}
              title={`${region.code}: ${STATUS_LABELS[region.status]}`}
              className="flex items-center gap-1"
            >
              <span className={`size-1.5 rounded-full ${STATUS_FILL[region.status]}`} />
              {region.code}
            </span>
          ))}
        </span>
      ),
    },
    {
      title: "Response",
      key: "latency",
      width: 104,
      align: "right",
      sorter: true,
      sortOrder: sortOrder("latency"),
      render: (_, monitor) => <Latency monitor={monitor} />,
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
          <span className={`w-14 text-right font-mono ${uptimeTone(monitor.uptime30d)}`}>
            {monitor.uptime30d === null ? "—" : formatUptime(monitor.uptime30d)}
          </span>
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
      render: (_, monitor) => (
        <span className="relative flex justify-end">
          <span className="font-mono text-xs text-subtle group-focus-within:invisible group-hover:invisible">
            {monitor.lastCheckedAt ? formatAgo(monitor.lastCheckedAt, now) : "—"}
          </span>
          <span className="absolute top-1/2 right-0 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <MonitorActions monitor={monitor} />
          </span>
        </span>
      ),
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
          navigate(`/o/${orgSlug}/monitors/${monitor.id}`);
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

function Latency({ monitor }: { monitor: Monitor }) {
  if (monitor.latencyMs === null) {
    return (
      <span className={`font-mono ${monitor.status === "down" ? "text-down" : "text-subtle"}`}>
        {monitor.status === "down" ? "Timeout" : "—"}
      </span>
    );
  }
  const { value, unit } = formatLatency(monitor.latencyMs);
  const tone = monitor.latencyMs >= 800 ? "text-degraded" : "text-ink";
  return (
    <span className={`font-mono ${tone}`}>
      {value}
      <span className="ml-0.5 text-xs text-subtle">{unit}</span>
    </span>
  );
}
