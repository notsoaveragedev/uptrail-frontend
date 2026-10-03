import { Link, useParams } from "react-router";
import { SeverityTag } from "@/components/alerts/SeverityTag";
import { formatElapsed } from "@/lib/format";
import { shortName } from "@/lib/people";
import { paths } from "@/lib/paths";
import type { Incident } from "@/types/incident";
import { AssigneeMenu } from "./AssigneeMenu";
import { IncidentActions } from "./IncidentActions";
import { IncidentStatusPill } from "./IncidentStatusPill";
import { IncidentTimer } from "./IncidentTimer";

type IncidentHeaderProps = {
  incident: Incident;
  onWritePostmortem: () => void;
};

export function IncidentHeader({ incident, onWritePostmortem }: IncidentHeaderProps) {
  const { orgSlug = "" } = useParams();

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link to={paths.incidents(orgSlug)}>Incidents</Link>
        <span aria-hidden className="text-faint">
          /
        </span>
        <span aria-current="page" className="font-mono text-xs text-ink">
          {incident.id}
        </span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1
            tabIndex={-1}
            className="flex flex-wrap items-baseline gap-3 text-lg font-semibold tracking-tight outline-none"
          >
            <span className="font-mono text-md font-medium text-subtle">{incident.id}</span>
            {incident.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <SeverityTag severity={incident.severity} />
            <IncidentStatusPill status={incident.status} />
            <IncidentTimer incident={incident} />
            <span aria-hidden className="h-4 w-px bg-line" />
            <span className="flex items-center gap-1 text-muted">
              Assignee
              <AssigneeMenu incident={incident} />
            </span>
          </div>
          {incident.acknowledgedAt && incident.acknowledgedBy && (
            <p className="text-xs text-subtle">
              Acknowledged by {shortName(incident.acknowledgedBy)} ·{" "}
              {formatElapsed(incident.acknowledgedAt - incident.startedAt)} after start
            </p>
          )}
        </div>
        <IncidentActions incident={incident} onWritePostmortem={onWritePostmortem} />
      </div>
    </div>
  );
}
