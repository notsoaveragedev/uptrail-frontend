import { StatusDot } from "@/components/ui/StatusDot";
import { useNow } from "@/hooks/useNow";
import { formatElapsed } from "@/lib/format";
import { formatSpan, incidentDurationMs, isIncidentOpen } from "@/lib/incidents";
import type { Incident } from "@/types/incident";

export function IncidentTimer({ incident }: { incident: Incident }) {
  if (!isIncidentOpen(incident)) {
    return (
      <span className="text-muted">
        Lasted{" "}
        <span className="font-mono text-md text-ink">
          {formatSpan(incidentDurationMs(incident, incident.startedAt))}
        </span>
      </span>
    );
  }
  return <LiveTimer startedAt={incident.startedAt} />;
}

function LiveTimer({ startedAt }: { startedAt: number }) {
  const now = useNow();

  return (
    <span role="timer" aria-label={`Open for ${formatElapsed(now - startedAt)}`} className="flex items-center gap-2">
      <StatusDot className="size-2 animate-pulse text-down" />
      <span aria-hidden className="font-mono text-md text-ink">
        {formatSpan(now - startedAt)}
      </span>
    </span>
  );
}
