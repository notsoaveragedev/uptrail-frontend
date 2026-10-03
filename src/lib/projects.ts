import type { Incident } from "@/types/incident";
import type { Monitor, MonitorStatus } from "@/types/monitor";
import type { UptimeDay } from "@/types/monitorDetail";
import type { Project } from "@/types/project";
import { DAY_MS, startOfDay } from "./dates";
import { isIncidentOpen } from "./incidents";
import { readEnum, readList } from "./searchParams";
import { STATUS_RANK, STATUSES } from "./status";
import { newId } from "./ids";
import { matchesText } from "./list";

export const PROJECT_SORTS = ["health", "name", "uptime", "monitors"] as const;

export type ProjectSort = (typeof PROJECT_SORTS)[number];

export const PROJECT_SORT_LABELS: Record<ProjectSort, string> = {
  health: "Health",
  name: "Name",
  uptime: "Uptime",
  monitors: "Monitors",
};

export const PROJECT_FILTER_KEYS = ["q", "tag", "sort"];

export const PROJECT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "monitors", label: "Monitors" },
  { key: "incidents", label: "Incidents" },
  { key: "access", label: "Access" },
];

export type ProjectHealth = {
  counts: Record<MonitorStatus, number>;
  total: number;
  worst: MonitorStatus | null;
  uptime30d: number | null;
  openIncidents: number;
};

export function projectHealth(slug: string, monitors: Monitor[], incidents: Incident[]): ProjectHealth {
  const scoped = monitors.filter((monitor) => monitor.project === slug);
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<MonitorStatus, number>;
  scoped.forEach((monitor) => counts[monitor.status]++);
  const uptimes = scoped.flatMap((monitor) => (monitor.uptime30d === null ? [] : [monitor.uptime30d]));
  const active = scoped.filter((monitor) => monitor.status !== "paused");
  return {
    counts,
    total: scoped.length,
    worst: active.length
      ? active.reduce(
          (worst, monitor) => (STATUS_RANK[monitor.status] < STATUS_RANK[worst] ? monitor.status : worst),
          "up" as MonitorStatus,
        )
      : null,
    uptime30d: uptimes.length ? uptimes.reduce((sum, value) => sum + value, 0) / uptimes.length : null,
    openIncidents: incidents.filter((incident) => incident.project === slug && isIncidentOpen(incident)).length,
  };
}

export function readProjectFilters(params: URLSearchParams) {
  return {
    query: params.get("q") ?? "",
    tags: readList(params, "tag"),
    sort: readEnum(params, "sort", PROJECT_SORTS, "health"),
  };
}

const SORTERS: Record<ProjectSort, (a: Project, b: Project, health: Map<string, ProjectHealth>) => number> = {
  health: (a, b, health) =>
    STATUS_RANK[health.get(a.slug)?.worst ?? "up"] - STATUS_RANK[health.get(b.slug)?.worst ?? "up"] ||
    (health.get(b.slug)?.openIncidents ?? 0) - (health.get(a.slug)?.openIncidents ?? 0),
  name: (a, b) => a.name.localeCompare(b.name),
  uptime: (a, b, health) => (health.get(a.slug)?.uptime30d ?? 101) - (health.get(b.slug)?.uptime30d ?? 101),
  monitors: (a, b, health) => (health.get(b.slug)?.total ?? 0) - (health.get(a.slug)?.total ?? 0),
};

export function filterProjects(
  projects: Project[],
  filters: ReturnType<typeof readProjectFilters>,
  health: Map<string, ProjectHealth>,
) {
  return projects
    .filter(
      (project) =>
        filters.tags.every((tag) => project.tags.includes(tag)) &&
        matchesText(filters.query, project.name, project.slug),
    )
    .sort((a, b) => SORTERS[filters.sort](a, b, health) || a.name.localeCompare(b.name));
}

export function projectUptimeDays(slug: string, incidents: Incident[], dayCount: number, now: number): UptimeDay[] {
  const today = startOfDay(now);
  const scoped = incidents.filter((incident) => incident.project === slug);
  return Array.from({ length: dayCount }, (_, index) => {
    const date = today - (dayCount - 1 - index) * DAY_MS;
    const end = date + DAY_MS;
    const touching = scoped.filter((incident) => incident.startedAt < end && (incident.resolvedAt ?? now) > date);
    const downMs = touching.reduce(
      (sum, incident) => sum + Math.min(end, incident.resolvedAt ?? now) - Math.max(date, incident.startedAt),
      0,
    );
    return { date, uptime: 100 - (downMs / DAY_MS) * 100, incidents: touching.length };
  });
}

export function projectTags(projects: Project[]) {
  return [...new Set(projects.flatMap((project) => project.tags))].sort();
}

export function newProject(values: { name: string; slug: string; description: string; tags: string[] }): Project {
  return { id: newId("prj"), ...values, createdAt: Date.now() };
}
