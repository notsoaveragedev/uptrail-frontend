import { Alert } from "antd";
import { useState } from "react";
import { useParams } from "react-router";
import { useSaveOrgSettings } from "@/api/org";
import { LogoUpload } from "@/components/status-pages/LogoUpload";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SaveBar } from "@/components/ui/SaveBar";
import { useForm } from "@/hooks/useForm";
import { useNow } from "@/hooks/useNow";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { orgSettingsSchema } from "@/lib/schemas";
import { formatInZone, timezoneOptions } from "@/lib/timezones";
import type { OrgSettings } from "@/types/workspace";
import { OrgDangerZone } from "./OrgDangerZone";
import { SettingsSection } from "./SettingsSection";
import { SlugField } from "./SlugField";
import { plural } from "@/lib/format";

const FORM_ID = "org-settings";

export function GeneralSettingsForm({ settings }: { settings: OrgSettings }) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const save = useSaveOrgSettings(orgSlug);
  const now = useNow(30_000);
  const [draft, setDraft] = useState(settings);
  const changes = (Object.keys(settings) as (keyof OrgSettings)[]).filter((key) => draft[key] !== settings[key]);
  const guard = useUnsavedChangesGuard({
    isDirty: changes.length > 0,
    title: "Discard unsaved settings?",
    description: "Your changes to the organization settings will be lost.",
  });

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: orgSettingsSchema,
    onSubmit: async (values) => {
      const next = { ...draft, ...values };
      await save.mutateAsync(next);
      setDraft(next);
      toast.success(
        "Settings saved",
        values.slug !== settings.slug ? `New address: uptrail.app/o/${values.slug}` : undefined,
      );
      guard.allowLeave();
    },
  });

  function update<Key extends keyof OrgSettings>(key: Key, value: OrgSettings[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-2">
      <form id={FORM_ID} {...formProps} className="flex flex-col">
        {formError && <Alert type="error" showIcon title={formError} className="mb-4" />}
        <SettingsSection title="Organization name" description="Shown in the sidebar, emails and invitations.">
          <CustomInput
            aria-label="Organization name"
            name="name"
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            error={fieldErrors.name}
          />
        </SettingsSection>
        <SettingsSection title="Address" description="The slug in every app URL for this organization.">
          <SlugField
            value={draft.slug}
            currentSlug={settings.slug}
            error={fieldErrors.slug}
            onChange={(slug) => update("slug", slug)}
          />
        </SettingsSection>
        <SettingsSection
          title="Logo"
          description="Square SVG or PNG, at least 128 px. Shown in the sidebar and emails."
        >
          <LogoUpload
            title={draft.name}
            logoUrl={draft.logoUrl}
            color="var(--accent)"
            onChange={(logoUrl) => update("logoUrl", logoUrl)}
          />
        </SettingsSection>
        <SettingsSection
          title="Default timezone"
          description="Used for maintenance windows, reports and the dates in emails."
        >
          <input type="hidden" name="timezone" value={draft.timezone} />
          <CustomSelect
            aria-label="Default timezone"
            showSearch
            optionFilterProp="label"
            value={draft.timezone}
            onChange={(timezone) => update("timezone", timezone)}
            options={timezoneOptions()}
            hint={
              <span>
                It's <span className="font-mono text-ink">{formatInZone(now, draft.timezone)}</span> there now
              </span>
            }
          />
        </SettingsSection>
        <SettingsSection title="Danger zone" description="Irreversible actions for the whole organization.">
          <OrgDangerZone orgName={settings.name} orgSlug={settings.slug} />
        </SettingsSection>
      </form>
      <SaveBar
        isVisible={changes.length > 0}
        summary={plural(changes.length, "unsaved change")}
        formId={FORM_ID}
        isSaving={isPending}
        onDiscard={() => setDraft(settings)}
      />
    </div>
  );
}
