import type { Severity } from "./alerts";

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export type TimelineEvent =
  "declared" | "monitor_down" | "alert_sent" | "acknowledged" | "status_changed" | "note" | "recovered";

export type TimelineEntry = {
  id: string;
  kind: "auto" | "update";
  event: TimelineEvent;
  status: IncidentStatus | null;
  message: string | null;
  isPublic: boolean;
  author: string | null;
  at: number;
};

export type Incident = {
  id: string;
  number: number;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  source: "auto" | "manual";
  project: string;
  monitorIds: string[];
  alertEventIds: string[];
  assignee: string | null;
  timeline: TimelineEntry[];
  startedAt: number;
  acknowledgedAt: number | null;
  acknowledgedBy: string | null;
  resolvedAt: number | null;
  updatedAt: number;
};
