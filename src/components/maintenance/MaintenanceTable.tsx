import { Button, Dropdown, Table, Tooltip, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { LuCopy, LuEllipsis, LuGlobe, LuPencil, LuRepeat, LuTrash2 } from "react-icons/lu";
import { MonitorNames } from "@/components/incidents/MonitorNames";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { isRowControl } from "@/lib/dom";
import { formatDateTime, formatTime } from "@/lib/format";
import { durationLabel, maintenancePhase, nextStart, recurrenceLabel } from "@/lib/maintenance";
import { projectLabel } from "@/lib/monitors";
import { offsetLabel } from "@/lib/timezones";
import type { MaintenancePhase, MaintenanceWindow } from "@/types/maintenance";
import type { Monitor, MonitorStatus } from "@/types/monitor";
import { useMaintenanceActions } from "./useMaintenanceActions";

const PHASE_BADGE: Record<MaintenancePhase, { status: MonitorStatus; label: string }> = {
  active: { status: "degraded", label: "In progress" },
  upcoming: { status: "up", label: "Scheduled" },
  past: { status: "paused", label: "Completed" },
};

type MaintenanceTableProps = {
  windows: MaintenanceWindow[];
  monitors: Monitor[];
  now: number;
  onEdit: (entry: MaintenanceWindow) => void;
  onDuplicate: (entry: MaintenanceWindow) => void;
  emptyText: ReactNode;
};

export function MaintenanceTable({ windows, monitors, now, onEdit, onDuplicate, emptyText }: MaintenanceTableProps) {
  const actions = useMaintenanceActions();

  const columns: TableColumnsType<MaintenanceWindow> = [
    {
      title: "Window",
      key: "title",
      render: (_, entry) => (
        <span className="flex min-w-0 flex-col">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="cursor-pointer truncate text-left font-medium text-ink hover:underline"
          >
            {entry.title}
          </button>
          <span className="truncate text-xs text-subtle">
            {projectLabel(entry.project)}
            {entry.description && ` · ${entry.description}`}
          </span>
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, entry) => <StatusBadge {...PHASE_BADGE[maintenancePhase(entry, now)]} />,
    },
    {
      title: "When",
      key: "when",
      width: 210,
      render: (_, entry) => {
        const start = nextStart(entry, now);
        const end = start + (entry.endsAt - entry.startsAt);
        return (
          <span className="flex flex-col font-mono text-xs">
            <span className="text-ink">
              {formatDateTime(start)}–{formatTime(end)}
            </span>
            <span className="text-subtle">
              {entry.timezone} · {offsetLabel(entry.timezone)}
            </span>
          </span>
        );
      },
    },
    {
      title: "Duration",
      key: "duration",
      width: 90,
      align: "right",
      render: (_, entry) => <span className="font-mono text-xs text-muted">{durationLabel(entry)}</span>,
    },
    {
      title: "Repeats",
      key: "repeats",
      width: 150,
      render: (_, entry) =>
        entry.recurrence ? (
          <span className="flex items-center gap-1.5 text-muted">
            <LuRepeat aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{recurrenceLabel(entry.recurrence)}</span>
          </span>
        ) : (
          <span className="text-subtle">Once</span>
        ),
    },
    {
      title: "Monitors",
      key: "monitors",
      width: 190,
      render: (_, entry) => <MonitorNames monitorIds={entry.monitorIds} monitors={monitors} />,
    },
    {
      title: <span className="sr-only">Status page</span>,
      key: "public",
      width: 40,
      render: (_, entry) =>
        entry.showOnStatusPage && (
          <Tooltip title="Shown on the status page">
            <LuGlobe aria-label="Shown on the status page" className="size-3.5 text-subtle" />
          </Tooltip>
        ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 48,
      render: (_, entry) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{
            items: [
              { key: "edit", icon: <LuPencil />, label: "Edit", onClick: () => onEdit(entry) },
              { key: "duplicate", icon: <LuCopy />, label: "Duplicate", onClick: () => onDuplicate(entry) },
              { type: "divider" },
              {
                key: "delete",
                icon: <LuTrash2 />,
                danger: true,
                label: "Delete",
                onClick: () => actions.deleteWindow(entry),
              },
            ],
          }}
        >
          <Button
            type="text"
            size="small"
            aria-label={`Actions for ${entry.title}`}
            icon={<LuEllipsis />}
            className="row-actions"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={windows}
      tableLayout="fixed"
      scroll={{ x: 1060 }}
      rowClassName="group cursor-pointer"
      onRow={(entry) => ({
        onClick: (event) => {
          if (isRowControl(event.target)) return;
          onEdit(entry);
        },
      })}
      pagination={windows.length > 20 ? { pageSize: 20, size: "small", showSizeChanger: false } : false}
      locale={{ emptyText }}
      className="rounded-lg border border-line bg-card"
    />
  );
}
