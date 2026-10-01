import { useNow } from "@/hooks/useNow";
import { formatSpan, formatSpanShort } from "@/lib/incidents";
import type { PublicIncident } from "@/types/statusPage";

export function IncidentDurationText({ incident }: { incident: PublicIncident }) {
  if (incident.resolvedAt) return <span>Lasted {formatSpan(incident.resolvedAt - incident.startedAt)}</span>;
  return <LiveDuration since={incident.startedAt} />;
}

function LiveDuration({ since }: { since: number }) {
  const now = useNow();
  return (
    <span>
      Ongoing for{" "}
      <span aria-hidden className="font-mono">
        {formatSpan(now - since)}
      </span>
      <span className="sr-only">{formatSpanShort(now - since)}</span>
    </span>
  );
}
