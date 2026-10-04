import { useState } from "react";
import { LuSlack } from "react-icons/lu";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { SwitchField } from "@/components/ui/SwitchField";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import type { OnboardingDraft } from "@/lib/onboarding";
import { onboardingAlertsSchema } from "@/lib/schemas";
import { StepFooter } from "./StepFooter";

type AlertsStepProps = {
  value: OnboardingDraft["alerts"];
  hasMonitor: boolean;
  onChange: (value: OnboardingDraft["alerts"]) => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
};

export function AlertsStep({ value, hasMonitor, onChange, onBack, onSkip, onNext }: AlertsStepProps) {
  const [isSlackOn, setIsSlackOn] = useState(Boolean(value.slackUrl));
  const { formProps, fieldErrors, isPending } = useForm({
    schema: onboardingAlertsSchema,
    onSubmit: async () => onNext(),
  });

  function toggleSlack(isOn: boolean) {
    setIsSlackOn(isOn);
    if (!isOn) onChange({ ...value, slackUrl: "" });
  }

  return (
    <form {...formProps}>
      <AuthHeading
        route="POST /alerts/channels"
        title="Where should alerts go?"
        description={
          hasMonitor
            ? "When your monitor fails twice in a row, we'll send it here."
            : "We'll use this for every new monitor."
        }
      />
      <div className="flex flex-col gap-4">
        <CustomInput
          label="Email"
          name="email"
          type="email"
          value={value.email}
          onChange={(event) => onChange({ ...value, email: event.target.value })}
          error={fieldErrors.email}
        />
        <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
          <SwitchField
            name="isSlackOn"
            icon={<LuSlack aria-hidden className="size-3.5 text-subtle" />}
            label="Also send to Slack"
            hint="Post alerts in a channel with an incoming webhook."
            checked={isSlackOn}
            onChange={toggleSlack}
          />
          {isSlackOn ? (
            <CustomInput
              aria-label="Slack webhook URL"
              name="slackUrl"
              size="middle"
              placeholder="https://hooks.slack.com/services/…"
              value={value.slackUrl}
              onChange={(event) => onChange({ ...value, slackUrl: event.target.value })}
              error={fieldErrors.slackUrl}
              className="font-mono"
            />
          ) : (
            <input type="hidden" name="slackUrl" value="" />
          )}
        </div>
      </div>
      <StepFooter continueLabel="Save channel" isPending={isPending} onBack={onBack} onSkip={onSkip} />
    </form>
  );
}
