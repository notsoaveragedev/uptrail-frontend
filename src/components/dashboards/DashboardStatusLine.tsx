import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { MetaList } from "@/components/ui/MetaList";
import { useNow } from "@/hooks/useNow";
import { dashboardStats } from "@/lib/dashboards";
import { formatAgo, formatUptime, latencyText, LATENCY_THRESHOLD_MS } from "@/lib/format";
import { paths } from "@/lib/paths";

type DashboardStatusLineProps = {
  project: string;
  refreshedAt: number;
};

export function DashboardStatusLine({ project, refreshedAt }: DashboardStatusLineProps) {
  const { orgSlug = "" } = useParams();
  const now = useNow();
  const { data: monitors } = useQuery(monitorsQuery(orgSlug));

  if (!monitors) return <span className="text-subtle">Loading live numbers…</span>;

  const { uptime, p95, down } = dashboardStats(monitors, project);

  return (
    <MetaList>
      <span>
        <span className="font-mono text-up">{formatUptime(uptime)}</span> uptime
      </span>
      <span>
        <span className={`font-mono ${p95 !== null && p95 >= LATENCY_THRESHOLD_MS ? "text-degraded" : "text-ink"}`}>
          {p95 === null ? "—" : latencyText(p95)}
        </span>{" "}
        p95
      </span>
      <Link to={paths.monitors(orgSlug, { status: "down", project })} className="text-muted hover:text-ink">
        <span className={`font-mono ${down > 0 ? "text-down" : "text-ink"}`}>{down}</span> down
      </Link>
      <span>
        refreshed <span className="font-mono">{formatAgo(refreshedAt, now)}</span>
      </span>
    </MetaList>
  );
}
