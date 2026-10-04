import { Button } from "antd";
import { useState } from "react";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { slugify } from "@/lib/format";
import type { OnboardingDraft } from "@/lib/onboarding";
import { onboardingProjectSchema } from "@/lib/schemas";
import { StepFooter } from "./StepFooter";

type ProjectStepProps = {
  orgSlug: string;
  value: OnboardingDraft["project"];
  onChange: (value: OnboardingDraft["project"]) => void;
  onBack: () => void;
  onNext: () => void;
};

export function ProjectStep({ orgSlug, value, onChange, onBack, onNext }: ProjectStepProps) {
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const { formProps, fieldErrors, isPending } = useForm({
    schema: onboardingProjectSchema,
    onSubmit: async () => onNext(),
  });

  return (
    <form {...formProps}>
      <AuthHeading
        route={`POST /orgs/${orgSlug}/projects`}
        title="Name your first project."
        description="Projects group monitors by product or client. Most teams start with Production."
      />
      <div className="flex flex-col gap-4">
        <CustomInput
          label="Project name"
          name="name"
          autoFocus
          onFocus={(event) => event.target.select()}
          value={value.name}
          onChange={(event) =>
            onChange({ name: event.target.value, slug: isEditingSlug ? value.slug : slugify(event.target.value) })
          }
          error={fieldErrors.name}
          hint={
            !isEditingSlug &&
            !fieldErrors.slug && (
              <span className="flex items-center gap-2">
                <span className="font-mono">/projects/{value.slug || "…"}</span>
                <Button type="link" size="small" className="h-auto px-0 text-xs" onClick={() => setIsEditingSlug(true)}>
                  Edit
                </Button>
              </span>
            )
          }
        />
        {isEditingSlug || fieldErrors.slug ? (
          <CustomInput
            label="Project slug"
            name="slug"
            value={value.slug}
            onChange={(event) => onChange({ ...value, slug: event.target.value.toLowerCase() })}
            addonBefore={<span className="font-mono text-xs text-subtle">projects/</span>}
            className="font-mono"
            error={fieldErrors.slug}
          />
        ) : (
          <input type="hidden" name="slug" value={value.slug} />
        )}
      </div>
      <StepFooter continueLabel="Create project" isPending={isPending} onBack={onBack} />
    </form>
  );
}
