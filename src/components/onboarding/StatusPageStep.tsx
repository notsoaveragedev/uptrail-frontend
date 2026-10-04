import { LuGlobe } from "react-icons/lu";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { SwitchField } from "@/components/ui/SwitchField";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import type { OnboardingDraft } from "@/lib/onboarding";
import { onboardingStatusPageSchema } from "@/lib/schemas";
import { StepFooter } from "./StepFooter";

type StatusPageStepProps = {
  value: OnboardingDraft["statusPage"];
  isFinishing: boolean;
  onChange: (value: OnboardingDraft["statusPage"]) => void;
  onBack: () => void;
  onFinish: () => void;
};

export function StatusPageStep({ value, isFinishing, onChange, onBack, onFinish }: StatusPageStepProps) {
  const { formProps, fieldErrors } = useForm({
    schema: onboardingStatusPageSchema,
    onSubmit: async () => onFinish(),
  });

  return (
    <form {...formProps}>
      <AuthHeading
        route="POST /status-pages"
        title="Want a public status page?"
        description="Show your users what's up and what's down. Served from a CDN, free on every plan."
      />
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-line p-4">
          <SwitchField
            name="isEnabled"
            icon={<LuGlobe aria-hidden className="size-3.5 text-subtle" />}
            label="Publish a status page"
            hint="You can design it later. It starts as a draft only you can see."
            checked={value.isEnabled}
            onChange={(isEnabled) => onChange({ ...value, isEnabled })}
          />
        </div>
        {!value.isEnabled && (
          <>
            <input type="hidden" name="title" value="" />
            <input type="hidden" name="slug" value="" />
          </>
        )}
        {value.isEnabled && (
          <>
            <CustomInput
              label="Title"
              name="title"
              value={value.title}
              onChange={(event) => onChange({ ...value, isCustomized: true, title: event.target.value })}
              error={fieldErrors.title}
            />
            <CustomInput
              label="Address"
              name="slug"
              value={value.slug}
              onChange={(event) => onChange({ ...value, isCustomized: true, slug: event.target.value.toLowerCase() })}
              addonBefore={<span className="font-mono text-xs text-subtle">uptrail.app/status/</span>}
              className="font-mono"
              error={fieldErrors.slug}
            />
          </>
        )}
      </div>
      <StepFooter continueLabel="Finish setup" isPending={isFinishing} onBack={onBack} />
    </form>
  );
}
