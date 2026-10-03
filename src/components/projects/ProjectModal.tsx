import { Alert, Button, Input, Modal } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSaveProject } from "@/api/projects";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { slugify } from "@/lib/format";
import { paths } from "@/lib/paths";
import { newProject } from "@/lib/projects";
import { projectSchema } from "@/lib/schemas";
import type { Project } from "@/types/project";

type ProjectModalProps = {
  project: Project | null | undefined;
  projects: Project[];
  tagOptions: string[];
  onClose: () => void;
};

export function ProjectModal({ project, projects, tagOptions, onClose }: ProjectModalProps) {
  return (
    <Modal
      open={project !== undefined}
      onCancel={onClose}
      title={project ? `Edit ${project.name}` : "New project"}
      footer={null}
      destroyOnHidden
      width="32rem"
    >
      <ProjectForm project={project ?? null} projects={projects} tagOptions={tagOptions} onClose={onClose} />
    </Modal>
  );
}

type ProjectFormProps = Omit<ProjectModalProps, "project"> & { project: Project | null };

function ProjectForm({ project, projects, tagOptions, onClose }: ProjectFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const save = useSaveProject(orgSlug);
  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [isSlugEdited, setIsSlugEdited] = useState(project !== null);
  const [tags, setTags] = useState(project?.tags ?? []);

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: projectSchema,
    onSubmit: async (values) => {
      if (projects.some((item) => item.slug === values.slug && item.id !== project?.id)) {
        setFieldErrors({ slug: "Another project already uses this slug." });
        return;
      }
      const next = project ? { ...project, ...values } : newProject(values);
      await save.mutateAsync(next);
      onClose();
      if (project) {
        toast.success("Project updated", next.name);
        return;
      }
      toast.success(`${next.name} created`, "Add monitors to start tracking its health.", {
        label: "Open project",
        onClick: () => navigate(paths.project(orgSlug, next.slug)),
      });
    },
  });

  function changeName(value: string) {
    setName(value);
    if (!isSlugEdited) setSlug(slugify(value));
  }

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CustomInput
        label="Name"
        name="name"
        autoFocus
        placeholder="Northwind storefront"
        value={name}
        onChange={(event) => changeName(event.target.value)}
        error={fieldErrors.name}
      />
      <CustomInput
        label="Slug"
        name="slug"
        value={slug}
        onChange={(event) => {
          setIsSlugEdited(true);
          setSlug(event.target.value.toLowerCase());
        }}
        addonBefore={<span className="font-mono text-xs text-subtle">projects/</span>}
        className="font-mono"
        readOnly={project !== null}
        hint={project ? "Slugs can't change after creation. Links and monitors use them." : undefined}
        error={fieldErrors.slug}
      />
      <FieldShell label="Description" htmlFor="project-description" error={fieldErrors.description}>
        <Input.TextArea
          id="project-description"
          name="description"
          rows={2}
          defaultValue={project?.description}
          placeholder="What this project covers, or which client it's for"
        />
      </FieldShell>
      <div>
        <input type="hidden" name="tags" value={tags.join(",")} />
        <CustomSelect
          label="Tags"
          mode="tags"
          value={tags}
          onChange={(values) => setTags(values.map(slugify).filter(Boolean))}
          tokenSeparators={[",", " "]}
          placeholder="client, production"
          options={tagOptions.map((tag) => ({ value: tag, label: tag }))}
          hint="Used to filter the projects list."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          {project ? "Save project" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
