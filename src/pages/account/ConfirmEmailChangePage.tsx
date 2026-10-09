import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "antd";
import { useEffect, useState, useTransition } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { accountQuery, emailConfirmQuery } from "@/api/account";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { useToast } from "@/hooks/useToast";
import { fakeRequest } from "@/lib/fakeRequest";
import { paths } from "@/lib/paths";
import { hasActiveSession } from "@/lib/session";

const ROUTE = "POST /account/email/confirm";

export function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const queryClient = useQueryClient();
  const [isSignedIn] = useState(hasActiveSession);
  const { data: result } = useQuery(emailConfirmQuery(token));

  useEffect(() => {
    if (result?.ok) queryClient.invalidateQueries({ queryKey: accountQuery.queryKey, exact: true });
  }, [result, queryClient]);

  return (
    <>
      <title>Confirm email change · Uptrail</title>
      <ConfirmNotice token={token} isSignedIn={isSignedIn} />
    </>
  );
}

function ConfirmNotice({ token, isSignedIn }: { token: string; isSignedIn: boolean }) {
  const { data: result } = useQuery(emailConfirmQuery(token));

  if (!result) {
    return (
      <AuthNotice
        tone="pending"
        route={ROUTE}
        title="Confirming your new email…"
        description="This only takes a moment."
      />
    );
  }

  if (result.ok) {
    return (
      <AuthNotice
        tone="success"
        route={`${ROUTE} · 200`}
        title="Your email is updated."
        description={
          <>
            You'll sign in with <span className="text-ink">{result.email}</span> from now on. We let{" "}
            {result.previousEmail} know about the change.
          </>
        }
      >
        <ContinueButton isSignedIn={isSignedIn} email={result.email} />
      </AuthNotice>
    );
  }

  if (result.reason === "already_confirmed") {
    return (
      <AuthNotice
        tone="success"
        route={`${ROUTE} · 409`}
        title="This email is already confirmed."
        description={
          <>
            <span className="text-ink">{result.email}</span> is your sign-in email. Nothing else to do.
          </>
        }
      >
        <ContinueButton isSignedIn={isSignedIn} email={result.email} />
      </AuthNotice>
    );
  }

  if (result.reason === "expired") {
    return (
      <AuthNotice
        tone="warning"
        route={`${ROUTE} · 410`}
        title="This link has expired."
        description={
          <>
            Email change links last 24 hours. Your sign-in email is still{" "}
            <span className="text-ink">{result.email}</span>.
          </>
        }
      >
        {isSignedIn ? (
          <ResendButton />
        ) : (
          <ContinueButton isSignedIn={false} email={result.email} label="Sign in to resend" />
        )}
      </AuthNotice>
    );
  }

  return (
    <AuthNotice
      tone="error"
      route={`${ROUTE} · 400`}
      title="This link isn't valid."
      description="It may have been copied incorrectly. Start the change again from your profile."
    >
      <ContinueButton isSignedIn={isSignedIn} email={result.email} label={isSignedIn ? "Go to profile" : "Sign in"} />
    </AuthNotice>
  );
}

type ContinueButtonProps = { isSignedIn: boolean; email: string; label?: string };

function ContinueButton({ isSignedIn, email, label }: ContinueButtonProps) {
  const navigate = useNavigate();
  const target = isSignedIn ? paths.account("profile") : `/login?email=${encodeURIComponent(email)}`;

  return (
    <Button type="primary" size="large" block onClick={() => navigate(target)}>
      {label ?? (isSignedIn ? "Go to your account" : "Sign in")}
    </Button>
  );
}

function ResendButton() {
  const toast = useToast();
  const [isSending, startSending] = useTransition();

  function resend() {
    startSending(async () => {
      await fakeRequest();
      toast.success("Verification email sent", "A new link is on its way. It's valid for 24 hours.");
    });
  }

  return (
    <Button type="primary" size="large" block loading={isSending} onClick={resend}>
      Send a new link
    </Button>
  );
}
