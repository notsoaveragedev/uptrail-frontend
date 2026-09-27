import { Segmented, Table, Tag, type TableColumnsType } from "antd";
import { LuArrowDown } from "react-icons/lu";
import { Link, useParams, useSearchParams } from "react-router";
import { Sparkline } from "@/components/charts/Sparkline";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { StatusLabel } from "@/components/monitors/StatusLabel";
import { CustomInput } from "@/components/ui/CustomInput";
import { useNow } from "@/hooks/useNow";
import { formatAgo, formatLatency, formatUptime, uptimeTone } from "@/lib/format";
import { STATUS_FILL, STATUS_LABELS, STATUS_TEXT } from "@/lib/status";
import type { Monitor, MonitorStatus, StatusCounts } from "@/types/overview";
import { MonitorRowActions } from "./MonitorRowActions";

const FILTERS = ["all", "down", "degraded", "up", "paused"] as const;

type LiveMonitorsTableProps = {
  monitors: Monitor[];
  counts: StatusCounts;
  totalMonitors: number;
  pendingCount: number;
  onShowPending: () => void;
};

export function LiveMonitorsTable({
  monitors,
  counts,
  totalMonitors,
  pendingCount,
  onShowPending,
}: LiveMonitorsTableProps) {
  const { orgSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const now = useNow();
  const filter = FILTERS.find((value) => value === searchParams.get("status")) ?? "all";
  const query = searchParams.get("q") ?? "";

  function updateParam(key: string, value: string) {
    setSearchParams(
      (params) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        return params;
      },
      { replace: true },
    );
  }

  const visible = monitors.filter(
    (monitor) =>
      (filter === "all" || monitor.status === filter) &&
      `${monitor.name} ${monitor.url}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const columns: TableColumnsType<Monitor> = [
    { title: "Status", key: "status", width: 136, render: (_, monitor) => <StatusLabel status={monitor.status} /> },
    {
      title: "Name",
      key: "name",
      render: (_, monitor) => (
        <span className="flex flex-col">
          <span className="font-medium">{monitor.name}</span>
          <span className="font-mono text-xs text-subtle">{monitor.url}</span>
        </span>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: 96,
      render: (_, monitor) => <Tag className="m-0 font-mono text-xs">{monitor.type}</Tag>,
    },
    {
      title: "Checks · last 30",
      key: "checks",
      width: 170,
      render: (_, monitor) => <CheckTrail checks={monitor.checks} />,
    },
    {
      title: "Response",
      key: "latency",
      width: 160,
      align: "right",
      render: (_, monitor) => <LatencyCell monitor={monitor} />,
    },
    {
      title: "Uptime 24h",
      key: "uptime",
      width: 120,
      align: "right",
      render: (_, monitor) => (
        <span className={`font-mono ${uptimeTone(monitor.uptime)}`}>
          {monitor.uptime === null ? "—" : formatUptime(monitor.uptime)}
        </span>
      ),
    },
    {
      title: "Regions",
      key: "regions",
      width: 150,
      render: (_, monitor) => (
        <span className="flex gap-2.5 font-mono text-xs text-muted">
          {monitor.regions.map((region) => (
            <span
              key={region.code}
              className="flex items-center gap-1"
              title={`${region.code}: ${STATUS_LABELS[region.status]}`}
            >
              <span className={`size-1.5 rounded-full ${STATUS_FILL[region.status]}`} />
              {region.code}
            </span>
          ))}
        </span>
      ),
    },
    {
      title: "Checked",
      key: "checked",
      width: 124,
      align: "right",
      render: (_, monitor) => (
        <span className="relative flex justify-end">
          <span className="font-mono text-xs text-subtle group-focus-within:invisible group-hover:invisible">
            {monitor.lastCheckedAt ? formatAgo(monitor.lastCheckedAt, now) : "—"}
          </span>
          <span className="absolute top-1/2 right-0 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <MonitorRowActions monitor={monitor} />
          </span>
        </span>
      ),
    },
  ];

  return (
    <section className="rounded-lg border border-line bg-card">
      <header className="flex flex-wrap items-center gap-3 px-4 py-3">
        <h2 className="text-md font-semibold">Live monitors</h2>
        <span className="font-mono text-xs text-subtle">{totalMonitors}</span>
        {pendingCount > 0 && (
          <button
            type="button"
            onClick={onShowPending}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-accent-soft px-2.5 py-0.5 text-xs text-accent"
          >
            <LuArrowDown aria-hidden className="size-3" />
            {pendingCount} new results · Show
          </button>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Segmented
            value={filter}
            onChange={(value) => updateParam("status", value)}
            options={FILTERS.map((value) => ({
              value,
              label:
                value === "all" ? (
                  "All"
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${STATUS_FILL[value]}`} />
                    {STATUS_LABELS[value]}
                    <span className="font-mono text-xs text-subtle">{counts[value]}</span>
                  </span>
                ),
            }))}
          />
          <div className="w-56">
            <CustomInput
              type="search"
              size="middle"
              aria-label="Filter monitors"
              placeholder="Filter by name or URL"
              value={query}
              onChange={(event) => updateParam("q", event.target.value)}
            />
          </div>
        </div>
      </header>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={visible}
        pagination={false}
        scroll={{ x: 1100 }}
        rowClassName={(monitor) => `group ${monitor.status === "down" ? "[&>td]:bg-down-soft/40" : ""}`}
        locale={{ emptyText: <span className="block py-8 text-muted">No monitors match these filters.</span> }}
      />

      <footer className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-subtle">
        <span className="flex items-center gap-2">
          Showing <span className="font-mono text-ink">{visible.length}</span> of{" "}
          <span className="font-mono text-ink">{totalMonitors}</span>
          <span className="flex items-center gap-1.5 text-up">
            <span className="size-1.5 rounded-full bg-up" />
            Updated live
          </span>
        </span>
        <Link to={`/o/${orgSlug}/monitors`}>View all monitors →</Link>
      </footer>
    </section>
  );
}

function LatencyCell({ monitor }: { monitor: Monitor }) {
  const tone: Record<MonitorStatus, string> = { ...STATUS_TEXT, up: "text-ink" };

  if (monitor.latencyMs === null) {
    return (
      <span className={`font-mono ${monitor.status === "down" ? "text-down" : "text-subtle"}`}>
        {monitor.status === "down" ? "Timeout" : "—"}
      </span>
    );
  }

  const { value, unit } = formatLatency(monitor.latencyMs);
  return (
    <span className="flex items-center justify-end gap-3">
      <Sparkline
        values={monitor.latencyHistory}
        className={monitor.status === "degraded" ? "text-degraded" : "text-subtle"}
      />
      <span key={monitor.lastCheckedAt} className={`animate-flash rounded-sm px-1 font-mono ${tone[monitor.status]}`}>
        {value}
        <span className="ml-0.5 text-xs text-subtle">{unit}</span>
      </span>
    </span>
  );
}
