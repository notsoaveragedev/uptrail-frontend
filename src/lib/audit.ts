import type { AuditEvent, AuditValue } from "@/types/audit";
import { csvRow } from "./csv";
import { DAY_MS } from "./dates";
import { readEnum, readList } from "./searchParams";
import type { Tone } from "./status";
import { matchesAny, matchesText } from "./list";

export const AUDIT_RANGES = ["24h", "7d", "30d", "90d"] as const;

export type AuditRange = (typeof AUDIT_RANGES)[number];

export const DEFAULT_AUDIT_RANGE: AuditRange = "30d";

const RANGE_MS: Record<AuditRange, number> = {
  "24h": DAY_MS,
  "7d": 7 * DAY_MS,
  "30d": 30 * DAY_MS,
  "90d": 90 * DAY_MS,
};

export const AUDIT_FILTER_KEYS = ["q", "actor", "action", "resource", "range"];

export const RESOURCE_LABELS: Record<string, string> = {
  monitor: "Monitor",
  role: "Role",
  member: "Member",
  api_key: "API key",
  status_page: "Status page",
  alert_rule: "Alert rule",
  incident: "Incident",
  organization: "Organization",
};

const VERBS: Record<string, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
  pause: "paused",
  invite: "invited",
  role_change: "changed the role of",
  remove: "removed",
  revoke: "revoked",
  publish: "published",
  resolve: "resolved",
};

const DESTRUCTIVE = ["delete", "remove", "revoke"];
const ADDITIVE = ["create", "invite", "publish"];

export function readAuditFilters(params: URLSearchParams) {
  return {
    query: params.get("q") ?? "",
    actors: readList(params, "actor"),
    actions: readList(params, "action"),
    resources: readList(params, "resource"),
    range: readEnum(params, "range", AUDIT_RANGES, DEFAULT_AUDIT_RANGE),
  };
}

export type AuditFilters = ReturnType<typeof readAuditFilters>;

export function filterAuditEvents(events: AuditEvent[], filters: AuditFilters, now: number) {
  const since = now - RANGE_MS[filters.range];
  return events.filter(
    (event) =>
      event.at >= since &&
      matchesAny(filters.actors, event.actor.name) &&
      matchesAny(filters.actions, event.action) &&
      matchesAny(filters.resources, event.resource.type) &&
      matchesText(filters.query, event.resource.name, event.requestId, event.ip),
  );
}

function verbOf(action: string) {
  return action.split(".")[1] ?? action;
}

export function actionTone(action: string): Tone | null {
  const verb = verbOf(action);
  if (DESTRUCTIVE.includes(verb)) return "down";
  return ADDITIVE.includes(verb) ? "up" : null;
}

export function describeAuditEvent(event: AuditEvent) {
  const verb = VERBS[verbOf(event.action)] ?? verbOf(event.action);
  const resource = (RESOURCE_LABELS[event.resource.type] ?? event.resource.type).toLowerCase();
  return `${event.actor.name} ${verb} ${resource} ${event.resource.name}`;
}

export type DiffRow = { field: string; before: AuditValue | undefined; after: AuditValue | undefined };

export function auditDiff(event: AuditEvent): DiffRow[] {
  const fields = [...new Set([...Object.keys(event.before ?? {}), ...Object.keys(event.after ?? {})])];
  return fields.map((field) => ({ field, before: event.before?.[field], after: event.after?.[field] }));
}

export function isSameValue(a: AuditValue | undefined, b: AuditValue | undefined) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function formatAuditValue(value: AuditValue | undefined) {
  if (value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function auditCsv(events: AuditEvent[]) {
  const header = csvRow([
    "time",
    "actor",
    "actor_type",
    "action",
    "resource_type",
    "resource",
    "project",
    "ip",
    "request_id",
  ]);
  const rows = events.map((event) =>
    csvRow([
      new Date(event.at).toISOString(),
      event.actor.name,
      event.actor.type,
      event.action,
      event.resource.type,
      event.resource.name,
      event.project,
      event.ip,
      event.requestId,
    ]),
  );
  return [header, ...rows].join("\n");
}
