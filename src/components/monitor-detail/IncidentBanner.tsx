import { LuCircleAlert } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { MetaSeparator } from "@/components/ui/MetaList";
import { useNow } from "@/hooks/useNow";
import { formatDuration } from "@/lib/format";
import { paths } from "@/lib/paths";
import type { MonitorIncident } from "@/types/monitorDetail";

export function IncidentBanner({ incident }: { incident: MonitorIncident }) {
  const { orgSlug = "" } = useParams();
  const now = useNow();

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-down/40 bg-down-soft px-4 py-2.5"
    >
      <LuCircleAlert aria-hidden className="size-4 shrink-0 text-down" />
      <span className="font-semibold text-ink">
        Incident {incident.id} · {incident.title}
      </span>
      <span className="text-down">Critical</span>
      <MetaSeparator />
      <span className="text-down">{incident.state}</span>
      <MetaSeparator />
      <span className="text-muted">{incident.cause}</span>
      <MetaSeparator />
      <span className="text-muted">Assigned to {incident.assignee}</span>
      <span className="ml-auto flex items-center gap-4">
        <span className="font-mono text-xs text-down">{formatDuration(now - incident.startedAt)}</span>
        <Link to={paths.incident(orgSlug, incident.id)} className="font-medium">
          View incident →
        </Link>
      </span>
    </div>
  );
}
