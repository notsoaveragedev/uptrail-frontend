import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { MonitorLatency } from "@/components/monitors/MonitorLatency";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { Card } from "@/components/ui/Card";
import { displayUrl, formatInterval, projectLabel } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { Monitor } from "@/types/monitor";

export function MonitorCardGrid({ monitors }: { monitors: Monitor[] }) {
  const { orgSlug = "" } = useParams();

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {monitors.map((monitor) => (
        <li key={monitor.id}>
          <Link to={paths.monitor(orgSlug, monitor.id)} className="block text-ink hover:text-ink">
            <Card isInteractive>
              <div className="flex items-start justify-between gap-3 px-4 pt-4">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{monitor.name}</span>
                  <span className="truncate font-mono text-xs text-subtle">{displayUrl(monitor.url)}</span>
                </span>
                <StatusBadge status={monitor.status} />
              </div>
              <div className="px-4 pt-4">
                <CheckTrail checks={monitor.checks} />
              </div>
              <div className="flex gap-6 px-4 pt-3 pb-4">
                <Stat label="Response">
                  <MonitorLatency ms={monitor.latencyMs} status={monitor.status} />
                </Stat>
                <Stat label="Uptime 30d">
                  <UptimeValue value={monitor.uptime30d} />
                </Stat>
              </div>
              <div className="flex justify-between border-t border-line px-4 py-2.5 font-mono text-xs text-subtle">
                <span>
                  {projectLabel(monitor.project)} · every {formatInterval(monitor.intervalSec)}
                </span>
                <TimeAgo timestamp={monitor.lastCheckedAt} />
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex flex-col">
      <span className="font-mono text-caps tracking-widest text-subtle uppercase">{label}</span>
      {children}
    </span>
  );
}
