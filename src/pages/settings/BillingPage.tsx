import { useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { Suspense } from "react";
import { useParams } from "react-router";
import { billingQuery, invoicesQuery, useSaveBilling } from "@/api/billing";
import { BillingDetailsList } from "@/components/billing/BillingDetailsList";
import { CancelPlanZone } from "@/components/billing/CancelPlanZone";
import { InvoicesTable } from "@/components/billing/InvoicesTable";
import { PaymentMethodRow } from "@/components/billing/PaymentMethodRow";
import { PlanSummary } from "@/components/billing/PlanSummary";
import { UsageList } from "@/components/billing/UsageList";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useConfirm } from "@/hooks/useConfirm";
import { useLazyDisclosure } from "@/hooks/useLazyDisclosure";
import { usePermission } from "@/hooks/usePermission";
import { useToast } from "@/hooks/useToast";
import { formatCents, limitWarning, sortInvoices } from "@/lib/billing";
import { findOrganization } from "@/lib/currentOrg";
import { DAY_MS } from "@/lib/dates";
import { formatLongDate } from "@/lib/format";
import { lazyComponent } from "@/lib/lazyPage";
import { paths } from "@/lib/paths";
import { PRO_PRICE_CENTS } from "@/lib/plans";
import type { OrgBilling } from "@/types/billing";

const UpdatePaymentModal = lazyComponent(() => import("@/components/billing/UpdatePaymentModal"), "UpdatePaymentModal");
const BillingDetailsModal = lazyComponent(
  () => import("@/components/billing/BillingDetailsModal"),
  "BillingDetailsModal",
);

const INVOICE_COLUMNS = ["w-28", "w-24", "w-32", "w-16", "w-14"];

export function BillingPage() {
  const { orgSlug = "" } = useParams();
  const { data: billing } = useQuery(billingQuery(orgSlug));

  return (
    <>
      <title>Usage & billing · Settings · Uptrail</title>
      <PageHeader level={2} title="Usage & billing" meta="Your plan, what you're using and how you pay." />
      {billing ? <BillingSections billing={billing} orgName={findOrganization(orgSlug).name} /> : <BillingSkeleton />}
    </>
  );
}

function BillingSections({ billing, orgName }: { billing: OrgBilling; orgName: string }) {
  const { orgSlug = "" } = useParams();
  const { data: invoices } = useQuery(invoicesQuery(orgSlug));
  const canManage = usePermission("billing:manage").allowed;
  const save = useSaveBilling(orgSlug);
  const confirm = useConfirm();
  const toast = useToast();
  const payment = useLazyDisclosure();
  const details = useLazyDisclosure();
  const warning = limitWarning(billing);

  async function switchCycle() {
    const next = billing.cycle === "yearly" ? "monthly" : "yearly";
    const isConfirmed = await confirm({
      title: `Switch to ${next} billing?`,
      description:
        next === "yearly"
          ? `You'll pay ${formatCents(PRO_PRICE_CENTS.yearly)} today for 12 months, minus what's left of this month. That's 2 months free.`
          : `You'll pay ${formatCents(PRO_PRICE_CENTS.monthly)} a month from your next renewal. Your yearly plan runs until then.`,
      confirmLabel: `Switch to ${next}`,
    });
    if (!isConfirmed) return;
    const renewsAt = next === "yearly" ? Date.now() + 365 * DAY_MS : billing.renewsAt;
    await save.mutateAsync({ cycle: next, renewsAt });
    toast.success(
      `Switched to ${next} billing`,
      renewsAt ? `Your next renewal is ${formatLongDate(renewsAt)}.` : undefined,
    );
  }

  async function resume() {
    await save.mutateAsync({ status: "active" });
    toast.success(
      "Pro resumed",
      billing.renewsAt ? `Your plan renews on ${formatLongDate(billing.renewsAt)}.` : undefined,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {warning && (
        <Alert
          type={warning.level === "at" ? "error" : "warning"}
          showIcon
          title={warning.title}
          description={warning.description}
          action={
            canManage && (
              <LinkButton size="small" to={paths.upgrade(orgSlug)}>
                Upgrade to Pro
              </LinkButton>
            )
          }
        />
      )}
      <div className="flex flex-col">
        <SettingsSection title="Plan" description="What your organization pays for.">
          <PlanSummary billing={billing} onSwitchCycle={switchCycle} onResume={resume} onUpdateCard={payment.open} />
        </SettingsSection>
        <SettingsSection title="Usage" description="Live counts against your plan's limits.">
          <SectionErrorBoundary>
            <UsageList billing={billing} />
          </SectionErrorBoundary>
        </SettingsSection>
        <SettingsSection title="Payment method" description="Charged on each renewal.">
          <PaymentMethodRow method={billing.paymentMethod} onUpdate={payment.open} />
        </SettingsSection>
        <SettingsSection title="Billing details" description="Shown on every invoice.">
          <BillingDetailsList billing={billing} onEdit={details.open} />
        </SettingsSection>
        <SettingsSection title="Invoices" description="Every charge, newest first.">
          <SectionErrorBoundary>
            {invoices ? (
              <InvoicesTable invoices={sortInvoices(invoices)} />
            ) : (
              <TableSkeleton columns={INVOICE_COLUMNS} rows={4} />
            )}
          </SectionErrorBoundary>
        </SettingsSection>
        {billing.plan === "pro" && billing.status !== "canceling" && (
          <SettingsSection title="Danger zone" description="Changes to your subscription.">
            <CancelPlanZone billing={billing} orgName={orgName} />
          </SettingsSection>
        )}
      </div>
      <Suspense fallback={null}>
        {payment.hasOpened && (
          <UpdatePaymentModal open={payment.isOpen} renewsAt={billing.renewsAt} onClose={payment.close} />
        )}
        {details.hasOpened && <BillingDetailsModal open={details.isOpen} billing={billing} onClose={details.close} />}
      </Suspense>
    </div>
  );
}

function BillingSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      {["h-28", "h-48", "h-16", "h-32", "h-56"].map((height, index) => (
        <SkeletonBlock key={index} isInset className={height} />
      ))}
    </div>
  );
}
