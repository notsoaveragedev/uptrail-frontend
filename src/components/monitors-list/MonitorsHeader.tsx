import { Button, Dropdown } from "antd";
import { LuDownload, LuPlus, LuUpload } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/useToast";
import { downloadBlob } from "@/lib/download";
import { toCsv, toJson } from "@/lib/monitorList";
import { paths } from "@/lib/paths";
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
  const { orgSlug = "" } = useParams();

  function exportAs(format: string) {
    const isCsv = format === "csv";
    const content = isCsv ? toCsv(visible) : toJson(visible);
    downloadBlob(new Blob([content], { type: isCsv ? "text/csv" : "application/json" }), `uptrail-monitors.${format}`);
    toast.success("Export ready", `${visible.length} monitors exported as ${format.toUpperCase()}.`);
  }

  return (
    <PageHeader
      title="Monitors"
      meta={
        <MetaList>
          <span>
            <span className="font-mono text-ink">{monitors.length}</span> monitors
          </span>
          {STATUSES.map((status) => {
            const isActive = selectedStatuses.includes(status);
            return (
              <button
                key={status}
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
            );
          })}
        </MetaList>
      }
      actions={
        <>
          <Button icon={<LuUpload />} onClick={() => navigate(paths.monitorImport(orgSlug))}>
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
          <Button type="primary" icon={<LuPlus />} onClick={() => navigate(paths.monitorNew(orgSlug))}>
            New monitor
          </Button>
        </>
      }
    />
  );
}
