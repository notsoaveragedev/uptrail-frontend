import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Modal } from "antd";
import { useState } from "react";
import { LuCircleCheck } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { statusPagesQuery, useSaveStatusPage } from "@/api/statusPages";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Loader } from "@/components/ui/Loader";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { paths } from "@/lib/paths";
import { newStatusPageSchema } from "@/lib/schemas";
import { slugify } from "@/lib/format";
import { blankStatusPage, isSlugTaken, pageProjectOptions } from "@/lib/statusPages";

type NewStatusPageModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewStatusPageModal({ open, onClose }: NewStatusPageModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="New status page" footer={null} destroyOnHidden width="32rem">
      <NewStatusPageForm onClose={onClose} />
    </Modal>
  );
}

function NewStatusPageForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const { data: pages = [] } = useQuery(statusPagesQuery(orgSlug));
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const savePage = useSaveStatusPage(orgSlug);
  const projectOptions = pageProjectOptions(pages);
  const [project, setProject] = useState(projectOptions.find((option) => !option.disabled)?.value ?? "");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: newStatusPageSchema,
    onSubmit: async (values) => {
      if (isSlugTaken(values.slug, pages)) {
        setFieldErrors({ slug: "That URL is taken. Try another slug." });
        return;
      }
      const page = await savePage.mutateAsync(blankStatusPage(values, monitors));
      onClose();
      toast.success("Draft created", "Brand it and pick components, then publish when it's ready.");
      navigate(paths.statusPageEdit(orgSlug, page.id));
    },
  });

  function changeTitle(next: string) {
    setTitle(next);
    if (!isSlugEdited) setSlug(slugify(next));
  }

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      {!project && (
        <Alert
          type="info"
          showIcon
          title="Every project already has a status page"
          description="Each project gets one page. Edit an existing page, or delete one to start over."
        />
      )}
      <CustomSelect<string>
        label="Project"
        value={project || undefined}
        placeholder="Pick a project"
        onChange={setProject}
        options={projectOptions.map((option) => ({
          value: option.value,
          disabled: option.disabled,
          label: (
            <span className="flex items-center justify-between gap-3">
              {option.label}
              {option.disabled && <span className="text-xs text-subtle">Already has a status page</span>}
            </span>
          ),
        }))}
        hint="Each project gets one public status page."
        error={fieldErrors.project}
      />
      <input type="hidden" name="project" value={project} />
      <CustomInput
        label="Title"
        name="title"
        placeholder="Acme status"
        autoFocus
        value={title}
        onChange={(event) => changeTitle(event.target.value)}
        error={fieldErrors.title}
      />
      <CustomInput
        label="URL"
        name="slug"
        placeholder="acme"
        value={slug}
        prefix={<span className="font-mono text-xs text-subtle">/status/</span>}
        onChange={(event) => {
          setIsSlugEdited(true);
          setSlug(event.target.value.toLowerCase());
        }}
        className="font-mono"
        error={fieldErrors.slug}
        hint={!fieldErrors.slug && <SlugAvailability slug={slug} isTaken={(value) => isSlugTaken(value, pages)} />}
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending} disabled={!project}>
          Create draft
        </Button>
      </div>
    </form>
  );
}

type SlugAvailabilityProps = {
  slug: string;
  isTaken: (slug: string) => boolean;
};

function SlugAvailability({ slug, isTaken }: SlugAvailabilityProps) {
  const checked = useDebouncedValue(slug, 350);
  const parsed = newStatusPageSchema.shape.slug.safeParse(checked);

  if (!slug) return "Lowercase letters, numbers and hyphens.";
  if (checked !== slug) return <Loader size="sm" label="Checking availability" />;
  if (!parsed.success) return <span className="text-degraded">{parsed.error.issues[0].message}</span>;
  if (isTaken(checked)) return <span className="text-down">/status/{checked} is taken.</span>;
  return (
    <span role="status" className="flex items-center gap-1 text-up">
      <LuCircleCheck aria-hidden className="size-3" />
      /status/{checked} is available
    </span>
  );
}
