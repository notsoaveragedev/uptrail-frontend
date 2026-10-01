import { useQuery } from "@tanstack/react-query";
import { LuCircleCheck } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { SeverityTag } from "@/components/alerts/SeverityTag";
import { IncidentDuration } from "@/components/incidents/IncidentDuration";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { isIncidentOpen, latestUpdateText } from "@/lib/incidents";
import { paths } from "@/lib/paths";

export function IncidentsTab({ monitorId }: { monitorId: string }) {
  const { orgSlug = "" } = useParams();
  const { data: incidents = [] } = useQuery(incidentsQuery(orgSlug));
  const forMonitor = incidents
    .filter((incident) => incident.monitorIds.includes(monitorId))
    .sort((a, b) => b.startedAt - a.startedAt);

  return (
    <Card title="Incidents" meta="last 90 days" extra={<Link to={paths.incidents(orgSlug)}>All incidents</Link>}>
      {forMonitor.length === 0 ? (
        <p className="flex items-center gap-2 px-4 pb-4 text-muted">
          <LuCircleCheck aria-hidden className="size-4 text-up" />
          All clear · no incidents in the last 90 days
        </p>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {forMonitor.map((incident) => (
            <li key={incident.id} className="border-b border-line last:border-b-0">
              <Link
                to={paths.incident(orgSlug, incident.id)}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)_7.5rem_6rem] items-center gap-4 px-4 py-3 text-ink hover:bg-hover hover:text-ink sm:grid-cols-[4.5rem_minmax(0,1fr)_7.5rem_6rem_7rem]"
              >
                <span>
                  <SeverityTag severity={incident.severity} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    <span className="mr-2 font-mono text-xs text-subtle">{incident.id}</span>
                    {incident.title}
                  </span>
                  <span className="truncate text-muted">{latestUpdateText(incident)}</span>
                </span>
                <span>
                  <IncidentStatusPill status={incident.status} />
                </span>
                <span
                  className={`text-right font-mono text-xs ${isIncidentOpen(incident) ? "text-down" : "text-muted"}`}
                >
                  <IncidentDuration incident={incident} />
                </span>
                <span className="hidden text-right font-mono text-xs text-subtle sm:block">
                  {formatDateTime(incident.startedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
