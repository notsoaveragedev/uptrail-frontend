import { LuArrowLeft } from "react-icons/lu";
import { SeverityTag } from "@/components/alerts/SeverityTag";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { MetaList } from "@/components/ui/MetaList";
import { formatDateTime } from "@/lib/format";
import { paths } from "@/lib/paths";
import type { PublicIncident, StatusSnapshot } from "@/types/statusPage";
import { IncidentDurationText } from "./IncidentDurationText";
import { IncidentTimeline } from "./IncidentTimeline";
import { PublicShell } from "./PublicShell";
import { StatusLink } from "./StatusLink";
import { SubscribeCta } from "./SubscribeCta";

type PublicIncidentViewProps = {
  snapshot: StatusSnapshot;
  incident: PublicIncident;
  onSubscribe: (email: string) => Promise<void>;
};

export function PublicIncidentView({ snapshot, incident, onSubscribe }: PublicIncidentViewProps) {
  return (
    <PublicShell theme={snapshot.theme}>
      <StatusLink to={paths.publicStatus(snapshot.slug)} className="flex w-fit items-center gap-1.5 font-medium">
        <LuArrowLeft aria-hidden className="size-3.5" />
        {snapshot.title} status
      </StatusLink>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityTag severity={incident.severity} />
          <IncidentStatusPill status={incident.status} />
        </div>
        <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight outline-none">
          {incident.title}
        </h1>
        <MetaList className="text-muted">
          {incident.components.length > 0 && <span>Affects {incident.components.join(", ")}</span>}
          <span>Started {formatDateTime(incident.startedAt)}</span>
          <IncidentDurationText incident={incident} />
          <span>{incident.resolvedAt ? `Resolved ${formatDateTime(incident.resolvedAt)}` : "Not resolved yet"}</span>
        </MetaList>
      </header>
      <IncidentTimeline incident={incident} />
      <SubscribeCta title={snapshot.title} onSubscribe={onSubscribe} />
    </PublicShell>
  );
}
