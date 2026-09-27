import type { Monitor, MonitorStatus } from "./monitor";

export type TimeRange = "1h" | "24h" | "7d" | "30d";

export type AttentionItem = {
  id: string;
  severity: "down" | "degraded" | "warning";
  tag: string;
  monitorName: string;
  diagnosis: string;
  age: string;
  action: { label: string; to: string };
};

export type Incident = {
  id: string;
  severity: "SEV 1" | "SEV 2" | "SEV 3";
  title: string;
  cause: string;
  state: "Investigating" | "Identified" | "Monitoring";
  assignee: { name: string; initials: string };
  startedAt: number;
};

export type Maintenance = {
  title: string;
  project: string;
  startsAt: string;
};

export type AlertEvent = {
  id: string;
  rule: string;
  monitorName: string;
  time: string;
  state: "unacknowledged" | "acknowledged" | "resolved";
  actor?: string;
};

export type Kpis = {
  uptime: number;
  slo: number;
  p95: number;
  p95Previous: number;
  openIncidents: number;
  openIncidentsPrevious: number;
  mttrMinutes: number;
};

export type ResponseSeries = {
  timestamps: number[];
  p50: number[];
  p95: number[];
};

export type StatusCounts = Record<MonitorStatus, number>;

export type Overview = {
  kpis: Kpis;
  monitors: Monitor[];
  totalMonitors: number;
  statusCounts: StatusCounts;
  anomalies: string[];
  attention: AttentionItem[];
  incidents: Incident[];
  maintenance: Maintenance;
  alerts: AlertEvent[];
  responseTime: ResponseSeries;
};
