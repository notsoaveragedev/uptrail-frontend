import type { AlertRuleState, ChannelType, Severity } from "@/types/alerts";
import type { Tone } from "./status";

export const SEVERITIES: Severity[] = ["minor", "major", "critical"];

export const SEVERITY_LABELS: Record<Severity, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};

export const SEVERITY_TONE: Record<Severity, Tone> = {
  minor: "paused",
  major: "degraded",
  critical: "down",
};

export const RULE_STATE_LABELS: Record<AlertRuleState, string> = {
  firing: "Firing",
  pending: "Pending",
  ok: "OK",
};

export const RULE_STATE_TONE: Record<AlertRuleState, Tone> = {
  firing: "down",
  pending: "degraded",
  ok: "up",
};

export const CHANNEL_TYPES: ChannelType[] = ["email", "slack", "discord", "webhook"];

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  email: "Email",
  slack: "Slack",
  discord: "Discord",
  webhook: "Webhook",
};

export function formatForDuration(seconds: number) {
  if (seconds === 0) return "immediately";
  if (seconds < 60) return `for ${seconds}s`;
  if (seconds < 3600) return `for ${Math.round(seconds / 60)}m`;
  return `for ${Math.round(seconds / 3600)}h`;
}

export function maskTarget(target: string) {
  if (target.includes("@")) {
    const [name, domain] = target.split("@");
    return `${name.slice(0, 2)}•••@${domain}`;
  }
  const url = target.replace(/^https?:\/\//, "");
  return url.length > 28 ? `${url.slice(0, 18)}…${url.slice(-6)}` : url;
}
