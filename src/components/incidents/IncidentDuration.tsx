import { useNow } from "@/hooks/useNow";
import { formatSpan, incidentDurationMs, isIncidentOpen } from "@/lib/incidents";
import type { Incident } from "@/types/incident";

export function IncidentDuration({ incident }: { incident: Incident }) {
  return isIncidentOpen(incident) ? (
    <LiveDuration since={incident.startedAt} />
  ) : (
    formatSpan(incidentDurationMs(incident, incident.startedAt))
  );
}

function LiveDuration({ since }: { since: number }) {
  const now = useNow();
  return formatSpan(now - since);
}
