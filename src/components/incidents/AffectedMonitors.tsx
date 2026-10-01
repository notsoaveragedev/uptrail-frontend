import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { LatencyChart } from "@/components/charts/LatencyChart";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { incidentLatency } from "@/lib/incidents";
import { paths } from "@/lib/paths";
import type { Incident } from "@/types/incident";
import type { Monitor } from "@/types/monitor";

const CHART_HEIGHT = 128;

export function AffectedMonitors({ incident }: { incident: Incident }) {
  const { orgSlug = "" } = useParams();
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const affected = monitors.filter((monitor) => incident.monitorIds.includes(monitor.id));

  return (
    <Card title="Affected monitors" meta={incident.monitorIds.length}>
      {affected.length === 0 ? (
        <p className="px-4 pb-4 text-muted">No monitors linked to this incident.</p>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {affected.map((monitor) => (
            <AffectedMonitor key={monitor.id} monitor={monitor} incident={incident} orgSlug={orgSlug} />
          ))}
        </ul>
      )}
    </Card>
  );
}

type AffectedMonitorProps = { monitor: Monitor; incident: Incident; orgSlug: string };

function AffectedMonitor({ monitor, incident, orgSlug }: AffectedMonitorProps) {
  const now = useNow(60_000);
  const series = incidentLatency(monitor, incident, now);

  return (
    <li className="flex flex-col gap-2 border-b border-line px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <StatusBadge status={monitor.status} />
        <Link to={paths.monitor(orgSlug, monitor.id)} className="truncate font-medium text-ink hover:underline">
          {monitor.name}
        </Link>
      </div>
      <div aria-label={`${monitor.name} latency around the incident, incident window shaded`} role="img">
        <LatencyChart
          timestamps={series.timestamps}
          p50={series.p50}
          p95={series.p95}
          bands={series.bands}
          height={CHART_HEIGHT}
        />
      </div>
    </li>
  );
}
