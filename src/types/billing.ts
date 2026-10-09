export type PlanKey = "free" | "pro";

export type BillingCycle = "monthly" | "yearly";

export type PaymentMethod = { brand: "visa" | "mastercard" | "amex"; last4: string; expMonth: number; expYear: number };

export type BillingAddress = { company: string; line1: string; city: string; postalCode: string; country: string };

export type TaxIdType = "GSTIN" | "VAT" | "EIN";

export type OrgBilling = {
  plan: PlanKey;
  cycle: BillingCycle | null;
  status: "active" | "past_due" | "canceling";
  memberSince: number;
  renewsAt: number | null;
  usage: { monitors: number; members: number; fastestIntervalSec: number; statusPages: number };
  paymentMethod: PaymentMethod | null;
  billingEmail: string;
  address: BillingAddress;
  taxId: { type: TaxIdType; value: string } | null;
};

export type InvoiceStatus = "paid" | "open" | "failed" | "refunded";

export type Invoice = {
  id: string;
  number: string;
  issuedAt: number;
  periodStart: number;
  periodEnd: number;
  amountCents: number;
  status: InvoiceStatus;
};
