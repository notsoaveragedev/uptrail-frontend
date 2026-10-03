import { Table, Tooltip, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { RESOURCE_LABELS } from "@/lib/audit";
import { rootFontSize } from "@/lib/dom";
import { formatClock, formatDateTime, formatDay } from "@/lib/format";
import { projectLabel } from "@/lib/monitors";
import type { AuditEvent } from "@/types/audit";
import { AuditAction } from "./AuditAction";
import { AuditActor } from "./AuditActor";

type AuditTableProps = {
  events: AuditEvent[];
  activeId: string | null;
  onOpen: (id: string) => void;
  emptyText: ReactNode;
};

const columns: TableColumnsType<AuditEvent> = [
  {
    title: "Time",
    key: "time",
    width: 140,
    render: (_, event) => (
      <Tooltip title={formatDateTime(event.at)}>
        <span className="font-mono text-xs text-muted">
          {formatDay(event.at)} <span className="text-ink">{formatClock(event.at)}</span>
        </span>
      </Tooltip>
    ),
  },
  { title: "Actor", key: "actor", width: 170, render: (_, event) => <AuditActor actor={event.actor} /> },
  { title: "Action", key: "action", width: 170, render: (_, event) => <AuditAction action={event.action} /> },
  {
    title: "Resource",
    key: "resource",
    render: (_, event) => (
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="truncate text-ink">{event.resource.name}</span>
        <span className="shrink-0 text-xs text-subtle">
          {RESOURCE_LABELS[event.resource.type] ?? event.resource.type}
        </span>
      </span>
    ),
  },
  {
    title: "Project",
    key: "project",
    width: 100,
    render: (_, event) => <span className="text-muted">{event.project ? projectLabel(event.project) : "—"}</span>,
  },
  {
    title: "IP",
    key: "ip",
    width: 120,
    render: (_, event) => <span className="font-mono text-xs text-subtle">{event.ip ?? "—"}</span>,
  },
];

export function AuditTable({ events, activeId, onOpen, emptyText }: AuditTableProps) {
  return (
    <Table
      virtual
      rowKey="id"
      size="small"
      columns={columns}
      dataSource={events}
      scroll={{ x: 880, y: 34 * rootFontSize() }}
      pagination={false}
      rowClassName={(event) => `cursor-pointer ${event.id === activeId ? "[&>td]:bg-hover!" : ""}`}
      onRow={(event) => ({ onClick: () => onOpen(event.id) })}
      locale={{ emptyText }}
      className="overflow-hidden rounded-lg border border-line bg-card"
    />
  );
}
