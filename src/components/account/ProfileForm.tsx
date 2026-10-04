import { Alert, Button, Segmented } from "antd";
import { useState, type ReactNode } from "react";
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";
import { useSaveAccount } from "@/api/account";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SaveBar } from "@/components/ui/SaveBar";
import { useForm } from "@/hooks/useForm";
import { useLazyDisclosure } from "@/hooks/useLazyDisclosure";
import { useNow } from "@/hooks/useNow";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { plural } from "@/lib/format";
import { profileSchema } from "@/lib/schemas";
import { formatInZone, localTimezone, offsetLabel, timezoneOptions } from "@/lib/timezones";
import { useThemeMode, type ThemePreference } from "@/theme/ThemeContext";
import type { Account } from "@/types/account";
import { AvatarUpload } from "./AvatarUpload";
import { ChangeEmailModal } from "./ChangeEmailModal";

const FORM_ID = "profile";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: <LuSun /> },
  { value: "dark", label: "Dark", icon: <LuMoon /> },
  { value: "system", label: "System", icon: <LuMonitor /> },
];

export function ProfileForm({ account }: { account: Account }) {
  const toast = useToast();
  const save = useSaveAccount();
  const now = useNow(30_000);
  const emailModal = useLazyDisclosure();
  const { preference, setPreference } = useThemeMode();
  const [name, setName] = useState(account.name);
  const [timezone, setTimezone] = useState(account.timezone);
  const changes = [name !== account.name, timezone !== account.timezone].filter(Boolean).length;
  const guard = useUnsavedChangesGuard({
    isDirty: changes > 0,
    title: "Discard profile changes?",
    description: "Your changes to your profile haven't been saved.",
  });

  const { formProps, fieldErrors, isPending } = useForm({
    schema: profileSchema,
    onSubmit: async (values) => {
      await save.mutateAsync({ ...account, ...values });
      guard.allowLeave();
      toast.success("Profile saved");
    },
  });

  function discard() {
    setName(account.name);
    setTimezone(account.timezone);
  }

  return (
    <div className="flex flex-col gap-2">
      <form id={FORM_ID} {...formProps} className="flex flex-col">
        <SettingsSection title="Photo" description="Shown on incidents, comments and the audit log.">
          <AvatarUpload
            name={account.name}
            avatarUrl={account.avatarUrl}
            onChange={(avatarUrl) => save.mutate({ ...account, avatarUrl })}
          />
        </SettingsSection>
        <SettingsSection title="Name" description="How teammates see you across Uptrail.">
          <CustomInput
            aria-label="Name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={fieldErrors.name}
          />
        </SettingsSection>
        <SettingsSection title="Email" description="Used to sign in and for alert emails.">
          <CustomInput
            aria-label="Email"
            value={account.email}
            readOnly
            suffix={<span className="text-xs text-up">Verified</span>}
          />
          <div>
            <Button size="small" onClick={emailModal.open}>
              Change email
            </Button>
          </div>
          {account.pendingEmail && (
            <Alert
              type="info"
              showIcon
              title={`Verify ${account.pendingEmail}`}
              description={`We sent a link. Until then you sign in with ${account.email}.`}
              action={
                <div className="flex flex-col gap-1">
                  <Button size="small" onClick={() => toast.success("Link resent", account.pendingEmail ?? "")}>
                    Resend
                  </Button>
                  <Button size="small" type="text" onClick={() => save.mutate({ ...account, pendingEmail: null })}>
                    Cancel change
                  </Button>
                </div>
              }
            />
          )}
        </SettingsSection>
        <SettingsSection title="Timezone" description="Times in the app and in emails use this.">
          <input type="hidden" name="timezone" value={timezone} />
          <CustomSelect
            aria-label="Timezone"
            showSearch
            optionFilterProp="label"
            value={timezone}
            onChange={setTimezone}
            options={timezoneOptions()}
            labelAction={
              <Button type="text" size="small" onClick={() => setTimezone(localTimezone())}>
                Detect
              </Button>
            }
            hint={
              <span>
                Now <span className="font-mono text-ink">{formatInZone(now, timezone)}</span> · {offsetLabel(timezone)}
              </span>
            }
          />
        </SettingsSection>
        <SettingsSection title="Theme" description="Applies right away on this device.">
          <Segmented
            aria-label="Theme"
            value={preference}
            onChange={setPreference}
            options={THEME_OPTIONS}
            className="w-fit"
          />
        </SettingsSection>
      </form>
      <SaveBar
        isVisible={changes > 0}
        summary={plural(changes, "unsaved change")}
        formId={FORM_ID}
        isSaving={isPending}
        onDiscard={discard}
      />
      {emailModal.hasOpened && (
        <ChangeEmailModal account={account} open={emailModal.isOpen} onClose={emailModal.close} />
      )}
    </div>
  );
}
