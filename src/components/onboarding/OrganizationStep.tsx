import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "antd";
import { useState } from "react";
import { slugAvailabilityQuery } from "@/api/org";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { SlugField } from "@/components/settings/SlugField";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { slugify } from "@/lib/format";
import type { OnboardingDraft } from "@/lib/onboarding";
import { createOrganizationSchema } from "@/lib/schemas";
import { StepFooter } from "./StepFooter";

type OrganizationStepProps = {
  value: OnboardingDraft["organization"];
  onChange: (value: OnboardingDraft["organization"]) => void;
  onNext: () => void;
};

export function OrganizationStep({ value, onChange, onNext }: OrganizationStepProps) {
  const queryClient = useQueryClient();
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(value.slug && value.slug !== slugify(value.name)));

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: createOrganizationSchema,
    onSubmit: async (values) => {
      if (!(await queryClient.fetchQuery(slugAvailabilityQuery(values.slug, "")))) {
        setFieldErrors({ slug: `${values.slug} is taken. Try ${values.slug}-hq.` });
        return;
      }
      onNext();
    },
  });

  return (
    <form {...formProps}>
      <AuthHeading
        route="POST /orgs"
        title="Name your workspace."
        description="Your team, monitors and status pages live here. You can rename it later."
      />
      <div className="flex flex-col gap-4">
        {formError && <Alert type="error" showIcon title={formError} />}
        <CustomInput
          label="Organization name"
          name="name"
          autoFocus
          placeholder="Acme Labs"
          value={value.name}
          onChange={(event) =>
            onChange({
              name: event.target.value,
              slug: isSlugEdited ? value.slug : slugify(event.target.value),
            })
          }
          error={fieldErrors.name}
        />
        <SlugField
          value={value.slug}
          currentSlug=""
          isNew
          error={fieldErrors.slug}
          onChange={(slug) => {
            setIsSlugEdited(true);
            onChange({ ...value, slug });
          }}
        />
      </div>
      <StepFooter continueLabel="Create organization" isPending={isPending} />
    </form>
  );
}
