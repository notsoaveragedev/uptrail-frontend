import { useQuery } from "@tanstack/react-query";
import { LuCircleCheck, LuWrench } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { SeverityTag } from "@/components/alerts/SeverityTag";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { IncidentDuration } from "@/components/incidents/IncidentDuration";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { Card } from "@/components/ui/Card";
import { latestUpdateText, openIncidentsFor } from "@/lib/incidents";
import { shortName } from "@/lib/people";
import { paths } from "@/lib/paths";
import type { IncidentStatus } from "@/types/incident";
import type { Maintenance } from "@/types/overview";

const STATUS_BORDER: Record<IncidentStatus, string> = {
  investigating: "border-l-down",
  identified: "border-l-degraded",
  monitoring: "border-l-maintenance",
  resolved: "border-l-up",
};

export function ActiveIncidentsCard({ maintenance }: { maintenance: Maintenance }) {
  const { orgSlug = "" } = useParams();
  const { data: incidents = [] } = useQuery(incidentsQuery(orgSlug));
  const open = openIncidentsFor(incidents);

  return (
    <Card title="Active incidents" meta={open.length} extra={<Link to={paths.incidents(orgSlug)}>View all</Link>}>
      {open.length === 0 ? (
        <p className="flex items-center gap-2 px-4 text-muted">
          <LuCircleCheck aria-hidden className="size-4 text-up" />
          All clear · no open incidents
        </p>
      ) : (
        <ul className="flex flex-col gap-3 px-4">
          {open.map((incident) => {
            const update = latestUpdateText(incident);
            return (
              <li key={incident.id}>
                <Link
                  to={paths.incident(orgSlug, incident.id)}
                  className={`block rounded-md border border-l-2 border-line bg-panel p-3 text-ink transition-colors hover:border-line-strong hover:text-ink ${STATUS_BORDER[incident.status]}`}
                >
                  <span className="flex items-center gap-2">
                    <SeverityTag severity={incident.severity} />
                    <span className="font-mono text-xs text-subtle">{incident.id}</span>
                    <span className="ml-auto font-mono text-xs text-ink">
                      <IncidentDuration incident={incident} />
                    </span>
                  </span>
                  <span className="mt-2 block font-semibold">{incident.title}</span>
                  {update && <span className="mt-0.5 line-clamp-2 text-muted">{update}</span>}
                  <span className="mt-3 flex items-center justify-between text-xs">
                    <IncidentStatusPill status={incident.status} />
                    <span className="flex items-center gap-1.5 text-muted">
                      <PersonAvatar name={incident.assignee} hasTooltip={false} />
                      {incident.assignee ? shortName(incident.assignee) : "Unassigned"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3 flex items-center gap-2 border-t border-line px-4 py-3 text-muted">
        <LuWrench aria-hidden className="size-4 text-maintenance" />
        <span className="text-ink">{maintenance.title}</span>· {maintenance.project}
        <span className="ml-auto font-mono text-xs text-maintenance">{maintenance.startsAt}</span>
      </div>
    </Card>
  );
}
