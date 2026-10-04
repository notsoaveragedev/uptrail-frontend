import { useQuery } from "@tanstack/react-query";
import { Button, Tooltip } from "antd";
import { accountQuery, securityQuery, sessionsQuery, useRevokeSessions } from "@/api/account";
import { ConnectedAccounts } from "@/components/account/ConnectedAccounts";
import { PasswordSection } from "@/components/account/PasswordSection";
import { SessionsTable } from "@/components/account/SessionsTable";
import { TwoFactorSection } from "@/components/account/TwoFactorSection";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { plural } from "@/lib/format";
import type { AuthSession } from "@/types/account";

export function SecurityPage() {
  const { data: security } = useQuery(securityQuery);
  const { data: account } = useQuery(accountQuery);
  const { data: sessions } = useQuery(sessionsQuery);

  return (
    <>
      <title>Security · Account · Uptrail</title>
      <PageHeader level={2} title="Security" meta="Password, two-factor authentication and where you're signed in." />
      {security && account ? (
        <div className="flex flex-col">
          <SettingsSection
            title="Password"
            description="Use at least 8 characters with upper and lowercase letters and a number."
          >
            <PasswordSection security={security} />
          </SettingsSection>
          <SettingsSection
            title="Two-factor authentication"
            description="Ask for a code from your authenticator app when you sign in."
          >
            <SectionErrorBoundary>
              <TwoFactorSection security={security} email={account.email} />
            </SectionErrorBoundary>
          </SettingsSection>
          <SettingsSection title="Connected accounts" description="Sign in with these providers instead of a password.">
            <ConnectedAccounts security={security} />
          </SettingsSection>
        </div>
      ) : (
        <div aria-busy className="flex flex-col gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock key={index} isInset className="h-14" />
          ))}
        </div>
      )}
      <SessionsSection sessions={sessions} />
    </>
  );
}

function SessionsSection({ sessions }: { sessions: AuthSession[] | undefined }) {
  const toast = useToast();
  const confirm = useConfirm();
  const revoke = useRevokeSessions();
  const others = sessions?.filter((session) => !session.isCurrent) ?? [];

  async function signOutOthers() {
    const isConfirmed = await confirm({
      title: `Sign out of ${plural(others.length, "other session")}?`,
      description: "Every other device is signed out right away. This one stays signed in.",
      confirmLabel: "Sign out others",
      isDanger: true,
    });
    if (!isConfirmed) return;
    revoke.mutate(others.map((session) => session.id));
    toast.success(`Signed out of ${plural(others.length, "session")}`);
  }

  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6">
      <PageHeader
        level={2}
        title="Active sessions"
        meta="Devices signed in to your account. Sessions end after 30 minutes idle or 14 days."
        actions={
          <Tooltip title={others.length ? null : "No other active sessions"}>
            <Button disabled={!others.length} onClick={signOutOthers}>
              Sign out of all other sessions
            </Button>
          </Tooltip>
        }
      />
      <SectionErrorBoundary>
        {sessions ? (
          <SessionsTable sessions={sessions} />
        ) : (
          <TableSkeleton columns={["flex-1", "w-28", "w-24", "w-16", "w-12"]} rows={3} />
        )}
      </SectionErrorBoundary>
    </section>
  );
}
