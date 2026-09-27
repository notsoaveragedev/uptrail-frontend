import { LuWrench } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { formatDuration } from "@/lib/format";
import type { Incident, Maintenance } from "@/types/overview";

type ActiveIncidentsCardProps = {
  incidents: Incident[];
  maintenance: Maintenance;
};

export function ActiveIncidentsCard({ incidents, maintenance }: ActiveIncidentsCardProps) {
  const { orgSlug } = useParams();
  const now = useNow();

  return (
    <Card
      title={
        <>
          Active incidents <span className="font-mono text-xs font-normal text-subtle">{incidents.length}</span>
        </>
      }
      extra={<Link to={`/o/${orgSlug}/incidents`}>View all</Link>}
    >
      <ul className="flex flex-col gap-3 px-4">
        {incidents.map((incident) => (
          <li key={incident.id} className="rounded-md border border-l-2 border-line border-l-down bg-panel p-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="rounded-sm bg-down-soft px-1.5 py-0.5 text-down">{incident.severity}</span>
              <span className="text-subtle">{incident.id}</span>
              <span className="ml-auto text-ink">{formatDuration(now - incident.startedAt)}</span>
            </div>
            <p className="mt-2 font-semibold">{incident.title}</p>
            <p className="mt-0.5 text-muted">{incident.cause}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-down">
                <span className="size-1.5 animate-pulse rounded-full bg-down" />
                {incident.state}
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="flex size-5 items-center justify-center rounded-full bg-hover text-caps font-semibold">
                  {incident.assignee.initials}
                </span>
                {incident.assignee.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2 border-t border-line px-4 py-3 text-muted">
        <LuWrench aria-hidden className="size-4 text-maintenance" />
        <span className="text-ink">{maintenance.title}</span>· {maintenance.project}
        <span className="ml-auto font-mono text-xs text-maintenance">{maintenance.startsAt}</span>
      </div>
    </Card>
  );
}
