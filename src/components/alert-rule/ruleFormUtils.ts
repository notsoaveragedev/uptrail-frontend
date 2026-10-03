import { z } from "zod";
import type { ParseResult } from "@/lib/alertExpression/parse";
import { fitsVisual, MAX_DEPTH } from "@/lib/alertExpression/visual";
import type { AlertRule, EscalationStep, Severity } from "@/types/alerts";
import { newId } from "@/lib/ids";

export type ConditionMode = "visual" | "text";

export type ConditionValidity = "valid" | "invalid" | "incomplete";

export type EscalationDraft = EscalationStep & { id: string };

export type RuleDraft = {
  name: string;
  project: string;
  monitorIds: string[];
  expression: string;
  forSeconds: number;
  severity: Severity;
  autoIncident: boolean;
  channelIds: string[];
  escalation: EscalationDraft[];
};

export type RuleErrors = Partial<Record<"name" | "project" | "channelIds" | "escalation", string>>;

export const DEFAULT_EXPRESSION = "p95(latency) > 800";

export const FOR_OPTIONS = [0, 60, 120, 180, 300, 600, 900, 1800, 3600].map((seconds) => ({
  value: seconds,
  label: seconds === 0 ? "Immediately" : seconds < 3600 ? `${seconds / 60}m` : `${seconds / 3600}h`,
}));

export const SEVERITY_DOT: Record<Severity, string> = {
  minor: "bg-paused",
  major: "bg-degraded",
  critical: "bg-down",
};

const ruleDraftSchema = z.object({
  name: z.string().trim().min(1, "Give the rule a name").max(80, "Keep the name under 80 characters"),
  project: z.string().min(1, "Pick a project"),
  channelIds: z.array(z.string()).min(1, "Pick at least one channel to notify"),
  escalation: z.array(
    z.object({
      afterMinutes: z.number().int().min(1, "Escalate after at least 1 minute"),
      channelIds: z.array(z.string()).min(1, "Each escalation step needs a channel"),
    }),
  ),
});

export function newEscalationStep(afterMinutes = 15): EscalationDraft {
  return { id: newId("step"), afterMinutes, channelIds: [] };
}

export function newDraft(expression = DEFAULT_EXPRESSION): RuleDraft {
  return {
    name: "",
    project: "shopnest",
    monitorIds: [],
    expression,
    forSeconds: 300,
    severity: "major",
    autoIncident: false,
    channelIds: [],
    escalation: [],
  };
}

export function draftFromRule(rule: AlertRule): RuleDraft {
  return {
    name: rule.name,
    project: rule.project,
    monitorIds: rule.monitorIds ?? [],
    expression: rule.expression,
    forSeconds: rule.forSeconds,
    severity: rule.severity,
    autoIncident: rule.autoIncident,
    channelIds: rule.channelIds,
    escalation: rule.escalation.map((step) => ({ ...step, id: newId("step") })),
  };
}

export function ruleFromDraft(draft: RuleDraft, existing: AlertRule | null): AlertRule {
  return {
    id: existing?.id ?? newId("rule"),
    name: draft.name.trim(),
    project: draft.project,
    monitorIds: draft.monitorIds.length > 0 ? draft.monitorIds : null,
    expression: draft.expression.trim(),
    forSeconds: draft.forSeconds,
    severity: draft.severity,
    channelIds: draft.channelIds,
    escalation: draft.escalation.map(({ afterMinutes, channelIds }) => ({ afterMinutes, channelIds })),
    autoIncident: draft.autoIncident,
    enabled: existing?.enabled ?? true,
    state: existing?.state ?? "ok",
    lastFiredAt: existing?.lastFiredAt ?? null,
    updatedAt: Date.now(),
  };
}

export function validateDraft(draft: RuleDraft): RuleErrors {
  const result = ruleDraftSchema.safeParse(draft);
  if (result.success) return {};
  const errors: RuleErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RuleErrors;
    errors[field] ??= issue.message;
  }
  return errors;
}

export function isSameDraft(a: RuleDraft, b: RuleDraft) {
  const strip = (draft: RuleDraft) => ({
    ...draft,
    escalation: draft.escalation.map((step) => [step.afterMinutes, step.channelIds]),
  });
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
}

export function focusField(id: string | undefined) {
  if (id) document.getElementById(id)?.focus();
}

export function visualBlockedReason(parsed: ParseResult) {
  if (!parsed.ok) return "Fix 1 error to switch to Visual";
  if (!fitsVisual(parsed.ast)) return `Nested more than ${MAX_DEPTH} levels deep. Simplify it to use Visual`;
  return null;
}
