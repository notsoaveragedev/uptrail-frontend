import { Alert } from "antd";
import { useParams } from "react-router";
import { PermissionButton } from "@/components/rbac/PermissionButton";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { MetaList } from "@/components/ui/MetaList";
import { formatCents } from "@/lib/billing";
import { formatLongDate } from "@/lib/format";
import { paths } from "@/lib/paths";
import { cycleUnit, PLAN_NAMES, PRO_PRICE_CENTS } from "@/lib/plans";
import type { OrgBilling } from "@/types/billing";

type PlanSummaryProps = {
  billing: OrgBilling;
  onSwitchCycle: () => void;
  onResume: () => void;
  onUpdateCard: () => void;
};

export function PlanSummary({ billing, onSwitchCycle, onResume, onUpdateCard }: PlanSummaryProps) {
  const { orgSlug = "" } = useParams();
  const isPro = billing.plan === "pro";
  const cycle = billing.cycle ?? "monthly";
  const renewal = billing.renewsAt ? formatLongDate(billing.renewsAt) : null;

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold tracking-tight">{PLAN_NAMES[billing.plan]}</p>
          <p className="font-mono text-xs text-muted">
            {isPro
              ? `${formatCents(PRO_PRICE_CENTS[cycle])} per ${cycleUnit(cycle)}${renewal && billing.status !== "canceling" ? ` · Renews ${renewal}` : ""}`
              : "$0 · Free forever"}
          </p>
        </div>
        {isPro ? (
          billing.status === "canceling" ? (
            <PermissionButton permission="billing:manage" type="primary" onClick={onResume}>
              Resume Pro
            </PermissionButton>
          ) : (
            <PermissionButton permission="billing:manage" onClick={onSwitchCycle}>
              Switch to {cycle === "yearly" ? "monthly" : "yearly"} billing
            </PermissionButton>
          )
        ) : (
          <LinkButton type="primary" to={paths.upgrade(orgSlug)}>
            Upgrade to Pro
          </LinkButton>
        )}
      </div>
      <MetaList className="text-muted">
        <span>{isPro ? `Billed ${cycle}` : "No card on file"}</span>
        <span>Customer since {formatLongDate(billing.memberSince)}</span>
      </MetaList>
      {billing.status === "canceling" && renewal && (
        <p className="text-degraded">Pro ends on {renewal}. You'll move to Free after that.</p>
      )}
      {billing.status === "past_due" && (
        <Alert
          type="error"
          showIcon
          title="Your last payment failed"
          description="We'll retry in 3 days. Update your card to keep Pro."
          action={
            <PermissionButton permission="billing:manage" size="small" onClick={onUpdateCard}>
              Update card
            </PermissionButton>
          }
        />
      )}
    </Card>
  );
}
