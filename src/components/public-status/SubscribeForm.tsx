import { Button } from "antd";
import { useState } from "react";
import { LuMailCheck } from "react-icons/lu";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { subscribeSchema } from "@/lib/schemas";

type SubscribeFormProps = {
  title: string;
  onSubscribe: (email: string) => Promise<void>;
};

export function SubscribeForm({ title, onSubscribe }: SubscribeFormProps) {
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: subscribeSchema,
    onSubmit: async ({ email }) => {
      await onSubscribe(email);
      setSubscribedEmail(email);
    },
  });

  if (subscribedEmail) {
    return (
      <div role="status" className="flex gap-3">
        <LuMailCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-up" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-medium">Check your inbox</p>
          <p className="text-muted">
            We sent a confirmation link to{" "}
            <span className="font-mono text-xs break-all text-ink">{subscribedEmail}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form {...formProps} className="flex flex-col gap-3">
      <CustomInput
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@company.com"
        autoFocus
        error={fieldErrors.email}
        hint={`Get an email whenever ${title} creates or updates an incident.`}
      />
      {formError && (
        <p role="alert" className="text-xs text-down">
          {formError}
        </p>
      )}
      <Button type="primary" htmlType="submit" block loading={isPending}>
        Subscribe
      </Button>
      <p className="text-xs text-subtle">We'll email you to confirm. One click to unsubscribe anytime.</p>
    </form>
  );
}
