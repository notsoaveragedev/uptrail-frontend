import { Button, Tag } from "antd";
import { useTransition } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { fakeRequest } from "@/lib/fakeRequest";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";
import { readEnum } from "@/lib/searchParams";
import { startSession } from "@/lib/session";

const STATES = ["valid", "signed-out", "expired", "revoked", "member", "mismatch"] as const;

export function InvitePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const state = readEnum(searchParams, "state", STATES, "valid");
  const [isAccepting, startAccepting] = useTransition();
  const next = encodeURIComponent(`/invite/${token}`);
  const route = `POST /invites/${token}/accept`;

  function accept() {
    startAccepting(async () => {
      await fakeRequest();
      toast.success("You joined Pixelcraft Studio", "You're an Editor in 3 projects.");
      startSession();
      navigate(DEFAULT_APP_PATH);
    });
  }

  async function decline() {
    const isConfirmed = await confirm({
      title: "Decline this invite?",
      description: "You'll need a new invite from Meera Iyer to join Pixelcraft Studio later.",
      confirmLabel: "Decline invite",
      isDanger: true,
    });
    if (!isConfirmed) return;
    toast.info("Invite declined", "Meera Iyer will be notified.");
    navigate("/login");
  }

  async function switchAccount() {
    const isConfirmed = await confirm({
      title: "Sign out and switch accounts?",
      description: "You'll sign in again as arjun@pixelcraft.io to accept this invite.",
      confirmLabel: "Sign out",
    });
    if (isConfirmed) navigate(`/login?next=${next}`);
  }

  if (state === "expired") {
    return (
      <AuthNotice
        tone="warning"
        route={`${route} · 410`}
        title="This invite has expired."
        description="It expired on Sep 20. Ask Meera Iyer to send you a new one."
      />
    );
  }

  if (state === "revoked") {
    return (
      <AuthNotice
        tone="error"
        route={`${route} · 404`}
        title="This invite was withdrawn."
        description="Meera Iyer cancelled it. Reach out to them if you think this is a mistake."
      />
    );
  }

  if (state === "member") {
    return (
      <AuthNotice
        tone="success"
        route={`${route} · 409`}
        title="You're already in Pixelcraft Studio."
        description="This invite was for an account that's already a member."
      >
        <Button type="primary" size="large" block onClick={() => navigate(DEFAULT_APP_PATH)}>
          Open Pixelcraft Studio
        </Button>
      </AuthNotice>
    );
  }

  if (state === "mismatch") {
    return (
      <AuthNotice
        tone="warning"
        route={`${route} · 403`}
        title="This invite is for another email."
        description={
          <>
            It was sent to <span className="text-ink">arjun@pixelcraft.io</span>, but you're signed in as{" "}
            <span className="text-ink">arjun.k@gmail.com</span>.
          </>
        }
      >
        <Button type="primary" size="large" block onClick={switchAccount}>
          Switch account
        </Button>
      </AuthNotice>
    );
  }

  return (
    <>
      <AuthHeading
        route={route}
        title="Join Pixelcraft Studio on Uptrail."
        description="Meera Iyer invited you to their team."
      />

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-line bg-card p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent font-semibold text-on-accent">
          PS
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">Pixelcraft Studio</span>
          <span className="font-mono text-xs text-subtle">3 projects · 42 monitors</span>
        </div>
        <Tag className="m-0">Editor</Tag>
      </div>

      {state === "signed-out" ? (
        <div className="flex flex-col gap-3">
          <Button type="primary" size="large" block onClick={() => navigate(`/signup?next=${next}`)}>
            Sign up to join
          </Button>
          <Button size="large" block onClick={() => navigate(`/login?next=${next}`)}>
            I have an account
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Button type="primary" size="large" block loading={isAccepting} onClick={accept}>
            Accept invite
          </Button>
          <Button size="large" block onClick={decline}>
            Decline
          </Button>
        </div>
      )}
    </>
  );
}
