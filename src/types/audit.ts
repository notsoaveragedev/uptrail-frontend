export type AuditActorType = "user" | "api_key" | "system";

export type AuditValue = string | number | boolean | null | string[];

export type AuditEvent = {
  id: string;
  actor: { type: AuditActorType; name: string };
  action: string;
  resource: { type: string; id: string; name: string };
  project: string | null;
  before: Record<string, AuditValue> | null;
  after: Record<string, AuditValue> | null;
  ip: string | null;
  userAgent: string | null;
  requestId: string;
  at: number;
};
