import { Alert, Button } from "antd";
import { useNavigate } from "react-router";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { NewPasswordField } from "@/components/auth/NewPasswordField";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { fakeRequest } from "@/lib/fakeRequest";
import { signupSchema } from "@/lib/schemas";

export function SignupPage() {
  const navigate = useNavigate();

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: signupSchema,
    onSubmit: async ({ email }) => {
      await fakeRequest();
      if (email.includes("taken")) {
        setFieldErrors({ email: "An account with this email already exists." });
        return;
      }
      navigate(`/verify-email?state=sent&email=${encodeURIComponent(email)}`);
    },
  });

  return (
    <>
      <AuthHeading
        route="POST /auth/register"
        title="Start a trail."
        description="Free for 10 monitors and a public status page. No card needed."
      />
      <OAuthButtons />

      <form {...formProps} className="flex flex-col gap-4">
        <CustomInput label="Name" name="name" autoComplete="name" placeholder="Arjun Kapoor" error={fieldErrors.name} />
        <CustomInput
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={fieldErrors.email}
        />
        <NewPasswordField label="Password" error={fieldErrors.password} />

        {formError && <Alert type="error" showIcon title={formError} />}

        <Button type="primary" htmlType="submit" size="large" block loading={isPending} className="mt-2">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-xs text-subtle">
        By creating an account you agree to the Terms of Service and Privacy Policy.
      </p>
    </>
  );
}
