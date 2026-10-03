import { Table, Tooltip, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { SeverityTag } from "@/components/alerts/SeverityTag";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { isRowControl } from "@/lib/dom";
import { formatDateTime } from "@/lib/format";
import { isIncidentOpen } from "@/lib/incidents";
import { projectLabel } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { Incident } from "@/types/incident";
import type { Monitor } from "@/types/monitor";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { IncidentDuration } from "./IncidentDuration";
import { IncidentRowActions } from "./IncidentRowActions";
import { IncidentStatusPill } from "./IncidentStatusPill";
import { MonitorNames } from "./MonitorNames";

type IncidentsTableProps = {
  incidents: Incident[];
  monitors: Monitor[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  emptyText: ReactNode;
};

export function IncidentsTable({ incidents, monitors, selectedIds, onSelect, emptyText }: IncidentsTableProps) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();

  const columns: TableColumnsType<Incident> = [
    {
      title: "ID",
      key: "id",
      width: 80,
      render: (_, incident) => <span className="font-mono text-xs text-muted">{incident.id}</span>,
    },
    {
      title: "Title",
      key: "title",
      render: (_, incident) => (
        <span className="flex min-w-0 flex-col">
          <Link
            to={paths.incident(orgSlug, incident.id)}
            className="truncate font-medium text-ink hover:text-ink hover:underline"
          >
            {incident.title}
          </Link>
          <span className="truncate text-xs text-subtle">
            {incident.source === "auto" ? "Auto-created" : "Declared"} · {projectLabel(incident.project)}
          </span>
        </span>
      ),
    },
    {
      title: "Severity",
      key: "severity",
      width: 100,
      render: (_, incident) => <SeverityTag severity={incident.severity} />,
    },
    {
      title: "Status",
      key: "status",
      width: 124,
      render: (_, incident) => <IncidentStatusPill status={incident.status} />,
    },
    {
      title: "Monitors",
      key: "monitors",
      width: 170,
      render: (_, incident) => <MonitorNames monitorIds={incident.monitorIds} monitors={monitors} />,
    },
    {
      title: "Duration",
      key: "duration",
      width: 96,
      align: "right",
      render: (_, incident) => (
        <span className={`font-mono text-xs ${isIncidentOpen(incident) ? "text-down" : "text-muted"}`}>
          <IncidentDuration incident={incident} />
        </span>
      ),
    },
    {
      title: "Who",
      key: "assignee",
      width: 64,
      render: (_, incident) => <PersonAvatar name={incident.assignee} />,
    },
    {
      title: "Started",
      key: "started",
      width: 88,
      render: (_, incident) => (
        <Tooltip title={formatDateTime(incident.startedAt)}>
          <span className="font-mono text-xs text-subtle">
            <TimeAgo timestamp={incident.startedAt} intervalMs={30_000} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 80,
      render: (_, incident) => <IncidentRowActions incident={incident} />,
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={incidents}
      tableLayout="fixed"
      scroll={{ x: 1100 }}
      rowClassName={(incident) =>
        `group cursor-pointer ${isIncidentOpen(incident) && incident.severity === "critical" ? "[&>td]:bg-down-soft/40" : ""}`
      }
      onRow={(incident) => ({
        onClick: (event) => {
          if (isRowControl(event.target)) return;
          navigate(paths.incident(orgSlug, incident.id));
        },
      })}
      rowSelection={{
        selectedRowKeys: selectedIds,
        onChange: (keys) => onSelect(keys as string[]),
        columnWidth: 44,
      }}
      pagination={incidents.length > 20 ? { pageSize: 20, size: "small", showSizeChanger: false } : false}
      locale={{ emptyText }}
      className="rounded-lg border border-line bg-card"
    />
  );
}
