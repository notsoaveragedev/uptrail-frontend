import type { Severity } from "./alerts";
import type { IncidentStatus } from "./incident";
import type { MonitorStatus } from "./monitor";

export type StatusTheme = {
  primary: string;
  background: string;
  surface: string;
  text: string;
  mode: "light" | "dark" | "auto";
};

export type StatusComponentConfig = {
  monitorId: string;
  displayName: string;
  showChart: boolean;
};

export type StatusGroupConfig = {
  id: string;
  name: string;
  components: StatusComponentConfig[];
};

export type StatusPage = {
  id: string;
  slug: string;
  project: string;
  title: string;
  description: string;
  logoUrl: string | null;
  theme: StatusTheme;
  groups: StatusGroupConfig[];
  options: { showUptimeBars: boolean; showResponseTimes: boolean; historyDays: number };
  customDomain: { host: string; verified: boolean } | null;
  published: boolean;
  updatedAt: number;
};

export type StatusSubscriber = {
  id: string;
  pageId: string;
  email: string;
  confirmed: boolean;
  createdAt: number;
};

export type OverallStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

export type ComponentStatus = MonitorStatus | "maintenance";

export type SnapshotDay = {
  date: number;
  uptime: number | null;
  incidents: number;
};

export type SnapshotComponent = {
  id: string;
  name: string;
  status: ComponentStatus;
  uptime90d: number | null;
  days: SnapshotDay[];
  latency: number[] | null;
};

export type PublicIncidentUpdate = {
  id: string;
  status: IncidentStatus;
  message: string;
  at: number;
};

export type PublicIncident = {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  components: string[];
  startedAt: number;
  resolvedAt: number | null;
  updates: PublicIncidentUpdate[];
};

export type ScheduledMaintenance = {
  id: string;
  title: string;
  components: string[];
  startsAt: number;
  endsAt: number;
};

export type StatusSnapshot = {
  slug: string;
  title: string;
  description: string;
  logoUrl: string | null;
  theme: StatusTheme;
  overall: OverallStatus;
  groups: { id: string; name: string; components: SnapshotComponent[] }[];
  activeIncidents: PublicIncident[];
  maintenance: ScheduledMaintenance[];
  history: PublicIncident[];
  options: StatusPage["options"];
  generatedAt: number;
};
