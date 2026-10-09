import type { BillingCycle, Invoice, InvoiceStatus, OrgBilling, PaymentMethod, TaxIdType } from "@/types/billing";
import type { Tone } from "./status";
import { PLAN_LIMITS } from "./plans";

export type UsageLevel = "ok" | "near" | "at";

export const USAGE_FILL: Record<UsageLevel, string> = { ok: "bg-accent", near: "bg-degraded", at: "bg-down" };

export const USAGE_TEXT: Record<UsageLevel, string> = { ok: "text-ink", near: "text-degraded", at: "text-down" };

export const USAGE_LABEL: Record<UsageLevel, string> = { ok: "", near: "Near limit", at: "At limit" };

export const INVOICE_BADGE: Record<InvoiceStatus, { tone: Tone; label: string }> = {
  paid: { tone: "up", label: "Paid" },
  open: { tone: "degraded", label: "Open" },
  failed: { tone: "down", label: "Failed" },
  refunded: { tone: "paused", label: "Refunded" },
};

const BRAND_NAMES: Record<PaymentMethod["brand"], string> = { visa: "Visa", mastercard: "Mastercard", amex: "Amex" };

export const COUNTRIES = ["India", "Germany", "United States", "United Kingdom", "Singapore"];

export function usageLevel(used: number, limit: number): UsageLevel {
  const ratio = used / limit;
  if (ratio >= 1) return "at";
  return ratio >= 0.8 ? "near" : "ok";
}

export function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function cardLabel(method: PaymentMethod) {
  return `${BRAND_NAMES[method.brand]} ending ${method.last4}`;
}

export function cardExpiry(method: PaymentMethod) {
  return `${String(method.expMonth).padStart(2, "0")}/${String(method.expYear).slice(-2)}`;
}

export function limitWarning(billing: OrgBilling) {
  if (billing.plan !== "free") return null;
  const limits = PLAN_LIMITS.free;
  const members = usageLevel(billing.usage.members, limits.members);
  const monitors = usageLevel(billing.usage.monitors, limits.monitors);
  if (members === "at") {
    return {
      level: "at" as const,
      title: "You've reached your member limit",
      description: `Free includes ${limits.members} members. Invites are blocked until you upgrade or remove someone.`,
    };
  }
  if (monitors === "at" || monitors === "near") {
    return {
      level: monitors,
      title: monitors === "at" ? "You've reached your monitor limit" : "You're close to your monitor limit",
      description: `${billing.usage.monitors} of ${limits.monitors} monitors used. Pro raises the limit to ${PLAN_LIMITS.pro.monitors}.`,
    };
  }
  return null;
}

export function downgradeLosses(billing: OrgBilling) {
  const limits = PLAN_LIMITS.free;
  const extraMonitors = billing.usage.monitors - limits.monitors;
  const extraMembers = billing.usage.members - limits.members;
  return [
    ...(extraMonitors > 0 ? [`${extraMonitors} monitors over the Free limit are paused, newest first.`] : []),
    ...(extraMembers > 0 ? [`${extraMembers} members over the limit keep access but new invites are blocked.`] : []),
    `Check history older than ${limits.historyDays} days is deleted.`,
    "Custom roles become read-only and checks slow to once a minute.",
  ];
}

export function isOverFreeLimits(billing: OrgBilling) {
  return billing.usage.monitors > PLAN_LIMITS.free.monitors || billing.usage.members > PLAN_LIMITS.free.members;
}

export function sortInvoices(invoices: Invoice[]) {
  return [...invoices].sort((a, b) => b.issuedAt - a.issuedAt);
}

const DECLINED_TEST_CARD = "4000000000000002";

export function nextRenewalAt(cycle: BillingCycle) {
  const date = new Date();
  if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date.getTime();
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isDeclinedTestCard(cardNumber: string) {
  return digitsOnly(cardNumber) === DECLINED_TEST_CARD;
}

export function groupCardNumber(value: string) {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiryInput(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function isLuhnValid(value: string) {
  const digits = digitsOnly(value);
  if (digits.length < 13 || digits.length > 19) return false;
  const sum = [...digits].reverse().reduce((total, char, index) => {
    const digit = Number(char) * (index % 2 === 1 ? 2 : 1);
    return total + (digit > 9 ? digit - 9 : digit);
  }, 0);
  return sum % 10 === 0;
}

export function parseExpiry(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[1]);
  return month >= 1 && month <= 12 ? { month, year: 2000 + Number(match[2]) } : null;
}

export function isFutureExpiry(value: string, now = new Date()) {
  const expiry = parseExpiry(value);
  if (!expiry) return false;
  return expiry.year > now.getFullYear() || (expiry.year === now.getFullYear() && expiry.month >= now.getMonth() + 1);
}

export function toPaymentMethod(cardNumber: string, expiry: string): PaymentMethod {
  const digits = digitsOnly(cardNumber);
  const parsed = parseExpiry(expiry);
  const brand = digits.startsWith("3") ? "amex" : digits.startsWith("5") ? "mastercard" : "visa";
  return { brand, last4: digits.slice(-4), expMonth: parsed?.month ?? 1, expYear: parsed?.year ?? 2030 };
}

export function taxTypeFor(country: string): TaxIdType {
  if (country === "India") return "GSTIN";
  return country === "United States" ? "EIN" : "VAT";
}
