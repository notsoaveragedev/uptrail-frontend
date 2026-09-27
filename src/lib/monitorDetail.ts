import type { DetailTab, IncidentState } from "@/types/monitorDetail";

export const DETAIL_TABS: DetailTab[] = ["overview", "checks", "incidents", "alerts", "settings"];

export const INCIDENT_STATE_TONE: Record<IncidentState, string> = {
  Investigating: "text-down",
  Identified: "text-degraded",
  Monitoring: "text-muted",
  Resolved: "text-up",
};
