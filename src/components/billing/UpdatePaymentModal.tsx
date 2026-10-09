import { Alert, Button, Modal } from "antd";
import { useParams } from "react-router";
import { useSaveBilling } from "@/api/billing";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { cardLabel, isDeclinedTestCard, toPaymentMethod } from "@/lib/billing";
import { formatLongDate } from "@/lib/format";
import { paymentCardSchema } from "@/lib/schemas";
import { CardFields } from "./CardFields";

type UpdatePaymentModalProps = {
  open: boolean;
  renewsAt: number | null;
  onClose: () => void;
};

export function UpdatePaymentModal({ open, renewsAt, onClose }: UpdatePaymentModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="Update card" footer={null} destroyOnHidden width="28rem">
      <UpdatePaymentForm renewsAt={renewsAt} onClose={onClose} />
    </Modal>
  );
}

function UpdatePaymentForm({ renewsAt, onClose }: Omit<UpdatePaymentModalProps, "open">) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const save = useSaveBilling(orgSlug);

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: paymentCardSchema,
    onSubmit: async (values) => {
      if (isDeclinedTestCard(values.cardNumber)) throw new Error("Your card was declined. Try another card.");
      const paymentMethod = toPaymentMethod(values.cardNumber, values.expiry);
      await save.mutateAsync({ paymentMethod, status: "active" });
      onClose();
      toast.success(
        "Card updated",
        renewsAt
          ? `${cardLabel(paymentMethod)} will be charged on ${formatLongDate(renewsAt)}.`
          : cardLabel(paymentMethod),
      );
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CardFields errors={fieldErrors} />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Save card
        </Button>
      </div>
    </form>
  );
}
