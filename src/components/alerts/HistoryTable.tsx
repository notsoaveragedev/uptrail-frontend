import { Table, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { isRowControl } from "@/lib/dom";
import { formatDateTime } from "@/lib/format";
import { paths } from "@/lib/paths";
import type { AlertChannel, AlertEvent, AlertRule } from "@/types/alerts";
import type { Monitor } from "@/types/monitor";
import { AcknowledgeCell } from "./AcknowledgeCell";
import { DeliveryIcons } from "./DeliveryIcons";
import { EventStatus } from "./EventStatus";
import { ExpressionCell } from "./ExpressionCell";

type HistoryTableProps = {
  events: AlertEvent[];
  rules: AlertRule[];
  channels: AlertChannel[];
  monitors: Monitor[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onOpen: (eventId: string) => void;
  emptyText: ReactNode;
};

const PAGE_SIZE = 15;

export function HistoryTable({
  events,
  rules,
  channels,
  monitors,
  selectedIds,
  onSelect,
  onOpen,
  emptyText,
}: HistoryTableProps) {
  const { orgSlug = "" } = useParams();
  const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
  const monitorById = new Map(monitors.map((monitor) => [monitor.id, monitor]));

  const columns: TableColumnsType<AlertEvent> = [
    {
      title: "Fired",
      key: "fired",
      width: 128,
      render: (_, event) => <span className="font-mono text-xs">{formatDateTime(event.firedAt)}</span>,
    },
    {
      title: "Rule",
      key: "rule",
      render: (_, event) => {
        const rule = ruleById.get(event.ruleId);
        return (
          <span className="flex min-w-0 flex-col items-start">
            <button
              type="button"
              onClick={() => onOpen(event.id)}
              className="max-w-full cursor-pointer truncate font-medium text-ink hover:underline"
            >
              {rule?.name ?? "Deleted rule"}
            </button>
            {rule && <ExpressionCell expression={rule.expression} className="max-w-full opacity-60" />}
          </span>
        );
      },
    },
    {
      title: "Monitor",
      key: "monitor",
      width: 160,
      render: (_, event) => {
        const monitor = event.monitorId ? monitorById.get(event.monitorId) : undefined;
        if (!monitor) return <span className="text-subtle">—</span>;
        return (
          <Link
            to={paths.monitor(orgSlug, monitor.id)}
            className="block truncate text-muted hover:text-ink hover:underline"
          >
            {monitor.name}
          </Link>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, event) => <EventStatus event={event} />,
    },
    {
      title: "Delivered",
      key: "delivered",
      width: 104,
      render: (_, event) => <DeliveryIcons deliveries={event.deliveries} channels={channels} />,
    },
    {
      title: "Ack",
      key: "ack",
      width: 128,
      render: (_, event) => <AcknowledgeCell event={event} />,
    },
    {
      title: "Incident",
      key: "incident",
      width: 92,
      render: (_, event) =>
        event.incidentId ? (
          <Link
            to={paths.incident(orgSlug, event.incidentId)}
            className="font-mono text-xs text-muted hover:text-ink hover:underline"
          >
            {event.incidentId}
          </Link>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={events}
      tableLayout="fixed"
      scroll={{ x: 1100 }}
      rowClassName={(event) => `cursor-pointer ${event.status === "firing" ? "[&>td]:bg-down-soft/40" : ""}`}
      onRow={(event) => ({
        onClick: (clickEvent) => {
          if (isRowControl(clickEvent.target)) return;
          onOpen(event.id);
        },
      })}
      rowSelection={{
        selectedRowKeys: selectedIds,
        onChange: (keys) => onSelect(keys as string[]),
        getCheckboxProps: (event) => ({
          disabled: event.acknowledgedBy !== null,
          "aria-label": event.acknowledgedBy ? "Already acknowledged" : "Select alert",
        }),
        columnWidth: 44,
      }}
      pagination={{
        pageSize: PAGE_SIZE,
        showSizeChanger: false,
        hideOnSinglePage: true,
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
