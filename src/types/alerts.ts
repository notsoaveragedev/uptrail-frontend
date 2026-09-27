export type Severity = "minor" | "major" | "critical";

export type CompareOperator = ">" | ">=" | "<" | "<=" | "==" | "!=";

export type ExpressionValue = number | string;

export type ExpressionOperand = { type: "field"; name: string } | { type: "fn"; name: string; arg: string };

export type ExpressionNode =
  | { type: "and" | "or"; children: ExpressionNode[] }
  | { type: "compare"; op: CompareOperator; left: ExpressionOperand; right: ExpressionValue };

export type EscalationStep = {
  afterMinutes: number;
  channelIds: string[];
};

export type AlertRuleState = "ok" | "pending" | "firing";

export type AlertRule = {
  id: string;
  name: string;
  project: string;
  monitorIds: string[] | null;
  expression: string;
  forSeconds: number;
  severity: Severity;
  channelIds: string[];
  escalation: EscalationStep[];
  autoIncident: boolean;
  enabled: boolean;
  state: AlertRuleState;
  lastFiredAt: number | null;
  updatedAt: number;
};

export type ChannelType = "email" | "slack" | "discord" | "webhook";

export type AlertChannel = {
  id: string;
  type: ChannelType;
  name: string;
  target: string;
  method?: "POST" | "PUT";
  verified: boolean;
  lastTestAt: number | null;
};

export type AlertDelivery = {
  channelId: string;
  at: number;
  ok: boolean;
  error: string | null;
  escalationStep: number;
};

export type AlertEvent = {
  id: string;
  ruleId: string;
  monitorId: string | null;
  status: "firing" | "resolved";
  valueSnapshot: Record<string, number | string>;
  deliveries: AlertDelivery[];
  acknowledgedBy: string | null;
  acknowledgedAt: number | null;
  incidentId: string | null;
  firedAt: number;
  resolvedAt: number | null;
};
