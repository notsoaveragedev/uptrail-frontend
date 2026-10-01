import type { Incident } from "@/types/incident";
import type { Monitor } from "@/types/monitor";
import type {
  ComponentStatus,
  OverallStatus,
  PublicIncident,
  ScheduledMaintenance,
  SnapshotComponent,
  StatusPage,
  StatusSnapshot,
} from "@/types/statusPage";
import { buildMonitorDetail } from "./monitorDetail";

const HOUR = 3_600_000;

function overallStatus(statuses: ComponentStatus[]): OverallStatus {
  if (statuses.length > 0 && statuses.every((status) => status === "maintenance")) return "maintenance";
  const down = statuses.filter((status) => status === "down").length;
  if (down > 0) return down >= Math.ceil(statuses.length / 2) ? "major_outage" : "partial_outage";
  if (statuses.includes("degraded")) return "degraded";
  return "operational";
}

function toPublicIncident(incident: Incident, names: Map<string, string>): PublicIncident {
  return {
    id: incident.id,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    components: incident.monitorIds.flatMap((id) => names.get(id) ?? []),
    startedAt: incident.startedAt,
    resolvedAt: incident.resolvedAt,
    updates: incident.timeline
      .filter((entry) => entry.isPublic && entry.kind === "update" && entry.status && entry.message)
      .map((entry) => ({ id: entry.id, status: entry.status!, message: entry.message!, at: entry.at })),
  };
}

function component(monitor: Monitor, name: string, showChart: boolean, showResponseTimes: boolean): SnapshotComponent {
  const detail = buildMonitorDetail(monitor);
  return {
    id: monitor.id,
    name,
    status: monitor.status === "paused" ? "maintenance" : monitor.status,
    uptime90d: detail.uptime.quarter,
    days: detail.days,
    latency: showChart && showResponseTimes ? monitor.latencyHistory : null,
  };
}

export function buildStatusSnapshot(page: StatusPage, monitors: Monitor[], incidents: Incident[]): StatusSnapshot {
  const byId = new Map(monitors.map((monitor) => [monitor.id, monitor]));
  const names = new Map(
    page.groups.flatMap((group) => group.components.map((item) => [item.monitorId, item.displayName])),
  );
  const groups = page.groups
    .map((group) => ({
      id: group.id,
      name: group.name,
      components: group.components.flatMap((item) => {
        const monitor = byId.get(item.monitorId);
        return monitor ? [component(monitor, item.displayName, item.showChart, page.options.showResponseTimes)] : [];
      }),
    }))
    .filter((group) => group.components.length > 0);
  const related = incidents.filter((incident) => incident.monitorIds.some((id) => names.has(id)));
  const historyStart = Date.now() - page.options.historyDays * 24 * HOUR;
  const maintenance: ScheduledMaintenance[] =
    page.project === "bluepeak" || page.project === "shopnest"
      ? [
          {
            id: `mnt_${page.slug}`,
            title: "Database migration",
            components: [...names.values()].slice(0, 2),
            startsAt: Date.now() + 26 * HOUR,
            endsAt: Date.now() + 27 * HOUR,
          },
        ]
      : [];

  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    logoUrl: page.logoUrl,
    theme: page.theme,
    overall: overallStatus(groups.flatMap((group) => group.components.map((item) => item.status))),
    groups,
    activeIncidents: related
      .filter((incident) => incident.status !== "resolved")
      .map((incident) => toPublicIncident(incident, names)),
    maintenance,
    history: related
      .filter((incident) => incident.status === "resolved" && incident.startedAt >= historyStart)
      .map((incident) => toPublicIncident(incident, names)),
    options: page.options,
    generatedAt: Date.now(),
  };
}
