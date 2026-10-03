import { Alert } from "antd";
import { useState } from "react";
import { LuLock } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { useSaveRole } from "@/api/roles";
import { Card } from "@/components/ui/Card";
import { CustomInput } from "@/components/ui/CustomInput";
import { SaveBar } from "@/components/ui/SaveBar";
import { useCurrentRole, usePermission } from "@/hooks/usePermission";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { plural } from "@/lib/format";
import { membersWithRole } from "@/lib/members";
import { paths } from "@/lib/paths";
import { canGrantRole, expandPermissions, permissionDiff } from "@/lib/permissions";
import { isRoleNameTaken } from "@/lib/roles";
import type { Member } from "@/types/member";
import type { Role } from "@/types/rbac";
import { PermissionMatrix } from "./PermissionMatrix";
import { RoleDiffModal } from "./RoleDiffModal";
import { RoleSummary } from "./RoleSummary";

type RoleEditorProps = {
  role: Role;
  roles: Role[];
  members: Member[];
};

export function RoleEditor({ role, roles, members }: RoleEditorProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const save = useSaveRole(orgSlug);
  const canManage = usePermission("role:manage");
  const { granted } = useCurrentRole();
  const grantCheck = canGrantRole(granted, role);
  const isReadOnly = role.isSystem || !canManage.allowed || !grantCheck.allowed;
  const [saved] = useState(() => expandPermissions(role.permissions));
  const [selected, setSelected] = useState(saved);
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [note, setNote] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const diff = permissionDiff(saved, selected);
  const detailsChanged = name.trim() !== role.name || description.trim() !== role.description;
  const changeCount = diff.added.length + diff.removed.length + (detailsChanged ? 1 : 0);
  const nameError = !name.trim()
    ? "Name the role."
    : isRoleNameTaken(name, roles, role.id)
      ? "That name is taken."
      : null;
  const guard = useUnsavedChangesGuard({
    isDirty: changeCount > 0,
    title: "Discard changes to this role?",
    description: "Your permission changes haven't been saved.",
  });

  function discard() {
    setSelected(saved);
    setName(role.name);
    setDescription(role.description);
    setNote(null);
  }

  async function confirmSave() {
    try {
      await save.mutateAsync({
        ...role,
        name: name.trim(),
        description: description.trim(),
        permissions: [...selected],
        updatedAt: Date.now(),
      });
    } catch {
      toast.error("Couldn't save the role", "Your changes are still here. Try again.");
      return;
    }
    guard.allowLeave();
    setIsReviewing(false);
    toast.success(`${name.trim()} saved`, plural(membersWithRole(members, role.id).length, "member") + " updated");
    navigate(paths.settings(orgSlug, "roles"));
  }

  return (
    <div className="flex flex-col gap-5">
      {isReadOnly && (
        <Alert
          type="info"
          showIcon
          icon={<LuLock />}
          title={role.isSystem ? "Built-in roles can't be edited" : "You can view this role but not change it"}
          description={
            role.isSystem
              ? "Clone this role to start a custom one from the same permissions."
              : (canManage.reason ?? grantCheck.reason)
          }
        />
      )}
      <Card>
        <div className="grid gap-4 p-4 md:grid-cols-[18rem_minmax(0,1fr)]">
          <CustomInput
            label="Name"
            size="middle"
            value={name}
            disabled={isReadOnly}
            error={isReadOnly ? null : nameError}
            onChange={(event) => setName(event.target.value)}
          />
          <CustomInput
            label="Description"
            size="middle"
            value={description}
            disabled={isReadOnly}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </Card>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card
          title="Permissions"
          extra={!isReadOnly && <span className="text-xs text-subtle">Update, delete and manage need read</span>}
        >
          <PermissionMatrix
            selected={selected}
            allowed={granted}
            baseline={saved}
            isReadOnly={isReadOnly}
            onChange={(next, nextNote) => {
              setSelected(next);
              setNote(nextNote);
            }}
          />
          <p aria-live="polite" className="min-h-9 border-t border-line px-4 py-2 text-xs text-muted">
            {note}
          </p>
        </Card>
        <div className="xl:sticky xl:top-0">
          <RoleSummary selected={selected} />
        </div>
      </div>
      {!isReadOnly && (
        <SaveBar
          isVisible={changeCount > 0}
          summary={`${plural(changeCount, "unsaved change")}`}
          saveLabel="Review & save"
          onDiscard={discard}
          onSave={() => !nameError && setIsReviewing(true)}
        />
      )}
      <RoleDiffModal
        open={isReviewing}
        roleName={name.trim() || role.name}
        added={diff.added}
        removed={diff.removed}
        detailsChanged={detailsChanged}
        affected={membersWithRole(members, role.id)}
        isSaving={save.isPending}
        onCancel={() => setIsReviewing(false)}
        onConfirm={confirmSave}
      />
    </div>
  );
}
