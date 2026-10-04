import { Alert, Button, Checkbox } from "antd";
import { useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { OtpField } from "@/components/auth/OtpField";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { fakeFailure, fakeRequest } from "@/lib/fakeRequest";
import { safeRedirect } from "@/lib/safeRedirect";
import { backupCodeSchema, twoFactorSchema } from "@/lib/schemas";
import { startSession } from "@/lib/session";

export function TwoFactorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = (useLocation().state as { email?: string } | null)?.email ?? "arjun@pixelcraft.io";
  const [isBackupCode, setIsBackupCode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: isBackupCode ? backupCodeSchema : twoFactorSchema,
    onSubmit: async ({ code }) => {
      if (code === "000000") await fakeFailure("That code didn't match. Codes refresh every 30 seconds.");
      await fakeRequest();
      startSession();
      navigate(safeRedirect(searchParams.get("next")));
    },
  });

  return (
    <>
      <AuthHeading
        route="POST /auth/login/2fa"
        title="One more check."
        autoFocus={false}
        description={
          <>
            Enter the 6-digit code from your authenticator app for <span className="text-ink">{email}</span>.
          </>
        }
      />

      <form ref={formRef} {...formProps} className="flex flex-col gap-4">
        {isBackupCode ? (
          <CustomInput
            label="Backup code"
            name="code"
            autoComplete="one-time-code"
            placeholder="7F3K-9QXA"
            autoFocus
            error={fieldErrors.code}
          />
        ) : (
          <OtpField error={fieldErrors.code} onComplete={() => formRef.current?.requestSubmit()} />
        )}

        <Checkbox name="rememberDevice">Trust this device for 30 days</Checkbox>

        {formError && <Alert type="error" showIcon title={formError} />}

        <Button type="primary" htmlType="submit" size="large" block loading={isPending} className="mt-2">
          Verify
        </Button>
      </form>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setIsBackupCode((current) => !current)}
          className="cursor-pointer text-muted hover:text-ink"
        >
          {isBackupCode ? "Use authenticator code" : "Use a backup code"}
        </button>
        <Link to="/login" className="text-muted hover:text-ink">
          Back to sign in
        </Link>
      </div>
    </>
  );
}
