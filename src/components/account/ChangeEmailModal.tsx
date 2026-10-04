import { Alert, Button, Modal } from "antd";
import { useSaveAccount } from "@/api/account";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { changeEmailSchema } from "@/lib/schemas";
import type { Account } from "@/types/account";

type ChangeEmailModalProps = { account: Account; open: boolean; onClose: () => void };

export function ChangeEmailModal({ account, open, onClose }: ChangeEmailModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="Change email" footer={null} destroyOnHidden width="28rem">
      <ChangeEmailForm account={account} onClose={onClose} />
    </Modal>
  );
}

function ChangeEmailForm({ account, onClose }: { account: Account; onClose: () => void }) {
  const toast = useToast();
  const save = useSaveAccount();

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: changeEmailSchema,
    onSubmit: async (values) => {
      if (values.email === account.email) {
        setFieldErrors({ email: "That's already your email." });
        return;
      }
      await save.mutateAsync({ ...account, pendingEmail: values.email });
      onClose();
      toast.success("Check your inbox", `We sent a verification link to ${values.email}.`);
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <p className="text-muted">
        You'll keep signing in with <span className="text-ink">{account.email}</span> until you verify the new address.
      </p>
      <CustomInput label="New email" name="email" type="email" autoFocus error={fieldErrors.email} />
      <CustomInput
        label="Current password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={fieldErrors.password}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Send verification link
        </Button>
      </div>
    </form>
  );
}
