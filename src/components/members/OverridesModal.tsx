import { Button, Modal } from "antd";
import { useState } from "react";
import { LuPlus, LuX } from "react-icons/lu";
import { RoleSelect } from "@/components/settings/RoleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useProjectOptions } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { roleName } from "@/lib/members";
import { projectLabel } from "@/lib/monitors";
import type { Member, ProjectOverride } from "@/types/member";
import type { Role } from "@/types/rbac";
import { useMemberActions } from "./useMemberActions";

type OverridesModalProps = {
  member: Member | null;
  roles: Role[];
  onClose: () => void;
};

export function OverridesModal({ member, roles, onClose }: OverridesModalProps) {
  return (
    <Modal
      open={member !== null}
      onCancel={onClose}
      title={member ? `Project access · ${member.name}` : null}
      footer={null}
      destroyOnHidden
      width="32rem"
    >
      {member && <OverridesForm member={member} roles={roles} onClose={onClose} />}
    </Modal>
  );
}

function OverridesForm({ member, roles, onClose }: { member: Member; roles: Role[]; onClose: () => void }) {
  const projectOptions = useProjectOptions();
  const toast = useToast();
  const { saveMember } = useMemberActions();
  const [overrides, setOverrides] = useState<ProjectOverride[]>(member.projectOverrides);
  const unused = projectOptions.filter((project) => !overrides.some((item) => item.project === project.value));

  function setRole(project: string, roleId: string) {
    setOverrides((current) => current.map((item) => (item.project === project ? { ...item, roleId } : item)));
  }

  function save() {
    saveMember.mutate({ ...member, projectOverrides: overrides });
    toast.success("Project access updated", member.name);
    onClose();
  }

  return (
    <div className="flex flex-col gap-4 pt-1">
      <p className="text-muted">
        {member.name} is <span className="text-ink">{roleName(roles, member.roleId)}</span> across the organization. An
        override replaces that role inside one project only.
      </p>
      <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
        {overrides.map((override) => (
          <li key={override.project} className="flex items-center gap-3 px-3 py-2">
            <span className="flex-1 font-medium">{projectLabel(override.project)}</span>
            <RoleSelect
              aria-label={`Role in ${projectLabel(override.project)}`}
              size="small"
              roles={roles}
              value={override.roleId}
              onChange={(roleId) => setRole(override.project, roleId)}
              className="w-40"
            />
            <Button
              type="text"
              size="small"
              aria-label={`Remove override for ${projectLabel(override.project)}`}
              icon={<LuX />}
              onClick={() => setOverrides((current) => current.filter((item) => item.project !== override.project))}
            />
          </li>
        ))}
        {overrides.length === 0 && (
          <li className="px-3 py-3 text-subtle">No overrides. The org role applies everywhere.</li>
        )}
      </ul>
      {unused.length > 0 && (
        <CustomSelect
          size="middle"
          aria-label="Add a project override"
          placeholder="Add a project…"
          value={null}
          prefix={<LuPlus className="text-subtle" />}
          options={unused}
          onChange={(project) => project && setOverrides((current) => [...current, { project, roleId: member.roleId }])}
        />
      )}
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={save}>
          Save access
        </Button>
      </div>
    </div>
  );
}
