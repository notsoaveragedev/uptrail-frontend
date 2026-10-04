import { Button, Checkbox, Tooltip } from "antd";
import { useState } from "react";
import { Link } from "react-router";
import { useSaveNotificationPreferences } from "@/api/account";
import { NotificationIcon } from "@/components/notifications/NotificationIcon";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SaveBar } from "@/components/ui/SaveBar";
import { useProjectOptions } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { lastOrg } from "@/lib/currentOrg";
import { plural } from "@/lib/format";
import {
  applyPreset,
  countPreferenceChanges,
  isProjectScoped,
  LOCKED_EMAIL_TYPES,
  matchingPreset,
  NOTIFICATION_META,
  PREFERENCE_DESCRIPTIONS,
  PREFERENCE_GROUPS,
  PREFERENCE_PRESETS,
  type PreferenceChannel,
} from "@/lib/notifications";
import { paths } from "@/lib/paths";
import type { NotificationPreference } from "@/types/account";
import type { NotificationType } from "@/types/workspace";

type NotificationPreferencesFormProps = { preferences: NotificationPreference[]; email: string; timezone: string };

const CHANNELS: { key: PreferenceChannel; label: string }[] = [
  { key: "inApp", label: "In-app" },
  { key: "email", label: "Email" },
];

export function NotificationPreferencesForm({ preferences, email, timezone }: NotificationPreferencesFormProps) {
  const toast = useToast();
  const save = useSaveNotificationPreferences();
  const projectOptions = useProjectOptions(lastOrg().slug);
  const [draft, setDraft] = useState(preferences);
  const changes = countPreferenceChanges(preferences, draft);
  const preset = matchingPreset(draft);
  const guard = useUnsavedChangesGuard({
    isDirty: changes > 0,
    title: "Discard notification changes?",
    description: "Your notification preferences haven't been saved.",
  });

  function update(type: NotificationType, patch: Partial<NotificationPreference>) {
    setDraft((current) => current.map((item) => (item.type === type ? { ...item, ...patch } : item)));
  }

  function isLocked(type: NotificationType, channel: PreferenceChannel) {
    return channel === "email" && LOCKED_EMAIL_TYPES.includes(type);
  }

  function toggleColumn(channel: PreferenceChannel, isOn: boolean) {
    setDraft((current) => current.map((item) => (isLocked(item.type, channel) ? item : { ...item, [channel]: isOn })));
  }

  async function submit() {
    await save.mutateAsync(draft);
    guard.allowLeave();
    toast.success("Notification preferences saved");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Presets</span>
        {PREFERENCE_PRESETS.map((item) => (
          <Button
            key={item.key}
            size="small"
            aria-pressed={preset === item.key}
            className={preset === item.key ? "border-line-strong bg-hover" : ""}
            onClick={() => setDraft(applyPreset(draft, item.key))}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full min-w-160 border-collapse">
          <caption className="sr-only">Notification preferences by type and channel</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="px-4 py-2.5 text-caps font-semibold tracking-widest text-subtle uppercase">
                Notification
              </th>
              {CHANNELS.map((channel) => {
                const editable = draft.filter((item) => !isLocked(item.type, channel.key));
                const count = editable.filter((item) => item[channel.key]).length;
                return (
                  <th key={channel.key} scope="col" className="w-24 px-3 py-2.5 text-center">
                    <span className="inline-flex flex-col items-center gap-1 text-xs font-medium text-muted">
                      {channel.label}
                      <Checkbox
                        aria-label={`All ${channel.label.toLowerCase()} notifications`}
                        checked={count === editable.length}
                        indeterminate={count > 0 && count < editable.length}
                        onChange={(event) => toggleColumn(channel.key, event.target.checked)}
                      />
                    </span>
                  </th>
                );
              })}
              <th scope="col" className="w-56 px-4 py-2.5 text-left text-xs font-medium text-muted">
                Projects
              </th>
            </tr>
          </thead>
          {PREFERENCE_GROUPS.map((group) => (
            <tbody key={group.label}>
              <tr>
                <th
                  colSpan={4}
                  scope="colgroup"
                  className="border-b border-line bg-panel px-4 py-1.5 text-left text-caps font-semibold tracking-widest text-subtle uppercase"
                >
                  {group.label}
                </th>
              </tr>
              {group.types.map((type) => {
                const preference = draft.find((item) => item.type === type);
                if (!preference) return null;
                const label = NOTIFICATION_META[type].label;
                return (
                  <tr key={type} className="border-b border-line last:border-b-0 hover:bg-hover/60">
                    <th scope="row" className="px-4 py-2.5 text-left font-normal">
                      <span className="flex items-start gap-2.5">
                        <span className="mt-0.5">
                          <NotificationIcon type={type} />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-medium text-ink">{label}</span>
                          <span className="text-xs text-subtle">{PREFERENCE_DESCRIPTIONS[type]}</span>
                        </span>
                      </span>
                    </th>
                    {CHANNELS.map((channel) => (
                      <td key={channel.key} className="px-3 py-2.5 text-center">
                        <Tooltip title={isLocked(type, channel.key) ? "Security emails can't be turned off." : null}>
                          <Checkbox
                            aria-label={`${channel.label} for ${label}`}
                            checked={preference[channel.key]}
                            disabled={isLocked(type, channel.key)}
                            onChange={(event) => update(type, { [channel.key]: event.target.checked })}
                          />
                        </Tooltip>
                      </td>
                    ))}
                    <td className="px-4 py-2.5">
                      {isProjectScoped(type) ? (
                        <CustomSelect
                          aria-label={`Projects for ${label}`}
                          mode="multiple"
                          size="small"
                          variant="borderless"
                          maxTagCount="responsive"
                          placeholder="All projects"
                          disabled={!preference.inApp && !preference.email}
                          value={preference.projects}
                          onChange={(projects) => update(type, { projects })}
                          options={projectOptions}
                          className="-ml-2 w-full"
                        />
                      ) : (
                        <span className="text-subtle">Every organization</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
      <p className="text-xs text-subtle">
        Emails go to <span className="text-muted">{email}</span>. Times use your timezone ({timezone}),{" "}
        <Link to={paths.account("profile")}>change it in Profile</Link>.
      </p>
      <SaveBar
        isVisible={changes > 0}
        summary={plural(changes, "unsaved change")}
        isSaving={save.isPending}
        onDiscard={() => setDraft(preferences)}
        onSave={submit}
      />
    </div>
  );
}
