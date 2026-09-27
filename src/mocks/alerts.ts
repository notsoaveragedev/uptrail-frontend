import type { AlertChannel, AlertEvent, AlertRule } from "@/types/alerts";
import { seeded } from "./random";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const now = Date.now();

export const ALERT_CHANNELS: AlertChannel[] = [
  {
    id: "ch_email",
    type: "email",
    name: "On-call team",
    target: "oncall@pixelcraft.io",
    verified: true,
    lastTestAt: now - 3 * DAY,
  },
  {
    id: "ch_slack",
    type: "slack",
    name: "#oncall",
    target: "https://hooks.slack.com/services/T024/B07/xyz",
    verified: true,
    lastTestAt: now - DAY,
  },
  {
    id: "ch_discord",
    type: "discord",
    name: "Status room",
    target: "https://discord.com/api/webhooks/1182/abc",
    verified: false,
    lastTestAt: null,
  },
  {
    id: "ch_webhook",
    type: "webhook",
    name: "PagerDuty bridge",
    target: "https://events.pagerduty.com/integration/e93/enqueue",
    verified: true,
    lastTestAt: now - 9 * DAY,
  },
];

export const ALERT_RULES: AlertRule[] = [
  {
    id: "rule_down_regions",
    name: "Down in 2+ regions",
    project: "shopnest",
    monitorIds: ["mon_checkout", "mon_payments"],
    expression: 'status == "down" and region_count >= 2',
    forSeconds: 120,
    severity: "critical",
    channelIds: ["ch_slack", "ch_webhook"],
    escalation: [{ afterMinutes: 10, channelIds: ["ch_email"] }],
    autoIncident: true,
    enabled: true,
    state: "firing",
    lastFiredAt: now - 6 * MINUTE,
    updatedAt: now - 12 * DAY,
  },
  {
    id: "rule_p95_latency",
    name: "Slow p95 latency",
    project: "pixelcraft",
    monitorIds: ["mon_search", "mon_public_api"],
    expression: "p95(latency) > 800",
    forSeconds: 300,
    severity: "major",
    channelIds: ["ch_slack"],
    escalation: [],
    autoIncident: false,
    enabled: true,
    state: "firing",
    lastFiredAt: now - 12 * MINUTE,
    updatedAt: now - 20 * DAY,
  },
  {
    id: "rule_ssl_expiry",
    name: "SSL certificate expiring",
    project: "pixelcraft",
    monitorIds: null,
    expression: "ssl_days_remaining < 14",
    forSeconds: 0,
    severity: "minor",
    channelIds: ["ch_email"],
    escalation: [],
    autoIncident: false,
    enabled: true,
    state: "pending",
    lastFiredAt: now - 2 * HOUR,
    updatedAt: now - 40 * DAY,
  },
  {
    id: "rule_keyword",
    name: "Booking CTA missing",
    project: "bluepeak",
    monitorIds: ["mon_marketing"],
    expression: 'status == "down" and error_rate > 5',
    forSeconds: 180,
    severity: "major",
    channelIds: ["ch_email", "ch_discord"],
    escalation: [],
    autoIncident: false,
    enabled: true,
    state: "ok",
    lastFiredAt: now - 38 * MINUTE,
    updatedAt: now - 7 * DAY,
  },
  {
    id: "rule_eu_latency",
    name: "EU latency regression",
    project: "shopnest",
    monitorIds: null,
    expression: 'p99(latency) > 1500 and region == "FRA" or error_rate > 2',
    forSeconds: 600,
    severity: "major",
    channelIds: ["ch_slack"],
    escalation: [{ afterMinutes: 15, channelIds: ["ch_webhook"] }],
    autoIncident: true,
    enabled: false,
    state: "ok",
    lastFiredAt: now - 9 * DAY,
    updatedAt: now - 3 * DAY,
  },
  {
    id: "rule_error_rate",
    name: "Error rate spike",
    project: "pixelcraft",
    monitorIds: null,
    expression: "error_rate > 1 and status_code >= 500",
    forSeconds: 120,
    severity: "critical",
    channelIds: ["ch_slack", "ch_email"],
    escalation: [{ afterMinutes: 5, channelIds: ["ch_webhook"] }],
    autoIncident: true,
    enabled: true,
    state: "ok",
    lastFiredAt: now - 4 * DAY,
    updatedAt: now - 30 * DAY,
  },
];

const EVENT_MONITORS: Record<string, string[]> = {
  rule_down_regions: ["mon_checkout", "mon_payments"],
  rule_p95_latency: ["mon_search", "mon_public_api"],
  rule_ssl_expiry: ["mon_cdn"],
  rule_keyword: ["mon_marketing"],
  rule_eu_latency: ["mon_checkout", "mon_auth"],
  rule_error_rate: ["mon_public_api", "mon_auth"],
};

const ACKNOWLEDGERS = ["Meera Iyer", "Arjun Rao", "Priya Nair"];

function buildEvents(): AlertEvent[] {
  const random = seeded(7);
  const events: AlertEvent[] = [];

  for (let index = 0; index < 90; index++) {
    const rule = ALERT_RULES[Math.floor(random() * ALERT_RULES.length)];
    const monitors = EVENT_MONITORS[rule.id];
    const firedAt = now - Math.round(random() * 30 * DAY) - HOUR;
    const durationMs = Math.round((3 + random() * 55) * MINUTE);
    const isAcknowledged = random() > 0.3;
    events.push({
      id: `evt_${index.toString(36).padStart(3, "0")}`,
      ruleId: rule.id,
      monitorId: monitors[Math.floor(random() * monitors.length)],
      status: "resolved",
      valueSnapshot: { latency_p95: Math.round(600 + random() * 1400), error_rate: Number((random() * 8).toFixed(2)) },
      deliveries: rule.channelIds.map((channelId) => ({
        channelId,
        at: firedAt + 2_000,
        ok: channelId !== "ch_discord" || random() > 0.5,
        error: channelId === "ch_discord" ? "Webhook returned 404" : null,
        escalationStep: 0,
      })),
      acknowledgedBy: isAcknowledged ? ACKNOWLEDGERS[Math.floor(random() * ACKNOWLEDGERS.length)] : null,
      acknowledgedAt: isAcknowledged ? firedAt + Math.round(random() * 9 * MINUTE) : null,
      incidentId: rule.autoIncident && random() > 0.6 ? `INC-${10 + index}` : null,
      firedAt,
      resolvedAt: firedAt + durationMs,
    });
  }

  const firing: AlertEvent[] = [
    {
      id: "evt_live_down",
      ruleId: "rule_down_regions",
      monitorId: "mon_checkout",
      status: "firing",
      valueSnapshot: { regions_down: 2, latency_p95: 10_000 },
      deliveries: [
        { channelId: "ch_slack", at: now - 6 * MINUTE, ok: true, error: null, escalationStep: 0 },
        { channelId: "ch_webhook", at: now - 6 * MINUTE, ok: true, error: null, escalationStep: 0 },
      ],
      acknowledgedBy: null,
      acknowledgedAt: null,
      incidentId: "INC-42",
      firedAt: now - 6 * MINUTE,
      resolvedAt: null,
    },
    {
      id: "evt_live_latency",
      ruleId: "rule_p95_latency",
      monitorId: "mon_search",
      status: "firing",
      valueSnapshot: { latency_p95: 1240 },
      deliveries: [{ channelId: "ch_slack", at: now - 12 * MINUTE, ok: true, error: null, escalationStep: 0 }],
      acknowledgedBy: "Meera Iyer",
      acknowledgedAt: now - 10 * MINUTE,
      incidentId: null,
      firedAt: now - 12 * MINUTE,
      resolvedAt: null,
    },
  ];

  return [...firing, ...events.sort((a, b) => b.firedAt - a.firedAt)];
}

export const ALERT_EVENTS = buildEvents();
