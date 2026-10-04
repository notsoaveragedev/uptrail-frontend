import { Button, Modal } from "antd";
import { useState } from "react";
import { useSaveSecurity } from "@/api/account";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { TickMeter } from "@/components/ui/TickMeter";
import { useConfirm } from "@/hooks/useConfirm";
import { useLazyDisclosure } from "@/hooks/useLazyDisclosure";
import { useToast } from "@/hooks/useToast";
import { BACKUP_CODE_COUNT, backupCodeFill, generateBackupCodes } from "@/lib/account";
import { formatDay } from "@/lib/format";
import { lazyComponent } from "@/lib/lazyPage";
import type { SecurityState } from "@/types/account";
import { BackupCodesPanel } from "./BackupCodesPanel";

const TwoFactorSetupModal = lazyComponent(() => import("./TwoFactorSetupModal"), "TwoFactorSetupModal");

type TwoFactorSectionProps = { security: SecurityState; email: string };

export function TwoFactorSection({ security, email }: TwoFactorSectionProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const save = useSaveSecurity();
  const setup = useLazyDisclosure();

  async function disable() {
    const isConfirmed = await confirm({
      title: "Turn off two-factor authentication?",
      description: "Anyone with your password could sign in. Confirm your password to continue.",
      confirmLabel: "Turn off 2FA",
      isDanger: true,
      requirePassword: true,
    });
    if (!isConfirmed) return;
    await save.mutateAsync({ ...security, twoFactorEnabledAt: null, backupCodesRemaining: 0 });
    toast.warning("2FA turned off", "Your backup codes no longer work.");
  }

  function enable() {
    save.mutate({ ...security, twoFactorEnabledAt: Date.now(), backupCodesRemaining: BACKUP_CODE_COUNT });
    toast.success("2FA is on", "You'll enter a code from your app when you sign in.");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 rounded-md border border-line px-3 py-2.5">
        <span className="flex flex-col items-start gap-1">
          {security.twoFactorEnabledAt ? (
            <>
              <StatusBadge status="up" label="On" />
              <span className="text-xs text-subtle">Since {formatDay(security.twoFactorEnabledAt)}</span>
            </>
          ) : (
            <>
              <StatusBadge status="paused" label="Off" />
              <span className="text-xs text-subtle">Protect your account with an authenticator app.</span>
            </>
          )}
        </span>
        {security.twoFactorEnabledAt ? (
          <Button onClick={disable}>Turn off</Button>
        ) : (
          <Button type="primary" onClick={setup.open}>
            Turn on 2FA
          </Button>
        )}
      </div>
      {security.twoFactorEnabledAt && <BackupCodesRow security={security} />}
      {setup.hasOpened && (
        <TwoFactorSetupModal open={setup.isOpen} email={email} onClose={setup.close} onEnabled={enable} />
      )}
    </div>
  );
}

function BackupCodesRow({ security }: { security: SecurityState }) {
  const toast = useToast();
  const confirm = useConfirm();
  const save = useSaveSecurity();
  const [codes, setCodes] = useState<string[] | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const remaining = security.backupCodesRemaining;

  async function regenerate() {
    const isConfirmed = await confirm({
      title: "Generate new backup codes?",
      description: "Your current codes stop working right away. Enter your password to continue.",
      confirmLabel: "Generate codes",
      isDanger: true,
      requirePassword: true,
    });
    if (!isConfirmed) return;
    await save.mutateAsync({ ...security, backupCodesRemaining: BACKUP_CODE_COUNT });
    setIsSaved(false);
    setCodes(generateBackupCodes(BACKUP_CODE_COUNT));
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-line px-3 py-2.5">
      <span className="flex flex-col gap-1.5">
        <span className="font-medium text-ink">Backup codes</span>
        <span className="flex items-center gap-2.5">
          <TickMeter
            value={remaining}
            total={BACKUP_CODE_COUNT}
            fillClassName={backupCodeFill(remaining)}
            label="Backup codes left"
          />
          <span className="font-mono text-xs text-muted">
            {remaining} of {BACKUP_CODE_COUNT} left
          </span>
        </span>
      </span>
      <Button onClick={regenerate}>Regenerate</Button>
      <Modal
        open={codes !== null}
        title="Your new backup codes"
        closable={false}
        maskClosable={false}
        width="32rem"
        footer={
          <Button
            type="primary"
            disabled={!isSaved}
            onClick={() => {
              setCodes(null);
              toast.success("New backup codes saved");
            }}
          >
            Done
          </Button>
        }
      >
        {codes && <BackupCodesPanel codes={codes} isSaved={isSaved} onSavedChange={setIsSaved} />}
      </Modal>
    </div>
  );
}
