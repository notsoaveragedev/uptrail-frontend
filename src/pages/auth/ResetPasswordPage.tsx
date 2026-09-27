import { Alert, Button } from "antd";
import { useNavigate, useSearchParams } from "react-router";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { NewPasswordField } from "@/components/auth/NewPasswordField";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { readDemoState } from "@/lib/demoState";
import { fakeRequest } from "@/lib/fakeRequest";
import { resetPasswordSchema } from "@/lib/schemas";

const STATES = ["valid", "expired"] as const;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const state = readDemoState(searchParams, STATES, "valid");

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: resetPasswordSchema,
    onSubmit: async () => {
      await fakeRequest();
      toast.success("Password updated", "Sign in with your new password.");
      navigate("/login");
    },
  });

  if (state === "expired") {
    return (
      <AuthNotice
        tone="warning"
        route="POST /auth/reset-password · 410"
        title="This reset link has expired."
        description="Reset links last 1 hour. Request a new one to continue."
      >
        <Button type="primary" size="large" block onClick={() => navigate("/forgot-password")}>
          Request a new link
        </Button>
      </AuthNotice>
    );
  }

  return (
    <>
      <AuthHeading
        route="POST /auth/reset-password"
        title="Choose a new password."
        description="This also signs you out on every other device."
      />

      <form {...formProps} className="flex flex-col gap-4">
        <NewPasswordField label="New password" error={fieldErrors.password} />
        <CustomInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />

        {formError && <Alert type="error" showIcon title={formError} />}

        <Button type="primary" htmlType="submit" size="large" block loading={isPending} className="mt-2">
          Update password
        </Button>
      </form>
    </>
  );
}
