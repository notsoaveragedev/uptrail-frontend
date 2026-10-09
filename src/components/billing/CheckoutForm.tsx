import { Alert, Button } from "antd";
import { LuLock } from "react-icons/lu";
import { useParams } from "react-router";
import { useUpgradePlan } from "@/api/billing";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { formatCents, isDeclinedTestCard, toPaymentMethod } from "@/lib/billing";
import { PRO_PRICE_CENTS } from "@/lib/plans";
import { checkoutSchema } from "@/lib/schemas";
import type { BillingCycle, OrgBilling } from "@/types/billing";
import { CardFields } from "./CardFields";
import { CountryField } from "./CountryField";

type CheckoutFormProps = {
  billing: OrgBilling;
  cycle: BillingCycle;
  onBack: () => void;
  onPaid: (invoiceNumber: string) => void;
};

export function CheckoutForm({ billing, cycle, onBack, onPaid }: CheckoutFormProps) {
  const { orgSlug = "" } = useParams();
  const upgrade = useUpgradePlan(orgSlug);

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: checkoutSchema,
    onSubmit: async (values) => {
      if (isDeclinedTestCard(values.cardNumber)) {
        throw new Error("Your card was declined. Try another card or contact your bank.");
      }
      const { invoice } = await upgrade.mutateAsync({
        cycle,
        paymentMethod: toPaymentMethod(values.cardNumber, values.expiry),
      });
      onPaid(invoice.number);
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-5">
      {formError && <Alert type="error" showIcon title={formError} />}
      <section className="flex flex-col gap-4">
        <h2 className="text-md font-semibold">Card</h2>
        <CardFields errors={fieldErrors} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-md font-semibold">Billing details</h2>
        <CustomInput
          label="Billing email"
          name="billingEmail"
          type="email"
          defaultValue={billing.billingEmail}
          hint="Receipts and invoices go here."
          error={fieldErrors.billingEmail}
        />
        <CountryField defaultValue={billing.address.country} error={fieldErrors.country} />
      </section>
      <p className="flex items-center gap-2 text-xs text-muted">
        <LuLock aria-hidden className="size-3.5" />
        Card details go straight to our payment processor. Uptrail never stores them.
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button size="large" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button type="primary" size="large" htmlType="submit" loading={isPending}>
          {isPending ? "Processing payment…" : `Pay ${formatCents(PRO_PRICE_CENTS[cycle])}`}
        </Button>
      </div>
    </form>
  );
}
