import { useQuery } from "@tanstack/react-query";
import { LuCircleAlert } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { SeverityTag } from "@/components/alerts/SeverityTag";
import { IncidentDuration } from "@/components/incidents/IncidentDuration";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { MetaSeparator } from "@/components/ui/MetaList";
import { openIncidentsFor, shortName } from "@/lib/incidents";
import { paths } from "@/lib/paths";

export function IncidentBanner({ monitorId }: { monitorId: string }) {
  const { orgSlug = "" } = useParams();
  const { data: incidents = [] } = useQuery(incidentsQuery(orgSlug));
  const [incident] = openIncidentsFor(incidents, monitorId);

  if (!incident) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-down/40 bg-down-soft px-4 py-2.5"
    >
      <LuCircleAlert aria-hidden className="size-4 shrink-0 text-down" />
      <span className="font-semibold text-ink">
        Incident {incident.id} · {incident.title}
      </span>
      <SeverityTag severity={incident.severity} />
      <IncidentStatusPill status={incident.status} />
      <MetaSeparator />
      <span className="text-muted">
        {incident.assignee ? `Assigned to ${shortName(incident.assignee)}` : "Unassigned"}
      </span>
      <span className="ml-auto flex items-center gap-4">
        <span className="font-mono text-xs text-down">
          <IncidentDuration incident={incident} />
        </span>
        <Link to={paths.incident(orgSlug, incident.id)} className="font-medium">
          View incident →
        </Link>
      </span>
    </div>
  );
}
