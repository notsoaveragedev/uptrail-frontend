import { useParams } from "react-router";
import { useSaveBilling } from "@/api/billing";
import { PermissionButton } from "@/components/rbac/PermissionButton";
import { DangerRow, DangerZone } from "@/components/ui/DangerZone";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { downgradeLosses, isOverFreeLimits } from "@/lib/billing";
import { formatLongDate } from "@/lib/format";
import type { OrgBilling } from "@/types/billing";

export function CancelPlanZone({ billing, orgName }: { billing: OrgBilling; orgName: string }) {
  const { orgSlug = "" } = useParams();
  const confirm = useConfirm();
  const toast = useToast();
  const save = useSaveBilling(orgSlug);
  const endsOn = billing.renewsAt ? formatLongDate(billing.renewsAt) : "the end of this period";

  async function cancelPlan() {
    const losses = downgradeLosses(billing);
    const isConfirmed = await confirm({
      title: `Cancel Pro for ${orgName}?`,
      description: `You keep Pro until ${endsOn}. After that:`,
      isDanger: true,
      confirmLabel: "Cancel Pro",
      typeToConfirm: isOverFreeLimits(billing) ? { expected: orgSlug, consequences: losses } : undefined,
    });
    if (!isConfirmed) return;
    await save.mutateAsync({ status: "canceling" });
    toast.warning("Pro cancelled", `You keep Pro until ${endsOn}.`, {
      label: "Undo",
      onClick: () => save.mutate({ status: "active" }),
    });
  }

  return (
    <DangerZone>
      <DangerRow
        title="Cancel Pro"
        description={`Keep Pro until ${endsOn}, then move to Free.`}
        action={
          <PermissionButton permission="billing:manage" danger size="small" onClick={cancelPlan}>
            Cancel plan
          </PermissionButton>
        }
      />
    </DangerZone>
  );
}
