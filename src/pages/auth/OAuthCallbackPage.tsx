import { Alert, Button } from "antd";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { readDemoState } from "@/lib/demoState";
import { fakeRequest } from "@/lib/fakeRequest";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";
import { linkAccountSchema } from "@/lib/schemas";

const STATES = ["signing-in", "error", "link"] as const;

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = readDemoState(searchParams, STATES, "signing-in");
  const provider = searchParams.get("provider") === "google" ? "google" : "github";
  const providerName = provider === "google" ? "Google" : "GitHub";

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: linkAccountSchema,
    onSubmit: async () => {
      await fakeRequest();
      toast.success(`${providerName} linked`, `You can now sign in with ${providerName}.`);
      navigate(DEFAULT_APP_PATH);
    },
  });

  useEffect(() => {
    if (state !== "signing-in") return;
    fakeRequest(1200).then(() => navigate(DEFAULT_APP_PATH, { replace: true }));
  }, [state, navigate]);

  if (state === "error") {
    return (
      <AuthNotice
        tone="error"
        route={`GET /auth/oauth/${provider}/callback · 401`}
        title={`${providerName} didn't let us in.`}
        description="You cancelled the request, or it timed out. Nothing was changed."
      >
        <Button type="primary" size="large" block onClick={() => setSearchParams({ provider })}>
          Try again
        </Button>
        <Link to="/login" className="text-muted hover:text-ink">
          Sign in with email instead
        </Link>
      </AuthNotice>
    );
  }

  if (state === "link") {
    return (
      <AuthNotice
        tone="info"
        route={`GET /auth/oauth/${provider}/callback · 409`}
        title="You already have an account."
        description={
          <>
            <span className="text-ink">arjun@pixelcraft.io</span> signs in with a password. Enter it once to link{" "}
            {providerName}.
          </>
        }
      >
        <form {...formProps} className="flex flex-col gap-4">
          <input type="hidden" name="username" autoComplete="username" value="arjun@pixelcraft.io" />
          <CustomInput
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            error={fieldErrors.password}
          />
          {formError && <Alert type="error" showIcon title={formError} />}
          <Button type="primary" htmlType="submit" size="large" block loading={isPending}>
            Link and sign in
          </Button>
        </form>
      </AuthNotice>
    );
  }

  return (
    <AuthNotice
      tone="pending"
      route={`GET /auth/oauth/${provider}/callback`}
      title={`Signing you in with ${providerName}…`}
      description="Hang tight, we're confirming your account."
    />
  );
}
