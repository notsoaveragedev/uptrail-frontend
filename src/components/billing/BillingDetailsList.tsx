import { PermissionButton } from "@/components/rbac/PermissionButton";
import { Fact } from "@/components/ui/Fact";
import type { OrgBilling } from "@/types/billing";

function addressText({ line1, city, postalCode, country }: OrgBilling["address"]) {
  return [line1, [city, postalCode].filter(Boolean).join(" "), country].filter(Boolean).join(", ");
}

export function BillingDetailsList({ billing, onEdit }: { billing: OrgBilling; onEdit: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <dl className="grid w-full grid-cols-[8rem_minmax(0,1fr)] gap-x-4 gap-y-2.5">
        <Fact label="Billing email">{billing.billingEmail}</Fact>
        <Fact label="Company">{billing.address.company}</Fact>
        <Fact label="Address">{addressText(billing.address)}</Fact>
        <Fact label="Tax ID">
          {billing.taxId ? (
            <span className="font-mono">
              {billing.taxId.type} {billing.taxId.value}
            </span>
          ) : (
            <span className="text-subtle">None</span>
          )}
        </Fact>
      </dl>
      <PermissionButton permission="billing:manage" onClick={onEdit}>
        Edit details
      </PermissionButton>
    </div>
  );
}
