import { useQuery } from "@tanstack/react-query";
import { LuCircleCheck, LuWrench } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { maintenanceQuery } from "@/api/maintenance";
import { monitorsQuery } from "@/api/monitors";
import { SeverityTag } from "@/components/alerts/SeverityTag";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { IncidentDuration } from "@/components/incidents/IncidentDuration";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { MonitorLatency } from "@/components/monitors/MonitorLatency";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { UptimeStrip } from "@/components/monitors/UptimeStrip";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { HealthBar } from "@/components/projects/HealthBar";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { formatDateTime } from "@/lib/format";
import { isIncidentOpen } from "@/lib/incidents";
import { maintenancePhase, nextStart } from "@/lib/maintenance";
import { displayUrl } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import { projectHealth, projectUptimeDays } from "@/lib/projects";
import { STATUS_RANK } from "@/lib/status";

const UPTIME_DAYS = 30;

export function ProjectOverviewPage() {
  const { orgSlug = "", projectSlug = "" } = useParams();
  const now = useNow(60_000);
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { data: incidents = [] } = useQuery(incidentsQuery(orgSlug));
  const { data: windows = [] } = useQuery(maintenanceQuery(orgSlug));
  const health = projectHealth(projectSlug, monitors, incidents);
  const days = projectUptimeDays(projectSlug, incidents, UPTIME_DAYS, now);
  const scoped = monitors.filter((monitor) => monitor.project === projectSlug);
  const attention = scoped
    .filter((monitor) => monitor.status !== "up")
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
  const open = incidents.filter((incident) => incident.project === projectSlug && isIncidentOpen(incident));
  const upcoming = windows
    .filter((entry) => entry.project === projectSlug && maintenancePhase(entry, now) !== "past")
    .sort((a, b) => nextStart(a, now) - nextStart(b, now))
    .slice(0, 3);
  const incidentDays = days.filter((day) => day.incidents > 0).length;

  return (
    <SectionErrorBoundary>
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card title="Uptime · 30 days" className="lg:col-span-2">
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
              <span className="flex flex-col">
                <span className="text-xs text-muted">Average across monitors</span>
                <UptimeValue value={health.uptime30d} className="text-lg" />
              </span>
              <span className="flex flex-col">
                <span className="text-xs text-muted">Days with incidents</span>
                <span className="font-mono text-lg">{incidentDays}</span>
              </span>
              <div className="min-w-56 flex-1">
                <HealthBar counts={health.counts} total={health.total} />
              </div>
            </div>
            <UptimeStrip days={days} label="Project uptime, last 30 days" />
          </div>
        </Card>

        <Card title="Open incidents" meta={open.length}>
          {open.length === 0 ? (
            <p className="flex items-center gap-2 px-4 pb-4 text-muted">
              <LuCircleCheck aria-hidden className="size-4 text-up" /> All clear in this project
            </p>
          ) : (
            <ul className="flex flex-col gap-2 px-4 pb-4">
              {open.map((incident) => (
                <li key={incident.id}>
                  <Link
                    to={paths.incident(orgSlug, incident.id)}
                    className="flex flex-col gap-1.5 rounded-md border border-line bg-panel p-3 text-ink hover:border-line-strong hover:text-ink"
                  >
                    <span className="flex items-center gap-2">
                      <SeverityTag severity={incident.severity} />
                      <IncidentStatusPill status={incident.status} />
                      <span className="ml-auto font-mono text-xs">
                        <IncidentDuration incident={incident} />
                      </span>
                    </span>
                    <span className="font-medium">{incident.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Needs attention"
          meta={attention.length}
          extra={<Link to={paths.project(orgSlug, projectSlug, "monitors")}>All monitors</Link>}
          className="lg:col-span-2"
        >
          {attention.length === 0 ? (
            <p className="flex items-center gap-2 px-4 pb-4 text-muted">
              <LuCircleCheck aria-hidden className="size-4 text-up" /> All {scoped.length} monitors are up
            </p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {attention.map((monitor) => (
                <li key={monitor.id}>
                  <Link
                    to={paths.monitor(orgSlug, monitor.id)}
                    className="flex items-center gap-3 px-4 py-2.5 text-ink hover:bg-hover hover:text-ink"
                  >
                    <StatusBadge status={monitor.status} />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{monitor.name}</span>{" "}
                      <span className="font-mono text-xs text-subtle">{displayUrl(monitor.url)}</span>
                    </span>
                    <MonitorLatency ms={monitor.latencyMs} status={monitor.status} className="text-xs" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Upcoming maintenance"
          meta={upcoming.length}
          extra={<Link to={paths.maintenance(orgSlug, { project: projectSlug })}>Schedule</Link>}
        >
          {upcoming.length === 0 ? (
            <p className="px-4 pb-4 text-muted">Nothing scheduled. Alerts fire normally.</p>
          ) : (
            <ul className="flex flex-col gap-2 px-4 pb-4">
              {upcoming.map((entry) => (
                <li key={entry.id} className="flex gap-2.5">
                  <LuWrench aria-hidden className="mt-0.5 size-3.5 shrink-0 text-maintenance" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{entry.title}</span>
                    <span className="font-mono text-xs text-subtle">
                      {maintenancePhase(entry, now) === "active" ? (
                        <span className="text-maintenance">In progress</span>
                      ) : (
                        formatDateTime(nextStart(entry, now))
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </SectionErrorBoundary>
  );
}
