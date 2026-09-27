import { Link, useParams } from "react-router";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { useNow } from "@/hooks/useNow";
import { formatAgo, formatLatency, formatUptime, uptimeTone } from "@/lib/format";
import { displayUrl, formatInterval } from "@/lib/monitors";
import { projects } from "@/mocks/workspace";
import type { Monitor } from "@/types/monitor";

export function MonitorCardGrid({ monitors }: { monitors: Monitor[] }) {
  const { orgSlug } = useParams();
  const now = useNow();

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {monitors.map((monitor) => {
        const latency = monitor.latencyMs === null ? null : formatLatency(monitor.latencyMs);
        const project = projects.find((item) => item.value === monitor.project)?.label ?? monitor.project;
        return (
          <li key={monitor.id}>
            <Link
              to={`/o/${orgSlug}/monitors/${monitor.id}`}
              className="flex flex-col rounded-lg border border-line bg-card text-ink transition-colors hover:border-line-strong hover:text-ink"
            >
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
              <div className="flex gap-6 px-4 pt-3 pb-4 font-mono">
                <span className="flex flex-col">
                  <span className="text-caps tracking-widest text-subtle uppercase">Response</span>
                  <span className={monitor.status === "down" ? "text-down" : "text-ink"}>
                    {latency ? `${latency.value} ${latency.unit}` : monitor.status === "down" ? "Timeout" : "—"}
                  </span>
                </span>
                <span className="flex flex-col">
                  <span className="text-caps tracking-widest text-subtle uppercase">Uptime 30d</span>
                  <span className={uptimeTone(monitor.uptime30d)}>
                    {monitor.uptime30d === null ? "—" : formatUptime(monitor.uptime30d)}
                  </span>
                </span>
              </div>
              <div className="flex justify-between border-t border-line px-4 py-2.5 font-mono text-xs text-subtle">
                <span>
                  {project} · every {formatInterval(monitor.intervalSec)}
                </span>
                <span>{monitor.lastCheckedAt ? formatAgo(monitor.lastCheckedAt, now) : "—"}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
