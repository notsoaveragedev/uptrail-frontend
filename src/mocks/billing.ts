import { DAY_MS } from "@/lib/dates";
import { PRO_PRICE_CENTS } from "@/lib/plans";
import type { Invoice, OrgBilling } from "@/types/billing";

const today = new Date();

function monthStart(offset: number) {
  return new Date(today.getFullYear(), today.getMonth() + offset, 1).getTime();
}

function invoiceNumber(issuedAt: number, index: number) {
  return `INV-${new Date(issuedAt).getFullYear()}-${String(1001 - index).padStart(4, "0")}`;
}

function monthlyInvoices(count: number): Invoice[] {
  return Array.from({ length: count }, (_, index) => {
    const issuedAt = monthStart(-index);
    return {
      id: `inv_${index}`,
      number: invoiceNumber(issuedAt, index),
      issuedAt,
      periodStart: issuedAt,
      periodEnd: monthStart(-index + 1) - DAY_MS,
      amountCents: PRO_PRICE_CENTS.monthly,
      status: index === 7 ? "refunded" : "paid",
    };
  });
}

export const BILLING_BY_ORG: Record<string, OrgBilling> = {
  pixelcraft: {
    plan: "pro",
    cycle: "monthly",
    status: "active",
    memberSince: monthStart(-11),
    renewsAt: monthStart(1),
    usage: { monitors: 42, members: 11, fastestIntervalSec: 30, statusPages: 3 },
    paymentMethod: { brand: "visa", last4: "4242", expMonth: 8, expYear: 2028 },
    billingEmail: "billing@pixelcraft.io",
    address: {
      company: "Pixelcraft Studio Pvt Ltd",
      line1: "14 Lavelle Road",
      city: "Bengaluru",
      postalCode: "560001",
      country: "India",
    },
    taxId: { type: "GSTIN", value: "29AAKCP4821M1Z6" },
  },
  "meera-labs": {
    plan: "free",
    cycle: null,
    status: "active",
    memberSince: today.getTime() - 30 * DAY_MS,
    renewsAt: null,
    usage: { monitors: 17, members: 3, fastestIntervalSec: 60, statusPages: 1 },
    paymentMethod: null,
    billingEmail: "meera@pixelcraft.io",
    address: { company: "Meera Iyer", line1: "", city: "Bengaluru", postalCode: "", country: "India" },
    taxId: null,
  },
};

export const INVOICES_BY_ORG: Record<string, Invoice[]> = {
  pixelcraft: monthlyInvoices(12),
};

export function fallbackBilling(): OrgBilling {
  return {
    ...BILLING_BY_ORG["meera-labs"],
    usage: { monitors: 6, members: 2, fastestIntervalSec: 60, statusPages: 1 },
  };
}
