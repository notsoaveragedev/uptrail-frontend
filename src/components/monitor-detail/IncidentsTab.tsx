import { LuCircleCheck } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { formatDateTime, formatSpan, INCIDENT_STATE_TONE } from "@/lib/monitorDetail";
import type { MonitorIncident } from "@/types/monitorDetail";

export function IncidentsTab({ incidents }: { incidents: MonitorIncident[] }) {
  const { orgSlug } = useParams();
  const now = useNow(30_000);

  return (
    <Card
      title={
        <>
          Incidents <span className="font-mono text-xs font-normal text-subtle">last 90 days</span>
        </>
      }
      extra={<Link to={`/o/${orgSlug}/incidents`}>All incidents</Link>}
    >
      {incidents.length === 0 ? (
        <p className="flex items-center gap-2 px-4 pb-4 text-muted">
          <LuCircleCheck aria-hidden className="size-4 text-up" />
          All clear · no incidents in the last 90 days
        </p>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {incidents.map((incident) => (
            <li key={incident.id} className="border-b border-line last:border-b-0">
              <Link
                to={`/o/${orgSlug}/incidents/${incident.id}`}
                className="grid grid-cols-[4rem_minmax(0,1fr)_7rem_6rem] items-center gap-4 px-4 py-3 text-ink hover:bg-hover hover:text-ink sm:grid-cols-[4rem_minmax(0,1fr)_7rem_6rem_7rem]"
              >
                <span
                  className={`w-fit rounded-sm px-1.5 py-0.5 font-mono text-xs ${incident.severity === "SEV 1" ? "bg-down-soft text-down" : "bg-degraded-soft text-degraded"}`}
                >
                  {incident.severity}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    <span className="mr-2 font-mono text-xs text-subtle">{incident.id}</span>
                    {incident.title}
                  </span>
                  <span className="truncate text-muted">{incident.cause}</span>
                </span>
                <span className={`flex items-center gap-1.5 ${INCIDENT_STATE_TONE[incident.state]}`}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {incident.state}
                </span>
                <span className="text-right font-mono text-xs text-muted">
                  {formatSpan((incident.resolvedAt ?? now) - incident.startedAt)}
                  {incident.resolvedAt === null && <span className="block text-down">ongoing</span>}
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
