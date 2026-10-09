import { Card } from "@/components/ui/Card";
import { formatCents, nextRenewalAt } from "@/lib/billing";
import { formatLongDate } from "@/lib/format";
import { PRO_PRICE_CENTS } from "@/lib/plans";
import type { BillingCycle } from "@/types/billing";

export function CheckoutSummary({ cycle }: { cycle: BillingCycle }) {
  const total = formatCents(PRO_PRICE_CENTS[cycle]);

  return (
    <Card className="gap-3 p-5">
      <h2 className="text-md font-semibold">Summary</h2>
      <dl className="flex flex-col gap-2">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Pro, {cycle}</dt>
          <dd className="font-mono">{total}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-2 font-medium">
          <dt>Due today</dt>
          <dd className="font-mono">{total}</dd>
        </div>
      </dl>
      <p className="text-xs text-subtle">
        Renews {formatLongDate(nextRenewalAt(cycle))}. Cancel any time from Usage & billing.
      </p>
    </Card>
  );
}
