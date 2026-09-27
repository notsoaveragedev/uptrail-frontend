import { Alert, Button } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { fakeFailure, fakeRequest } from "@/lib/fakeRequest";
import { safeRedirect } from "@/lib/safeRedirect";
import { loginSchema } from "@/lib/schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: loginSchema,
    onSubmit: async ({ email, password }) => {
      if (password === "wrong") await fakeFailure("That email and password don't match.");
      await fakeRequest();
      if (email.includes("2fa")) {
        navigate({ pathname: "/login/2fa", search: searchParams.toString() }, { state: { email } });
        return;
      }
      navigate(safeRedirect(searchParams.get("next")));
    },
  });

  return (
    <>
      <AuthHeading
        route="POST /auth/login"
        title="Pick up the trail."
        description="Sign in to see what your monitors saw."
      />
      <OAuthButtons />

      <form {...formProps} className="flex flex-col gap-4">
        <CustomInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={fieldErrors.email}
        />
        <CustomInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={fieldErrors.password}
          labelAction={
            <Link to="/forgot-password" className="text-muted hover:text-ink">
              Forgot password?
            </Link>
          }
        />

        {formError && <Alert type="error" showIcon title={formError} />}

        <Button type="primary" htmlType="submit" size="large" block loading={isPending} className="mt-2">
          Sign in
        </Button>
      </form>
    </>
  );
}
