import { Alert, Button } from "antd";
import { useState } from "react";
import { Link } from "react-router";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { fakeRequest } from "@/lib/fakeRequest";
import { forgotPasswordSchema } from "@/lib/schemas";

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: forgotPasswordSchema,
    onSubmit: async ({ email }) => {
      await fakeRequest();
      setSentTo(email);
    },
  });

  if (sentTo) {
    return (
      <AuthNotice
        tone="info"
        route="POST /auth/forgot-password · 200"
        title="Check your inbox."
        description={
          <>
            If an account exists for <span className="text-ink">{sentTo}</span>, a reset link is on its way. It expires
            in 1 hour.
          </>
        }
      >
        <Link to="/login" className="text-muted hover:text-ink">
          Back to sign in
        </Link>
      </AuthNotice>
    );
  }

  return (
    <>
      <AuthHeading
        route="POST /auth/forgot-password"
        title="Reset your password."
        description="Enter your email and we'll send you a reset link."
      />

      <form {...formProps} className="flex flex-col gap-4">
        <CustomInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={fieldErrors.email}
        />

        {formError && <Alert type="error" showIcon title={formError} />}

        <Button type="primary" htmlType="submit" size="large" block loading={isPending} className="mt-2">
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="mt-6 inline-block text-muted hover:text-ink">
        Back to sign in
      </Link>
    </>
  );
}
