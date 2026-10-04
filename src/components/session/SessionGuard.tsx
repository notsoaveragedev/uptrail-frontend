import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "antd";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { LuClock, LuLock } from "react-icons/lu";
import { CustomInput } from "@/components/ui/CustomInput";
import { PersonCell } from "@/components/ui/PersonCell";
import { TickMeter } from "@/components/ui/TickMeter";
import { useForm } from "@/hooks/useForm";
import { useSessionExpiry } from "@/hooks/useSessionExpiry";
import { useToast } from "@/hooks/useToast";
import { fakeRequest } from "@/lib/fakeRequest";
import { currentPasswordSchema } from "@/lib/schemas";
import { formatCountdown, SESSION_WARNING_MS, signOut } from "@/lib/session";
import { currentUser } from "@/mocks/workspace";

const METER_TICKS = 24;

export function SessionGuard() {
  const session = useSessionExpiry();
  const isLocked = session.status === "expired" || session.status === "signedOut";
  const ticks = Math.ceil((session.remaining / SESSION_WARNING_MS) * METER_TICKS);

  return (
    <>
      <Modal
        open={session.status === "expiring"}
        closable={false}
        maskClosable={false}
        onCancel={session.extend}
        width="26rem"
        title={
          <span className="flex items-center gap-2">
            <LuClock aria-hidden className="size-4 text-degraded" />
            Still there?
          </span>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button type="text" onClick={signOut}>
              Sign out
            </Button>
            <Button type="primary" autoFocus onClick={session.extend}>
              Stay signed in
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 pt-1">
          <p className="text-muted">
            You'll be signed out in{" "}
            <span className="font-mono text-md text-ink tabular-nums">{formatCountdown(session.remaining)}</span> for
            inactivity.
          </p>
          <TickMeter
            value={ticks}
            total={METER_TICKS}
            fillClassName={session.remaining < 30_000 ? "bg-down" : "bg-degraded"}
            label="Time left in this session"
          />
        </div>
      </Modal>
      <Modal
        open={isLocked}
        closable={false}
        maskClosable={false}
        keyboard={false}
        footer={null}
        width="26rem"
        destroyOnHidden
        styles={{ mask: { backdropFilter: "blur(0.25rem)" } }}
        title={
          <span className="flex flex-col gap-1">
            <span className="font-mono text-xs font-normal text-subtle">
              {session.status === "signedOut" ? "signed out in another tab" : "401 · session expired"}
            </span>
            <span className="flex items-center gap-2">
              <LuLock aria-hidden className="size-4 text-muted" />
              Sign in to continue
            </span>
          </span>
        }
      >
        <ReloginForm onSignedIn={session.extend} onSignOut={signOut} />
      </Modal>
    </>
  );
}

function ReloginForm({ onSignedIn, onSignOut }: { onSignedIn: () => void; onSignOut: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isGooglePending, setIsGooglePending] = useState(false);

  function welcomeBack() {
    onSignedIn();
    queryClient.invalidateQueries();
    toast.success("Welcome back", "You're right where you left off.");
  }

  const { formProps, fieldErrors, isPending } = useForm({
    schema: currentPasswordSchema,
    onSubmit: async () => {
      await fakeRequest(600);
      welcomeBack();
    },
  });

  async function continueWithGoogle() {
    setIsGooglePending(true);
    await fakeRequest(600);
    setIsGooglePending(false);
    welcomeBack();
  }

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-1">
      <p className="text-muted">We kept this page open, so your unsaved changes are still here.</p>
      <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-panel px-3 py-2.5">
        <PersonCell name={currentUser.name} email={currentUser.email} />
        <button type="button" onClick={onSignOut} className="cursor-pointer text-xs text-muted hover:text-ink">
          Not you?
        </button>
      </div>
      <CustomInput
        label="Password"
        name="password"
        type="password"
        autoFocus
        autoComplete="current-password"
        error={fieldErrors.password}
      />
      <Button type="primary" size="large" htmlType="submit" loading={isPending}>
        Sign in
      </Button>
      <Button size="large" icon={<FcGoogle />} loading={isGooglePending} onClick={continueWithGoogle}>
        Continue with Google
      </Button>
    </form>
  );
}
