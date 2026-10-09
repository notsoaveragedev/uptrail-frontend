import { LuCreditCard } from "react-icons/lu";
import { PermissionButton } from "@/components/rbac/PermissionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cardExpiry, cardLabel } from "@/lib/billing";
import type { PaymentMethod } from "@/types/billing";

type PaymentMethodRowProps = { method: PaymentMethod | null; onUpdate: () => void };

export function PaymentMethodRow({ method, onUpdate }: PaymentMethodRowProps) {
  if (!method) {
    return (
      <div className="rounded-lg border border-line">
        <EmptyState
          icon={<LuCreditCard />}
          title="No payment method"
          description="You'll add a card when you upgrade."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-card px-4 py-3">
      <span className="flex h-7 w-10 items-center justify-center rounded-sm border border-line bg-panel font-mono text-caps font-semibold uppercase">
        {method.brand === "mastercard" ? "MC" : method.brand}
      </span>
      <span className="flex flex-col">
        <span className="font-medium">{cardLabel(method)}</span>
        <span className="font-mono text-xs text-subtle">Expires {cardExpiry(method)}</span>
      </span>
      <PermissionButton permission="billing:manage" onClick={onUpdate} className="ml-auto">
        Update
      </PermissionButton>
    </div>
  );
}
