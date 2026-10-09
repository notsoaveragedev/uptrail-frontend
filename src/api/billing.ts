import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { nextRenewalAt } from "@/lib/billing";
import { fakeRequest } from "@/lib/fakeRequest";
import { PRO_PRICE_CENTS } from "@/lib/plans";
import { BILLING_BY_ORG, fallbackBilling, INVOICES_BY_ORG } from "@/mocks/billing";
import type { BillingCycle, Invoice, OrgBilling, PaymentMethod } from "@/types/billing";

const billingByOrg = { ...BILLING_BY_ORG };
const invoicesByOrg = { ...INVOICES_BY_ORG };

function billingKey(orgSlug: string) {
  return ["billing", orgSlug] as const;
}

function invoicesKey(orgSlug: string) {
  return ["billing", orgSlug, "invoices"] as const;
}

function readBilling(orgSlug: string) {
  billingByOrg[orgSlug] ??= fallbackBilling();
  return billingByOrg[orgSlug];
}

export function billingQuery(orgSlug: string) {
  return queryOptions({
    queryKey: billingKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(350);
      return readBilling(orgSlug);
    },
  });
}

export function invoicesQuery(orgSlug: string) {
  return queryOptions({
    queryKey: invoicesKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(450);
      return invoicesByOrg[orgSlug] ?? [];
    },
  });
}

export function useSaveBilling(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (changes: Partial<OrgBilling>) => {
      await fakeRequest(700);
      billingByOrg[orgSlug] = { ...readBilling(orgSlug), ...changes };
      return billingByOrg[orgSlug];
    },
    onSuccess: (billing) => queryClient.setQueryData(billingKey(orgSlug), billing),
  });
}

export function useUpgradePlan(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cycle, paymentMethod }: { cycle: BillingCycle; paymentMethod: PaymentMethod }) => {
      await fakeRequest(1400);
      const issuedAt = Date.now();
      const renewsAt = nextRenewalAt(cycle);
      const invoice: Invoice = {
        id: `inv_${issuedAt}`,
        number: `INV-${new Date(issuedAt).getFullYear()}-1002`,
        issuedAt,
        periodStart: issuedAt,
        periodEnd: renewsAt,
        amountCents: PRO_PRICE_CENTS[cycle],
        status: "paid",
      };
      billingByOrg[orgSlug] = {
        ...readBilling(orgSlug),
        plan: "pro",
        cycle,
        status: "active",
        renewsAt,
        paymentMethod,
      };
      invoicesByOrg[orgSlug] = [invoice, ...(invoicesByOrg[orgSlug] ?? [])];
      return { billing: billingByOrg[orgSlug], invoice };
    },
    onSuccess: ({ billing }) => {
      queryClient.setQueryData(billingKey(orgSlug), billing);
      queryClient.invalidateQueries({ queryKey: invoicesKey(orgSlug) });
    },
  });
}
