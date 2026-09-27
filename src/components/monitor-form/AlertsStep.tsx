import { Checkbox, Switch } from "antd";
import { useId } from "react";
import type { IconType } from "react-icons";
import { LuHash, LuMail, LuWebhook } from "react-icons/lu";
import { FieldShell } from "@/components/ui/FieldShell";
import { toggleItem } from "@/lib/list";
import { alertRuleFor, CHANNELS, type ChannelId, type MonitorFieldProps } from "@/lib/monitorForm";

const CHANNEL_ICONS: Record<ChannelId, IconType> = { email: LuMail, slack: LuHash, discord: LuWebhook };

export function AlertsStep({ values, errors, onChange }: MonitorFieldProps) {
  const switchId = useId();
  const channelsLabelId = useId();
  const channelsMessageId = useId();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <div className="flex items-start gap-3">
          <Switch
            id={switchId}
            checked={values.createAlertRule}
            onChange={(createAlertRule) => onChange({ createAlertRule })}
          />
          <div className="flex flex-col">
            <label htmlFor={switchId} className="cursor-pointer font-medium text-ink">
              Create default alert rule
            </label>
            <span className="text-xs text-muted">Opens an incident and notifies the channels below.</span>
          </div>
        </div>
        {values.createAlertRule && (
          <code className="rounded-md border border-line bg-canvas px-3 py-2.5 font-mono text-xs text-ink">
            <span className="text-subtle">when </span>
            {alertRuleFor(values)}
          </code>
        )}
      </div>

      {values.createAlertRule ? (
        <FieldShell label="Notify" labelId={channelsLabelId} error={errors.channels} messageId={channelsMessageId}>
          <div
            role="group"
            aria-labelledby={channelsLabelId}
            aria-describedby={errors.channels ? channelsMessageId : undefined}
            className="flex flex-col divide-y divide-line rounded-lg border border-line"
          >
            {CHANNELS.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.id];
              return (
                <label key={channel.id} className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-hover">
                  <Checkbox
                    checked={values.channels.includes(channel.id)}
                    onChange={() => onChange({ channels: toggleItem(values.channels, channel.id) })}
                  />
                  <Icon aria-hidden className="size-4 text-muted" />
                  <span className="flex flex-col">
                    <span className="font-medium text-ink">{channel.label}</span>
                    <span className="text-xs text-muted">{channel.detail}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </FieldShell>
      ) : (
        <p className="text-muted">This monitor won't alert anyone. You can attach rules later from the Alerts page.</p>
      )}
    </div>
  );
}
