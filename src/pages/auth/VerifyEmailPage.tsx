import { Button } from "antd";
import { useEffect, useTransition } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { useToast } from "@/hooks/useToast";
import { fakeRequest } from "@/lib/fakeRequest";
import { readEnum } from "@/lib/searchParams";
import { startSession } from "@/lib/session";

const STATES = ["verifying", "sent", "success", "expired"] as const;

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = readEnum(searchParams, "state", STATES, "verifying");
  const email = searchParams.get("email") ?? "arjun@pixelcraft.io";
  const [isSending, startSending] = useTransition();

  useEffect(() => {
    if (state !== "verifying") return;
    let isCancelled = false;
    fakeRequest(1200).then(() => {
      if (!isCancelled) setSearchParams({ state: "success" }, { replace: true });
    });
    return () => {
      isCancelled = true;
    };
  }, [state, setSearchParams]);

  function resend() {
    startSending(async () => {
      await fakeRequest();
      toast.success("Verification email sent", `A new link is on its way to ${email}.`);
    });
  }

  if (state === "verifying") {
    return (
      <AuthNotice
        tone="pending"
        route="POST /auth/verify-email"
        title="Checking your link…"
        description="This only takes a moment."
      />
    );
  }

  if (state === "sent") {
    return (
      <AuthNotice
        tone="info"
        route="POST /auth/register · 201"
        title="Check your inbox."
        description={
          <>
            We sent a verification link to <span className="text-ink">{email}</span>. It expires in 24 hours.
          </>
        }
      >
        <Button size="large" block loading={isSending} onClick={resend}>
          Resend email
        </Button>
        <Link to="/signup" className="text-muted hover:text-ink">
          Wrong address? Sign up again
        </Link>
      </AuthNotice>
    );
  }

  if (state === "expired") {
    return (
      <AuthNotice
        tone="warning"
        route="POST /auth/verify-email · 410"
        title="This link has expired."
        description="Verification links last 24 hours. We'll send you a fresh one."
      >
        <Button type="primary" size="large" block loading={isSending} onClick={resend}>
          Send a new link
        </Button>
      </AuthNotice>
    );
  }

  return (
    <AuthNotice
      tone="success"
      route="POST /auth/verify-email · 200"
      title="You're verified."
      description="Your email is confirmed. Let's add your first monitor."
    >
      <Button
        type="primary"
        size="large"
        block
        onClick={() => {
          startSession();
          navigate("/onboarding");
        }}
      >
        Set up your workspace
      </Button>
    </AuthNotice>
  );
}
