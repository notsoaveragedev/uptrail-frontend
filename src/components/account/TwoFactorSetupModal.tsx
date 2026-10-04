import { Alert, Button, Modal, QRCode, Steps } from "antd";
import { useRef, useState } from "react";
import { OtpField } from "@/components/auth/OtpField";
import { CopyField } from "@/components/ui/CopyField";
import { useConfirm } from "@/hooks/useConfirm";
import { useForm } from "@/hooks/useForm";
import { BACKUP_CODE_COUNT, generateBackupCodes, generateTotpSecret, totpUri } from "@/lib/account";
import { fakeFailure, fakeRequest } from "@/lib/fakeRequest";
import { totpCodeSchema } from "@/lib/schemas";
import { palettes } from "@/theme/palette";
import { BackupCodesPanel } from "./BackupCodesPanel";

type TwoFactorSetupModalProps = {
  open: boolean;
  email: string;
  onClose: () => void;
  onEnabled: () => void;
};

const STEPS = [{ title: "Scan" }, { title: "Verify" }, { title: "Save codes" }];

export function TwoFactorSetupModal({ open, email, onClose, onEnabled }: TwoFactorSetupModalProps) {
  const confirm = useConfirm();
  const [step, setStep] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [secret, setSecret] = useState(generateTotpSecret);
  const [codes, setCodes] = useState(() => generateBackupCodes(BACKUP_CODE_COUNT));

  async function close() {
    if (step === 2 && !isSaved) {
      const isConfirmed = await confirm({
        title: "Close without saving your codes?",
        description: "2FA is already on. Without backup codes, losing your phone can lock you out.",
        confirmLabel: "Close anyway",
        isDanger: true,
      });
      if (!isConfirmed) return;
    }
    onClose();
  }

  function verified() {
    onEnabled();
    setStep(2);
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      title="Turn on two-factor authentication"
      footer={null}
      destroyOnHidden
      maskClosable={false}
      width="32rem"
      afterClose={() => {
        setStep(0);
        setIsSaved(false);
        setSecret(generateTotpSecret());
        setCodes(generateBackupCodes(BACKUP_CODE_COUNT));
      }}
    >
      <div className="flex flex-col gap-5 pt-2">
        <Steps size="small" current={step} items={STEPS} />
        {step === 0 && <ScanStep secret={secret} email={email} onNext={() => setStep(1)} />}
        {step === 1 && <VerifyStep onBack={() => setStep(0)} onVerified={verified} />}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Alert type="warning" showIcon title="Each code works once. This is the only time you'll see them." />
            <BackupCodesPanel codes={codes} isSaved={isSaved} onSavedChange={setIsSaved} />
            <div className="flex justify-end">
              <Button type="primary" disabled={!isSaved} onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ScanStep({ secret, email, onNext }: { secret: string; email: string; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-5">
        <div className="rounded-lg border border-line p-2" style={{ backgroundColor: palettes.light.card }}>
          <QRCode
            value={totpUri(secret, email)}
            size={152}
            bordered={false}
            color={palettes.light.ink}
            bgColor={palettes.light.card}
          />
        </div>
        <ol className="flex list-decimal flex-col gap-2 pl-4 text-muted">
          <li>Open an authenticator app like 1Password, Authy or Google Authenticator.</li>
          <li>Scan this QR code to add Uptrail.</li>
          <li>Enter the 6-digit code it shows on the next step.</li>
        </ol>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Can't scan? Enter this key instead</span>
        <CopyField value={secret} label="Setup key" />
      </div>
      <div className="flex justify-end">
        <Button type="primary" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function VerifyStep({ onBack, onVerified }: { onBack: () => void; onVerified: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: totpCodeSchema,
    onSubmit: async ({ code }) => {
      if (code === "000000") await fakeFailure("That code didn't match. Check your device's clock and try again.");
      await fakeRequest(600);
      onVerified();
    },
  });

  return (
    <form ref={formRef} {...formProps} className="flex flex-col gap-4">
      <OtpField
        error={fieldErrors.code ?? formError ?? undefined}
        onComplete={() => formRef.current?.requestSubmit()}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onBack}>Back</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Verify
        </Button>
      </div>
    </form>
  );
}
