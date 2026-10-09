import type { BillingCycle, PlanKey } from "@/types/billing";

export const PLAN_LIMITS = {
  free: { monitors: 20, members: 3, minIntervalSec: 60, historyDays: 30, customRoles: false, customDomain: false },
  pro: { monitors: 200, members: null, minIntervalSec: 30, historyDays: 365, customRoles: true, customDomain: true },
} as const;

export const PLAN_NAMES: Record<PlanKey, string> = { free: "Free", pro: "Pro" };

export const PRO_PRICE_CENTS: Record<BillingCycle, number> = { monthly: 1900, yearly: 19000 };

export function cycleUnit(cycle: BillingCycle) {
  return cycle === "yearly" ? "year" : "month";
}

export function intervalText(seconds: number) {
  return seconds >= 60 ? `${seconds / 60} minute` : `${seconds} second`;
}

export function historyText(days: number) {
  return days >= 365 ? "1 year" : `${days} days`;
}

export function planFeatures(plan: PlanKey) {
  const limits = PLAN_LIMITS[plan];
  return [
    { label: "Monitors", value: String(limits.monitors) },
    { label: "Check interval", value: `${intervalText(limits.minIntervalSec)} checks` },
    { label: "Members", value: limits.members === null ? "Unlimited" : String(limits.members) },
    { label: "Check history", value: historyText(limits.historyDays) },
    { label: "Custom roles and audit log", value: limits.customRoles ? "Included" : "Not included" },
    { label: "Custom status page domain", value: limits.customDomain ? "Included" : "Not included" },
  ];
}

export function planHighlights(plan: PlanKey) {
  const limits = PLAN_LIMITS[plan];
  return [
    `${limits.monitors} monitors`,
    `${intervalText(limits.minIntervalSec)} checks`,
    limits.members === null ? "Unlimited members" : `${limits.members} members`,
    `${historyText(limits.historyDays)} of history`,
    ...(limits.customRoles
      ? ["Custom roles and audit log", "Custom status page domain"]
      : ["Every alert channel", "A status page per project"]),
  ];
}
