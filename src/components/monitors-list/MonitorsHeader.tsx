import { Button, Dropdown } from "antd";
import { LuDownload, LuPlus, LuUpload } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { useToast } from "@/hooks/useToast";
import { downloadFile, toCsv, toJson } from "@/lib/monitorList";
import { STATUS_TEXT, STATUSES } from "@/lib/status";
import type { Monitor, MonitorStatus } from "@/types/monitor";

type MonitorsHeaderProps = {
  monitors: Monitor[];
  visible: Monitor[];
  selectedStatuses: MonitorStatus[];
  onToggleStatus: (status: MonitorStatus) => void;
};

export function MonitorsHeader({ monitors, visible, selectedStatuses, onToggleStatus }: MonitorsHeaderProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug } = useParams();

  function exportAs(format: string) {
    const isCsv = format === "csv";
    downloadFile(
      isCsv ? toCsv(visible) : toJson(visible),
      `uptrail-monitors.${format}`,
      isCsv ? "text/csv" : "application/json",
    );
    toast.success("Export ready", `${visible.length} monitors exported as ${format.toUpperCase()}.`);
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight outline-none">
          Monitors
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-muted">
          <span>
            <span className="font-mono text-ink">{monitors.length}</span> monitors
          </span>
          {STATUSES.map((status) => {
            const isActive = selectedStatuses.includes(status);
            return (
              <span key={status} className="flex items-center gap-2">
                <span className="text-faint">·</span>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onToggleStatus(status)}
                  className={`cursor-pointer rounded-sm px-1 hover:text-ink ${isActive ? "bg-hover text-ink" : ""}`}
                >
                  <span className={`font-mono ${STATUS_TEXT[status]}`}>
                    {monitors.filter((monitor) => monitor.status === status).length}
                  </span>{" "}
                  {status}
                </button>
              </span>
            );
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button icon={<LuUpload />} onClick={() => navigate(`/o/${orgSlug}/monitors/import`)}>
          Import
        </Button>
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "csv", label: "Export as CSV" },
              { key: "json", label: "Export as JSON" },
            ],
            onClick: ({ key }) => exportAs(key),
          }}
        >
          <Button icon={<LuDownload />}>Export</Button>
        </Dropdown>
        <Button type="primary" icon={<LuPlus />} onClick={() => navigate(`/o/${orgSlug}/monitors/new`)}>
          New monitor
        </Button>
      </div>
    </div>
  );
}
