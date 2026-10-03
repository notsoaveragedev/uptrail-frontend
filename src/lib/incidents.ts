import type { Severity } from "@/types/alerts";
import type { Incident, IncidentStatus, TimelineEntry } from "@/types/incident";
import type { Monitor } from "@/types/monitor";
import type { DownBand } from "@/types/monitorDetail";
import { DAY_MS } from "./dates";
import { matchesAny } from "./list";
import { parseMarkdown } from "./markdown";
import { readList } from "./searchParams";
import type { Tone } from "./status";

export const INCIDENT_STATUSES: IncidentStatus[] = ["investigating", "identified", "monitoring", "resolved"];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export const INCIDENT_STATUS_TONE: Record<IncidentStatus, Tone> = {
  investigating: "down",
  identified: "degraded",
  monitoring: "info",
  resolved: "up",
};

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function incidentMetrics(incidents: Incident[], windowDays: number, now = Date.now()) {
  const inWindow = (start: number, end: number) =>
    incidents.filter((incident) => incident.startedAt >= start && incident.startedAt < end);
  const summarize = (list: Incident[]) => ({
    count: list.length,
    mttaMs: average(list.flatMap((item) => (item.acknowledgedAt ? [item.acknowledgedAt - item.startedAt] : []))),
    mttrMs: average(list.flatMap((item) => (item.resolvedAt ? [item.resolvedAt - item.startedAt] : []))),
  });
  const windowMs = windowDays * DAY_MS;
  const current = inWindow(now - windowMs, now);

  return {
    current: summarize(current),
    previous: summarize(inWindow(now - 2 * windowMs, now - windowMs)),
    daily: Array.from({ length: windowDays }, (_, index) => {
      const start = now - (windowDays - index) * DAY_MS;
      return { date: start, ...summarize(inWindow(start, start + DAY_MS)) };
    }),
  };
}

export type IncidentTab = "open" | "resolved";

export const INCIDENT_TABS: IncidentTab[] = ["open", "resolved"];

export const INCIDENT_FILTER_KEYS = ["q", "severity", "project", "assignee"];

export const ASSIGNEE_ME = "me";

export const UNASSIGNED = "unassigned";

export const OPEN_STATUSES: IncidentStatus[] = ["investigating", "identified", "monitoring"];

export type IncidentFilters = {
  query: string;
  severities: Severity[];
  projects: string[];
  assignees: string[];
};

export function isIncidentOpen(incident: Incident) {
  return incident.status !== "resolved";
}

export function incidentDurationMs(incident: Incident, now: number) {
  return (incident.resolvedAt ?? now) - incident.startedAt;
}

export function readIncidentFilters(params: URLSearchParams): IncidentFilters {
  return {
    query: params.get("q") ?? "",
    severities: readList(params, "severity") as Severity[],
    projects: readList(params, "project"),
    assignees: readList(params, "assignee"),
  };
}

export function filterIncidents(incidents: Incident[], tab: IncidentTab, filters: IncidentFilters, me: string) {
  const query = filters.query.trim().toLowerCase();
  const assignees = filters.assignees.map((value) => (value === ASSIGNEE_ME ? me : value));

  return incidents
    .filter(
      (incident) =>
        isIncidentOpen(incident) === (tab === "open") &&
        `${incident.id} ${incident.title}`.toLowerCase().includes(query) &&
        matchesAny(filters.severities, incident.severity) &&
        matchesAny(filters.projects, incident.project) &&
        matchesAny(assignees, incident.assignee ?? UNASSIGNED),
    )
    .sort((a, b) => b.startedAt - a.startedAt);
}

export function incidentTabCounts(incidents: Incident[], filters: IncidentFilters, me: string) {
  return {
    open: filterIncidents(incidents, "open", filters, me).length,
    resolved: filterIncidents(incidents, "resolved", filters, me).length,
  };
}

export function formatSpan(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

export function formatSpanShort(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes}m`;
  return minutes % 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes / 60}h`;
}

export function daysSinceLastIncident(incidents: Incident[], now: number) {
  const lastEnd = Math.max(0, ...incidents.map((incident) => incident.resolvedAt ?? now));
  return lastEnd === 0 ? null : Math.floor((now - lastEnd) / DAY_MS);
}

export type IncidentStage = { status: IncidentStatus; at: number | null; isReached: boolean; isCurrent: boolean };

export function incidentStages(incident: Incident): IncidentStage[] {
  const currentIndex = INCIDENT_STATUSES.indexOf(incident.status);
  const firstAt = (status: IncidentStatus) => {
    if (status === "investigating") return incident.startedAt;
    if (status === "resolved") return incident.resolvedAt;
    const times = incident.timeline.filter((entry) => entry.status === status).map((entry) => entry.at);
    return times.length ? Math.min(...times) : null;
  };

  return INCIDENT_STATUSES.map((status, index) => ({
    status,
    at: index <= currentIndex ? firstAt(status) : null,
    isReached: index <= currentIndex,
    isCurrent: index === currentIndex,
  }));
}

export function incidentWindow(incident: Incident, now: number) {
  return { start: incident.startedAt - 30 * 60_000, end: incident.resolvedAt ?? now };
}

const WINDOW_POINTS = 48;

export function incidentLatency(monitor: Monitor, incident: Incident, now: number) {
  const { start, end } = incidentWindow(incident, now);
  const step = (end - start) / (WINDOW_POINTS - 1);
  const isDown = isIncidentOpen(incident) && monitor.status === "down";
  const history = monitor.latencyHistory.length ? monitor.latencyHistory : [monitor.latencyMs ?? 300];
  const timestamps: number[] = [];
  const p50: (number | null)[] = [];
  const p95: (number | null)[] = [];

  for (let index = 0; index < WINDOW_POINTS; index++) {
    const at = start + index * step;
    const base = history[index % history.length];
    const isDuring = at >= incident.startedAt;
    const gap = isDuring && isDown;
    timestamps.push(Math.floor(at / 1000));
    p50.push(gap ? null : Math.round(base * (isDuring ? 1.6 : 0.8)));
    p95.push(gap ? null : Math.round(base * (isDuring ? 3.2 : 1.7)));
  }

  const bands: DownBand[] = [
    { start: Math.floor(incident.startedAt / 1000), end: Math.floor(end / 1000), label: incident.id },
  ];
  return { timestamps, p50, p95, bands };
}

export const POSTMORTEM_TEMPLATE = `## Summary
- What happened and who was affected

## Timeline
- Detection, response and recovery times

## Root cause
- The underlying reason

## Action items
- Follow-ups with owners`;

export type IncidentDraftValues = {
  title: string;
  severity: Severity;
  status: IncidentStatus;
  monitorIds: string[];
  assignee: string | null;
  message: string;
  publish: boolean;
};

export function buildIncidentDraft(
  values: IncidentDraftValues,
  { project, author, channelNames, now }: { project: string; author: string; channelNames: string[]; now: number },
): Omit<Incident, "id" | "number"> {
  const entry = (fields: Omit<TimelineEntry, "id" | "at">, offset = 0): TimelineEntry => ({
    id: `draft-${fields.event}-${now}`,
    at: now + offset,
    ...fields,
  });
  const declared = entry({
    kind: "update",
    event: "declared",
    status: values.status,
    message: values.message || `We're investigating ${values.title.toLowerCase()}.`,
    isPublic: values.publish,
    author,
  });
  const notified = entry(
    {
      kind: "auto",
      event: "alert_sent",
      status: null,
      message: `Notified ${channelNames.join(", ")}.`,
      isPublic: false,
      author: null,
    },
    1,
  );

  return {
    title: values.title,
    severity: values.severity,
    status: values.status,
    source: "manual",
    project,
    monitorIds: values.monitorIds,
    alertEventIds: [],
    assignee: values.assignee,
    timeline: channelNames.length ? [notified, declared] : [declared],
    startedAt: now,
    acknowledgedAt: null,
    acknowledgedBy: null,
    resolvedAt: null,
    updatedAt: now,
  };
}

export function latestUpdateText(incident: Incident) {
  const updates = incident.timeline.filter((entry) => entry.kind === "update" && entry.message);
  const latest = updates.sort((a, b) => b.at - a.at)[0]?.message;
  if (!latest) return null;
  return parseMarkdown(latest)
    .map((block) => (block.kind === "list" ? block.items.flat() : block.inlines).map((inline) => inline.text).join(""))
    .join(" ");
}

export function openIncidentsFor(incidents: Incident[], monitorId?: string) {
  return incidents.filter(
    (incident) => isIncidentOpen(incident) && (!monitorId || incident.monitorIds.includes(monitorId)),
  );
}
