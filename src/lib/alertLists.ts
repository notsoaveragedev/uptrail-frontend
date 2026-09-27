import type { AlertChannel, AlertEvent, AlertRule, AlertRuleState, ChannelType, Severity } from "@/types/alerts";
import { maskTarget } from "./alerts";
import { readList } from "./searchParams";

export type RuleFilters = {
  query: string;
  projects: string[];
  states: AlertRuleState[];
  severities: Severity[];
};

export const RULE_FILTER_KEYS = ["q", "project", "state", "severity"];

export const RULE_STATES: AlertRuleState[] = ["firing", "pending", "ok"];

export const EXAMPLE_EXPRESSIONS = [
  'status == "down" and region_count >= 2',
  "p95(latency) > 800",
  "ssl_days_remaining < 14",
];

export function readRuleFilters(params: URLSearchParams): RuleFilters {
  return {
    query: params.get("q") ?? "",
    projects: readList(params, "project"),
    states: readList(params, "state") as AlertRuleState[],
    severities: readList(params, "severity") as Severity[],
  };
}

export function filterRules(rules: AlertRule[], filters: RuleFilters) {
  const query = filters.query.trim().toLowerCase();
  const matches = (list: string[], value: string) => list.length === 0 || list.includes(value);

  return rules.filter(
    (rule) =>
      `${rule.name} ${rule.expression}`.toLowerCase().includes(query) &&
      matches(filters.projects, rule.project) &&
      matches(filters.states, rule.state) &&
      matches(filters.severities, rule.severity),
  );
}

export function ruleChannelIds(rule: AlertRule) {
  return [...new Set([...rule.channelIds, ...rule.escalation.flatMap((step) => step.channelIds)])];
}

export function countRulesUsing(rules: AlertRule[], channelId: string) {
  return rules.filter((rule) => ruleChannelIds(rule).includes(channelId)).length;
}

export function pluralRules(count: number) {
  return `${count} rule${count === 1 ? "" : "s"}`;
}

export type HistoryStatus = "all" | "firing" | "resolved" | "unacked";

export type HistoryRange = "24h" | "7d" | "30d";

export const HISTORY_STATUSES: HistoryStatus[] = ["all", "firing", "resolved", "unacked"];

export const HISTORY_STATUS_LABELS: Record<HistoryStatus, string> = {
  all: "All",
  firing: "Firing",
  resolved: "Resolved",
  unacked: "Unacked",
};

export const HISTORY_RANGES: HistoryRange[] = ["24h", "7d", "30d"];

export const HISTORY_RANGE_TEXT: Record<HistoryRange, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};

const RANGE_MS: Record<HistoryRange, number> = {
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
};

export type HistoryFilters = {
  ruleId: string | null;
  status: HistoryStatus;
  range: HistoryRange;
};

function matchesStatus(event: AlertEvent, status: HistoryStatus) {
  if (status === "all") return true;
  if (status === "unacked") return event.acknowledgedBy === null;
  return event.status === status;
}

export function filterEvents(events: AlertEvent[], filters: HistoryFilters, now: number) {
  return events.filter(
    (event) =>
      event.firedAt >= now - RANGE_MS[filters.range] &&
      (filters.ruleId === null || event.ruleId === filters.ruleId) &&
      matchesStatus(event, filters.status),
  );
}

export type TimelineEntry = {
  key: string;
  at: number;
  kind: "fired" | "delivered" | "failed" | "acknowledged" | "resolved";
  title: string;
  detail: string | null;
  channelType: ChannelType | null;
};

export function eventTimeline(event: AlertEvent, channels: AlertChannel[]): TimelineEntry[] {
  const channelById = new Map(channels.map((channel) => [channel.id, channel]));
  const entries: TimelineEntry[] = [
    { key: "fired", at: event.firedAt, kind: "fired", title: "Rule fired", detail: null, channelType: null },
    ...event.deliveries.map((delivery, index) => {
      const channel = channelById.get(delivery.channelId);
      return {
        key: `delivery-${index}`,
        at: delivery.at,
        kind: delivery.ok ? ("delivered" as const) : ("failed" as const),
        title: `${delivery.ok ? "Delivered to" : "Failed to reach"} ${channel?.name ?? "a deleted channel"}`,
        detail: [escalationText(delivery.escalationStep), delivery.error].filter(Boolean).join(" · "),
        channelType: channel?.type ?? null,
      };
    }),
  ];
  if (event.acknowledgedBy && event.acknowledgedAt) {
    entries.push({
      key: "ack",
      at: event.acknowledgedAt,
      kind: "acknowledged",
      title: `Acknowledged by ${event.acknowledgedBy}`,
      detail: null,
      channelType: null,
    });
  }
  if (event.resolvedAt) {
    entries.push({
      key: "resolved",
      at: event.resolvedAt,
      kind: "resolved",
      title: "Resolved",
      detail: null,
      channelType: null,
    });
  }
  return entries.sort((a, b) => a.at - b.at);
}

export function escalationText(step: number) {
  return step === 0 ? "Initial notification" : `Escalation step ${step}`;
}

export const WEBHOOK_METHODS = ["POST", "PUT"] as const;

export const TARGET_FIELD: Record<ChannelType, { label: string; placeholder: string; hint: string }> = {
  email: {
    label: "Recipients",
    placeholder: "oncall@acme.com, sre@acme.com",
    hint: "Separate addresses with commas.",
  },
  slack: {
    label: "Webhook URL",
    placeholder: "https://hooks.slack.com/services/…",
    hint: "Create an incoming webhook in Slack and paste its URL.",
  },
  discord: {
    label: "Webhook URL",
    placeholder: "https://discord.com/api/webhooks/…",
    hint: "Server settings → Integrations → Webhooks.",
  },
  webhook: {
    label: "Endpoint URL",
    placeholder: "https://api.acme.com/uptrail/alerts",
    hint: "We send a signed JSON payload for every alert.",
  },
};

export const NAME_PLACEHOLDER: Record<ChannelType, string> = {
  email: "On-call team",
  slack: "#oncall",
  discord: "Status room",
  webhook: "PagerDuty bridge",
};

export function channelTargetText(channel: AlertChannel) {
  if (channel.type !== "email") return maskTarget(channel.target);
  const [first, ...rest] = channel.target.split(",").map((email) => email.trim());
  return rest.length > 0 ? `${maskTarget(first)} +${rest.length}` : maskTarget(first);
}

export function normalizeRecipients(value: string) {
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .join(", ");
}

export function newChannelId() {
  return `ch_${Date.now().toString(36)}`;
}

type ChannelValues = { type: ChannelType; name: string; target: string };

type TestOutcome = { ok: boolean; at: number } | null;

export function buildChannel(id: string, values: ChannelValues, existing: AlertChannel | null, test: TestOutcome) {
  const target = values.type === "email" ? normalizeRecipients(values.target) : values.target;
  const isSameTarget = existing?.target === target;
  return {
    id,
    type: values.type,
    name: values.name,
    target,
    verified: test ? test.ok : isSameTarget && existing.verified,
    lastTestAt: test ? test.at : isSameTarget ? existing.lastTestAt : null,
  } satisfies AlertChannel;
}
