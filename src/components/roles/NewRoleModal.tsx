import { Alert, Button, Input, Modal } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSaveRole } from "@/api/roles";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { useForm } from "@/hooks/useForm";
import { useCurrentRole } from "@/hooks/usePermission";
import { canGrantRole } from "@/lib/permissions";
import { useToast } from "@/hooks/useToast";
import { paths } from "@/lib/paths";
import { BLANK_ROLE, isRoleNameTaken, newRole } from "@/lib/roles";
import { roleDetailsSchema } from "@/lib/schemas";
import type { Role } from "@/types/rbac";
import { findRole } from "@/lib/members";

type NewRoleModalProps = {
  source: Role | null | undefined;
  roles: Role[];
  onClose: () => void;
};

export function NewRoleModal({ source, roles, onClose }: NewRoleModalProps) {
  return (
    <Modal
      open={source !== undefined}
      onCancel={onClose}
      title={source ? `Clone ${source.name}` : "Create role"}
      footer={null}
      destroyOnHidden
      width="28rem"
    >
      <NewRoleForm source={source ?? null} roles={roles} onClose={onClose} />
    </Modal>
  );
}

function NewRoleForm({ source, roles, onClose }: { source: Role | null; roles: Role[]; onClose: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const save = useSaveRole(orgSlug);
  const { granted } = useCurrentRole();
  const [startFrom, setStartFrom] = useState(source?.id ?? BLANK_ROLE);

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: roleDetailsSchema,
    onSubmit: async (values) => {
      if (isRoleNameTaken(values.name, roles)) {
        setFieldErrors({ name: "A role with this name already exists." });
        return;
      }
      const role = newRole(values.name, values.description, findRole(roles, startFrom));
      await save.mutateAsync(role);
      onClose();
      toast.success(`${role.name} created`, "Pick its permissions, then save.");
      navigate(paths.role(orgSlug, role.id));
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-4 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CustomInput
        label="Name"
        name="name"
        autoFocus
        defaultValue={source ? `${source.name} (copy)` : ""}
        placeholder="On-call engineer"
        error={fieldErrors.name}
      />
      <FieldShell label="Description" htmlFor="role-description" error={fieldErrors.description}>
        <Input.TextArea
          id="role-description"
          name="description"
          rows={2}
          defaultValue={source?.description}
          placeholder="What people with this role do"
        />
      </FieldShell>
      <CustomSelect
        label="Start from"
        value={startFrom}
        onChange={setStartFrom}
        options={[
          { value: BLANK_ROLE, label: "Blank (no permissions)" },
          ...roles.map((role) => {
            const check = canGrantRole(granted, role);
            return {
              value: role.id,
              label: `${role.name} · ${role.isSystem ? "built-in" : "custom"}`,
              disabled: !check.allowed,
              title: check.reason ?? undefined,
            };
          }),
        ]}
        hint="Copies that role's permissions. You can change them next."
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          {source ? "Clone role" : "Create role"}
        </Button>
      </div>
    </form>
  );
}
