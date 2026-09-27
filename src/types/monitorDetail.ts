import type { HttpMethod, MonitorStatus, RegionCode } from "./monitor";

export type DetailTab = "overview" | "checks" | "incidents" | "alerts" | "settings";

export type DownBand = {
  start: number;
  end: number;
  label: string;
};

export type ChartMarker = {
  timestamp: number;
  value: number;
};

export type ResponseHistory = {
  timestamps: number[];
  p50: (number | null)[];
  p95: (number | null)[];
  downBands: DownBand[];
  anomalies: ChartMarker[];
};

export type TimingPhase = "dns" | "connect" | "tls" | "ttfb" | "download";

export type TimingHour = {
  hour: string;
  phases: Record<TimingPhase, number>;
};

export type RegionStat = {
  code: RegionCode;
  city: string;
  status: MonitorStatus;
  latencyMs: number | null;
  p95Ms: number;
};

export type UptimeDay = {
  date: number;
  uptime: number | null;
  incidents: number;
};

export type CheckResult = {
  id: string;
  checkedAt: number;
  region: RegionCode;
  statusCode: number | null;
  responseMs: number;
  status: MonitorStatus;
  error: string | null;
};

export type IncidentState = "Investigating" | "Identified" | "Monitoring" | "Resolved";

export type MonitorIncident = {
  id: string;
  severity: "SEV 1" | "SEV 2" | "SEV 3";
  title: string;
  cause: string;
  state: IncidentState;
  startedAt: number;
  resolvedAt: number | null;
  assignee: string;
};

export type AlertRule = {
  id: string;
  name: string;
  expression: string;
  channels: string[];
  isEnabled: boolean;
};

export type AlertHistoryItem = {
  id: string;
  rule: string;
  firedAt: number;
  state: "firing" | "acknowledged" | "resolved";
  detail: string;
};

export type MonitorHeader = {
  name: string;
  value: string;
  isSecret: boolean;
};

export type MonitorConfig = {
  url: string;
  method: HttpMethod;
  headers: MonitorHeader[];
  body: string | null;
  expectedStatus: string;
  assertions: string[];
  intervalSec: number;
  timeoutMs: number;
  regions: RegionCode[];
  tags: string[];
  followRedirects: boolean;
  sslExpiryDays: number;
};

export type MonitorDetail = {
  uptime: { day: number | null; week: number | null; month: number | null; quarter: number | null };
  latency: { avg: number | null; p95: number | null; p99: number | null };
  timing: TimingHour[];
  regions: RegionStat[];
  days: UptimeDay[];
  checks: CheckResult[];
  incidents: MonitorIncident[];
  rules: AlertRule[];
  alertHistory: AlertHistoryItem[];
  config: MonitorConfig;
};
