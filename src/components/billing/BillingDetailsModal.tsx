import { Alert, Button, Modal } from "antd";
import { useParams } from "react-router";
import { useSaveBilling } from "@/api/billing";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { taxTypeFor } from "@/lib/billing";
import { billingDetailsSchema } from "@/lib/schemas";
import type { OrgBilling } from "@/types/billing";
import { CountryField } from "./CountryField";

type BillingDetailsModalProps = {
  open: boolean;
  billing: OrgBilling;
  onClose: () => void;
};

export function BillingDetailsModal({ open, billing, onClose }: BillingDetailsModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="Billing details" footer={null} destroyOnHidden width="32rem">
      <BillingDetailsForm billing={billing} onClose={onClose} />
    </Modal>
  );
}

function BillingDetailsForm({ billing, onClose }: Omit<BillingDetailsModalProps, "open">) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const save = useSaveBilling(orgSlug);
  const { address } = billing;

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: billingDetailsSchema,
    onSubmit: async ({ billingEmail, taxId, ...rest }) => {
      await save.mutateAsync({
        billingEmail,
        address: rest,
        taxId: taxId ? { type: taxTypeFor(rest.country), value: taxId.toUpperCase() } : null,
      });
      onClose();
      toast.success("Billing details saved", "They'll appear on your next invoice.");
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CustomInput
        label="Billing email"
        name="billingEmail"
        type="email"
        defaultValue={billing.billingEmail}
        hint="Invoices and payment receipts go here."
        error={fieldErrors.billingEmail}
      />
      <CustomInput
        label="Company or full name"
        name="company"
        defaultValue={address.company}
        error={fieldErrors.company}
      />
      <CustomInput label="Address" name="line1" defaultValue={address.line1} error={fieldErrors.line1} />
      <div className="grid grid-cols-2 gap-3">
        <CustomInput label="City" name="city" defaultValue={address.city} error={fieldErrors.city} />
        <CustomInput
          label="Postal code"
          name="postalCode"
          defaultValue={address.postalCode}
          error={fieldErrors.postalCode}
        />
      </div>
      <CountryField defaultValue={address.country} error={fieldErrors.country} />
      <CustomInput
        label="Tax ID"
        name="taxId"
        defaultValue={billing.taxId?.value ?? ""}
        className="font-mono"
        hint="GSTIN in India, VAT number in the EU and UK, EIN in the US. Leave empty if you don't have one."
        error={fieldErrors.taxId}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Save details
        </Button>
      </div>
    </form>
  );
}
