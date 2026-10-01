import { LuArrowRight } from "react-icons/lu";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { MarkdownText } from "@/components/ui/MarkdownText";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { INCIDENT_STATUS_TONE } from "@/lib/incidents";
import { paths } from "@/lib/paths";
import { latestUpdate, TONE_BORDER } from "@/lib/publicStatus";
import type { PublicIncident } from "@/types/statusPage";
import { StatusLink } from "./StatusLink";

type ActiveIncidentCardProps = {
  incident: PublicIncident;
  slug: string;
  isPreview: boolean;
};

export function ActiveIncidentCard({ incident, slug, isPreview }: ActiveIncidentCardProps) {
  const update = latestUpdate(incident);

  return (
    <article
      className={`flex flex-col gap-2 rounded-lg border border-l-2 border-line bg-card px-4 py-3.5 ${TONE_BORDER[INCIDENT_STATUS_TONE[incident.status]]}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-caps font-semibold tracking-widest text-subtle uppercase">Active incident</span>
        <IncidentStatusPill status={incident.status} />
      </div>
      <h3 className="text-md font-semibold">{incident.title}</h3>
      {update && (
        <div className="flex flex-col gap-1 text-muted">
          <MarkdownText source={update.message} />
          <span className="text-xs text-subtle">
            Updated <TimeAgo timestamp={update.at} intervalMs={30_000} />
            {incident.components.length > 0 && ` · Affects ${incident.components.join(", ")}`}
          </span>
        </div>
      )}
      <StatusLink
        to={paths.publicIncident(slug, incident.id)}
        isPreview={isPreview}
        className="flex w-fit items-center gap-1 text-xs font-medium"
      >
        View incident
        <LuArrowRight aria-hidden className="size-3" />
      </StatusLink>
    </article>
  );
}
