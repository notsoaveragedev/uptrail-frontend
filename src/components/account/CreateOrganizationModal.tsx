import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Modal } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useSaveAccountOrganization } from "@/api/account";
import { slugAvailabilityQuery } from "@/api/org";
import { SlugField } from "@/components/settings/SlugField";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { newOrganization } from "@/lib/account";
import { slugify } from "@/lib/format";
import { paths } from "@/lib/paths";
import { createOrganizationSchema } from "@/lib/schemas";

type CreateOrganizationModalProps = { open: boolean; onClose: () => void };

export function CreateOrganizationModal({ open, onClose }: CreateOrganizationModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="New organization" footer={null} destroyOnHidden width="32rem">
      <CreateOrganizationForm onClose={onClose} />
    </Modal>
  );
}

function CreateOrganizationForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const save = useSaveAccountOrganization();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: createOrganizationSchema,
    onSubmit: async (values) => {
      if (!(await queryClient.fetchQuery(slugAvailabilityQuery(values.slug, "")))) {
        setFieldErrors({ slug: `${values.slug} is taken. Try ${values.slug}-2.` });
        return;
      }
      await save.mutateAsync(newOrganization(values.name, values.slug));
      onClose();
      toast.success(`${values.name} created`, "You're its owner. Invite your team from Settings.", {
        label: "Open",
        onClick: () => navigate(paths.overview(values.slug)),
      });
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CustomInput
        label="Name"
        name="name"
        autoFocus
        placeholder="Acme Labs"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          if (!isSlugEdited) setSlug(slugify(event.target.value));
        }}
        error={fieldErrors.name}
      />
      <SlugField
        value={slug}
        currentSlug=""
        isNew
        error={fieldErrors.slug}
        onChange={(next) => {
          setIsSlugEdited(true);
          setSlug(next);
        }}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Create organization
        </Button>
      </div>
    </form>
  );
}
