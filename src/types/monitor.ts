export type MonitorStatus = "up" | "degraded" | "down" | "paused";

export type MonitorType = "http" | "keyword" | "json" | "ssl" | "response_time";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type RegionCode = "BOM" | "FRA" | "IAD" | "SIN" | "SFO";

export type Monitor = {
  id: string;
  name: string;
  url: string;
  type: MonitorType;
  method: HttpMethod;
  intervalSec: number;
  project: string;
  tags: string[];
  status: MonitorStatus;
  statusSince: number;
  latencyMs: number | null;
  uptime24h: number | null;
  uptime30d: number | null;
  regions: { code: RegionCode; status: MonitorStatus }[];
  checks: MonitorStatus[];
  latencyHistory: number[];
  lastCheckedAt: number | null;
};

export type MonitorChange =
  | { action: "pause" | "resume" | "delete"; ids: string[] }
  | { action: "move"; ids: string[]; project: string }
  | { action: "tag"; ids: string[]; tag: string };
