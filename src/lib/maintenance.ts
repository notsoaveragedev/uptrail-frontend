import type { MaintenancePhase, MaintenanceWindow, Recurrence } from "@/types/maintenance";
import type { MaintenanceValues } from "./schemas";
import { addDays, DAY_MS } from "./dates";
import { formatElapsed } from "./format";
import { readEnum, readList } from "./searchParams";
import { newId } from "./ids";
import { matchesAny, matchesText } from "./list";

export const MAINTENANCE_TABS: MaintenancePhase[] = ["upcoming", "active", "past"];

const MAINTENANCE_VIEWS = ["list", "calendar"] as const;

export const MAINTENANCE_FILTER_KEYS = ["q", "project"];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type Occurrence = { entry: MaintenanceWindow; start: number; end: number };

const MAX_OCCURRENCES = 400;

function repeatsOn(recurrence: Recurrence, start: number) {
  return recurrence.freq === "daily" || recurrence.weekdays.includes(new Date(start).getDay());
}

export function occurrences(entry: MaintenanceWindow, from: number, to: number, limit = MAX_OCCURRENCES): Occurrence[] {
  const duration = entry.endsAt - entry.startsAt;
  if (!entry.recurrence) {
    return entry.endsAt > from && entry.startsAt < to ? [{ entry, start: entry.startsAt, end: entry.endsAt }] : [];
  }
  if (entry.recurrence.freq === "weekly" && entry.recurrence.weekdays.length === 0) return [];
  const until = entry.recurrence.until ?? Infinity;
  const skippedDays = Math.floor((from - duration - entry.startsAt) / DAY_MS) - 1;
  let start = skippedDays > 0 ? addDays(entry.startsAt, skippedDays) : entry.startsAt;
  const result: Occurrence[] = [];
  while (result.length < limit && start < to && start <= until) {
    if (start + duration > from && repeatsOn(entry.recurrence, start))
      result.push({ entry, start, end: start + duration });
    start = addDays(start, 1);
  }
  return result;
}

export function nextOccurrences(entry: MaintenanceWindow, now: number, count: number) {
  return occurrences(entry, now, Infinity, count);
}

export function currentOccurrence(entry: MaintenanceWindow, now: number): Occurrence | null {
  return occurrences(entry, now, now + 1).find((item) => item.start <= now && item.end > now) ?? null;
}

export function maintenancePhase(entry: MaintenanceWindow, now: number): MaintenancePhase {
  if (currentOccurrence(entry, now)) return "active";
  return nextOccurrences(entry, now, 1).length > 0 ? "upcoming" : "past";
}

export function nextStart(entry: MaintenanceWindow, now: number) {
  return currentOccurrence(entry, now)?.start ?? nextOccurrences(entry, now, 1)[0]?.start ?? entry.startsAt;
}

export function recurrenceLabel(recurrence: Recurrence | null) {
  if (!recurrence) return null;
  if (recurrence.freq === "daily") return "Daily";
  return `Weekly · ${recurrence.weekdays.map((day) => WEEKDAYS[day]).join(", ")}`;
}

export function durationLabel(entry: MaintenanceWindow) {
  return formatElapsed(entry.endsAt - entry.startsAt);
}

export function readMaintenanceFilters(params: URLSearchParams) {
  return {
    query: params.get("q") ?? "",
    projects: readList(params, "project"),
    tab: readEnum(params, "tab", MAINTENANCE_TABS, "upcoming"),
    view: readEnum(params, "view", MAINTENANCE_VIEWS, "list"),
  };
}

export function filterMaintenance(
  windows: MaintenanceWindow[],
  filters: ReturnType<typeof readMaintenanceFilters>,
  phase: MaintenancePhase | null,
  now: number,
) {
  return windows
    .filter(
      (entry) =>
        (phase === null || maintenancePhase(entry, now) === phase) &&
        matchesAny(filters.projects, entry.project) &&
        matchesText(filters.query, entry.title),
    )
    .sort((a, b) => (phase === "past" ? b.startsAt - a.startsAt : nextStart(a, now) - nextStart(b, now)));
}

export function overlapping(
  entry: Pick<MaintenanceWindow, "id" | "monitorIds" | "startsAt" | "endsAt">,
  windows: MaintenanceWindow[],
) {
  return windows.filter(
    (other) =>
      other.id !== entry.id &&
      other.monitorIds.some((id) => entry.monitorIds.includes(id)) &&
      occurrences(other, entry.startsAt, entry.endsAt).length > 0,
  );
}

export type RepeatFreq = "none" | "daily" | "weekly";

export function recurrenceFrom(freq: RepeatFreq, weekdays: string[], until: number): Recurrence | null {
  return freq === "none" ? null : { freq, weekdays: weekdays.map(Number), until: until || null };
}

export function buildMaintenance(
  values: MaintenanceValues,
  existing: MaintenanceWindow | null,
  createdBy: string,
): MaintenanceWindow {
  const { freq, weekdays, until, ...fields } = values;
  return {
    id: existing?.id ?? newId("mnt"),
    ...fields,
    recurrence: recurrenceFrom(freq, weekdays, until),
    createdBy: existing?.createdBy ?? createdBy,
    createdAt: existing?.createdAt ?? Date.now(),
  };
}

export function defaultStart(day?: number) {
  const date = new Date(day ?? Date.now() + DAY_MS);
  date.setHours(2, 0, 0, 0);
  return date.getTime();
}
