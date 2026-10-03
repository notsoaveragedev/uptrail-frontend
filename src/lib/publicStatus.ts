import { palettes } from "@/theme/palette";
import { DAY_MS, startOfDay } from "./dates";
import type { Tone } from "./status";
import type {
  ComponentStatus,
  PublicIncident,
  SnapshotComponent,
  SnapshotDay,
  StatusSnapshot,
  StatusTheme,
} from "@/types/statusPage";

export const HISTORY_PAGE_DAYS = 7;
export const MOBILE_STRIP_DAYS = 30;
export const FLASH_MS = 1200;
export const POLL_MS = 30_000;
export const BACKOFF_MS = 120_000;

export const DEFAULT_STATUS_THEME: StatusTheme = {
  primary: palettes.light.accent,
  background: palettes.light.canvas,
  surface: palettes.light.card,
  text: palettes.light.ink,
  mode: "light",
};

export const COMPONENT_STATUS_LABELS: Record<ComponentStatus, string> = {
  up: "Operational",
  degraded: "Degraded",
  down: "Outage",
  paused: "Paused",
  maintenance: "Maintenance",
};

export const COMPONENT_STATUS_TONE: Record<ComponentStatus, Tone> = {
  up: "up",
  degraded: "degraded",
  down: "down",
  paused: "paused",
  maintenance: "info",
};

export const TONE_BORDER: Record<Tone, string> = {
  up: "border-l-up",
  degraded: "border-l-degraded",
  down: "border-l-down",
  paused: "border-l-paused",
  info: "border-l-maintenance",
};

export const TONE_SURFACE: Record<Tone, string> = {
  up: "border-up/25 bg-up-soft",
  degraded: "border-degraded/25 bg-degraded-soft",
  down: "border-down/25 bg-down-soft",
  paused: "border-paused/25 bg-paused-soft",
  info: "border-maintenance/25 bg-maintenance-soft",
};

const SEVERITY_RANK: Record<ComponentStatus, number> = { down: 0, degraded: 1, maintenance: 2, paused: 3, up: 4 };

export function worstStatus(components: SnapshotComponent[]): ComponentStatus {
  return components.reduce<ComponentStatus>(
    (worst, item) => (SEVERITY_RANK[item.status] < SEVERITY_RANK[worst] ? item.status : worst),
    "up",
  );
}

export function affectedComponents(snapshot: StatusSnapshot) {
  return snapshot.groups.flatMap((group) => group.components.filter((item) => item.status !== "up"));
}

export function averageUptime(days: SnapshotDay[]) {
  const known = days.flatMap((day) => (day.uptime === null ? [] : [day.uptime]));
  return known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : null;
}

export function historyByDay(history: PublicIncident[], dayCount: number, now: number) {
  const today = startOfDay(now);
  return Array.from({ length: dayCount }, (_, index) => {
    const date = today - index * DAY_MS;
    return {
      date,
      incidents: history
        .filter((incident) => startOfDay(incident.startedAt) === date)
        .sort((a, b) => b.startedAt - a.startedAt),
    };
  });
}

export function updatesOldestFirst(incident: PublicIncident) {
  return [...incident.updates].sort((a, b) => a.at - b.at);
}

export function latestUpdate(incident: PublicIncident) {
  return updatesOldestFirst(incident).at(-1) ?? null;
}

export function findIncident(snapshot: StatusSnapshot, incidentId: string) {
  return [...snapshot.activeIncidents, ...snapshot.history].find((incident) => incident.id === incidentId) ?? null;
}

export function isNotFoundError(error: unknown) {
  return error instanceof Response && error.status === 404;
}

function componentSignature(item: SnapshotComponent) {
  return `${item.status}|${item.uptime90d}|${item.days.at(-1)?.uptime}|${item.days.at(-1)?.incidents}`;
}

export function changedComponentIds(previous: StatusSnapshot, next: StatusSnapshot) {
  const before = new Map(
    previous.groups.flatMap((group) => group.components.map((item) => [item.id, componentSignature(item)])),
  );
  return new Set(
    next.groups.flatMap((group) =>
      group.components.filter((item) => before.get(item.id) !== componentSignature(item)).map((item) => item.id),
    ),
  );
}
