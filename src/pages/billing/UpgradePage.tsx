import { useQuery } from "@tanstack/react-query";
import { Button, Segmented, Steps } from "antd";
import { LuArrowLeft } from "react-icons/lu";
import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router";
import { billingQuery } from "@/api/billing";
import { CheckoutForm } from "@/components/billing/CheckoutForm";
import { CheckoutSummary } from "@/components/billing/CheckoutSummary";
import { PlanComparison } from "@/components/billing/PlanComparison";
import { UpgradeSuccess } from "@/components/billing/UpgradeSuccess";
import { LinkButton } from "@/components/ui/LinkButton";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useToast } from "@/hooks/useToast";
import { USAGE_TEXT, usageLevel } from "@/lib/billing";
import { findOrganization, lastOrg } from "@/lib/currentOrg";
import { paths } from "@/lib/paths";
import { PLAN_LIMITS } from "@/lib/plans";
import { readEnum } from "@/lib/searchParams";
import type { BillingCycle, OrgBilling } from "@/types/billing";

const STEPS = ["plan", "checkout", "done"] as const;

const CYCLES: BillingCycle[] = ["monthly", "yearly"];

const CYCLE_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly · 2 months free", value: "yearly" },
];

export function UpgradePage() {
  const { orgSlug = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: billing } = useQuery(billingQuery(orgSlug));
  const toast = useToast();
  const step = readEnum(params, "step", STEPS, "plan");
  const cycle = readEnum(params, "cycle", CYCLES, "monthly");
  const orgName = findOrganization(orgSlug).name;
  const [hasJustPaid, setHasJustPaid] = useState(false);
  const isDone = hasJustPaid || step === "done";

  function goTo(nextStep: (typeof STEPS)[number], { replace = false } = {}) {
    setParams({ step: nextStep, cycle }, { replace });
  }

  if (!billing) return <SkeletonBlock isInset className="mx-auto h-120 max-w-4xl" />;
  if (billing.plan === "pro" && !isDone) return <Navigate to={paths.billing(orgSlug)} replace />;
  if (billing.plan === "free" && isDone && !hasJustPaid) return <Navigate to={paths.upgrade(orgSlug)} replace />;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <title>{`Upgrade to Pro · ${orgName} · Uptrail`}</title>
      <Link to={paths.billing(orgSlug)} className="flex w-fit items-center gap-1.5 text-muted hover:text-ink">
        <LuArrowLeft aria-hidden className="size-3.5" />
        Back to Usage & billing
      </Link>

      {isDone ? (
        <UpgradeSuccess orgName={orgName} email={billing.billingEmail} />
      ) : (
        <>
          <PageHeader title={`Upgrade ${orgName} to Pro`} meta="Higher limits for teams that go on call." />
          <Steps
            size="small"
            current={step === "plan" ? 0 : 1}
            items={[{ title: "Choose billing" }, { title: "Pay" }]}
            className="max-w-md"
          />
          {step === "plan" ? (
            <PlanStep
              billing={billing}
              cycle={cycle}
              onCycleChange={(next) => setParams({ step, cycle: next }, { replace: true })}
              onContinue={() => goTo("checkout")}
            />
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="lg:order-last">
                <CheckoutSummary cycle={cycle} />
              </div>
              <CheckoutForm
                billing={billing}
                cycle={cycle}
                onBack={() => goTo("plan")}
                onPaid={(invoiceNumber) => {
                  setHasJustPaid(true);
                  goTo("done", { replace: true });
                  toast.success("Upgraded to Pro", `Receipt ${invoiceNumber} sent to ${billing.billingEmail}.`);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

type PlanStepProps = {
  billing: OrgBilling;
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  onContinue: () => void;
};

function PlanStep({ billing, cycle, onCycleChange, onContinue }: PlanStepProps) {
  const { orgSlug = "" } = useParams();
  const free = PLAN_LIMITS.free;
  const monitors = usageLevel(billing.usage.monitors, free.monitors);
  const members = usageLevel(billing.usage.members, free.members);

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        aria-label="Billing cycle"
        value={cycle}
        onChange={(value) => onCycleChange(value as BillingCycle)}
        options={CYCLE_OPTIONS}
        className="self-start"
      />
      <PlanComparison cycle={cycle} current={billing.plan} />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-panel px-4 py-3">
        <MetaList className="text-muted">
          <span>Your usage</span>
          <span>
            <span className={`font-mono ${USAGE_TEXT[monitors]}`}>{billing.usage.monitors}</span> of {free.monitors}{" "}
            monitors
          </span>
          <span>
            <span className={`font-mono ${USAGE_TEXT[members]}`}>{billing.usage.members}</span> of {free.members}{" "}
            members
          </span>
        </MetaList>
        <span className="text-xs text-subtle">Everything fits in Pro with room to grow.</span>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <LinkButton size="large" to={paths.billing(orgSlug)}>
          Not now
        </LinkButton>
        <Button size="large" type="primary" onClick={onContinue}>
          Continue to payment
        </Button>
      </div>
    </div>
  );
}

export function UpgradeRedirect() {
  return <Navigate to={paths.upgrade(lastOrg().slug)} replace />;
}
