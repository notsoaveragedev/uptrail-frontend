import { Segmented, Table, Tag, type TableColumnsType } from "antd";
import { LuArrowDown } from "react-icons/lu";
import { Link, useParams, useSearchParams } from "react-router";
import { Sparkline } from "@/components/charts/Sparkline";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { LastCheckedCell } from "@/components/monitors/LastCheckedCell";
import { MonitorLatency } from "@/components/monitors/MonitorLatency";
import { RegionDots } from "@/components/monitors/RegionDots";
import { StatusLabel } from "@/components/monitors/StatusLabel";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { Card } from "@/components/ui/Card";
import { CustomInput } from "@/components/ui/CustomInput";
import { StatusDot } from "@/components/ui/StatusDot";
import { useSearchParam } from "@/hooks/useSearchParam";
import { displayUrl, MONITOR_TYPE_LABELS } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import { writeParam } from "@/lib/searchParams";
import { STATUS_FILL, STATUS_LABELS } from "@/lib/status";
import type { Monitor } from "@/types/monitor";
import type { StatusCounts } from "@/types/overview";

const FILTERS = ["all", "down", "degraded", "up", "paused"] as const;

const COLUMNS: TableColumnsType<Monitor> = [
  { title: "Status", key: "status", width: 136, render: (_, monitor) => <StatusLabel status={monitor.status} /> },
  {
    title: "Name",
    key: "name",
    render: (_, monitor) => (
      <span className="flex flex-col">
        <span className="font-medium">{monitor.name}</span>
        <span className="font-mono text-xs text-subtle">{displayUrl(monitor.url)}</span>
      </span>
    ),
  },
  {
    title: "Type",
    key: "type",
    width: 96,
    render: (_, monitor) => <Tag className="m-0 font-mono text-xs">{MONITOR_TYPE_LABELS[monitor.type]}</Tag>,
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
    render: (_, monitor) => (
      <span className="flex items-center justify-end gap-3">
        {monitor.latencyMs !== null && (
          <Sparkline
            values={monitor.latencyHistory}
            className={monitor.status === "degraded" ? "text-degraded" : "text-subtle"}
          />
        )}
        <MonitorLatency
          key={monitor.lastCheckedAt}
          ms={monitor.latencyMs}
          status={monitor.status}
          className="animate-flash rounded-sm px-1"
        />
      </span>
    ),
  },
  {
    title: "Uptime 24h",
    key: "uptime",
    width: 120,
    align: "right",
    render: (_, monitor) => <UptimeValue value={monitor.uptime24h} />,
  },
  {
    title: "Regions",
    key: "regions",
    width: 150,
    render: (_, monitor) => <RegionDots regions={monitor.regions} />,
  },
  {
    title: "Checked",
    key: "checked",
    width: 124,
    align: "right",
    render: (_, monitor) => <LastCheckedCell monitor={monitor} />,
  },
];

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
  const { orgSlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useSearchParam("status", FILTERS, "all", { replace: true });
  const query = searchParams.get("q") ?? "";

  function setQuery(value: string) {
    setSearchParams((params) => writeParam(params, "q", value), { replace: true });
  }

  const visible = monitors.filter(
    (monitor) =>
      (filter === "all" || monitor.status === filter) &&
      `${monitor.name} ${monitor.url}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Card
      title="Live monitors"
      meta={totalMonitors}
      extra={
        <div className="flex flex-1 flex-wrap items-center gap-3">
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
              onChange={setFilter}
              options={FILTERS.map((value) => ({
                value,
                label:
                  value === "all" ? (
                    "All"
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <StatusDot fill={STATUS_FILL[value]} />
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
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        </div>
      }
    >
      <Table
        rowKey="id"
        columns={COLUMNS}
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
            <StatusDot />
            Updated live
          </span>
        </span>
        <Link to={paths.monitors(orgSlug)}>View all monitors →</Link>
      </footer>
    </Card>
  );
}
