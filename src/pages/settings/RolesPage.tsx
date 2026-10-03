import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useState } from "react";
import { LuPlus, LuShieldPlus } from "react-icons/lu";
import { useParams } from "react-router";
import { membersQuery } from "@/api/members";
import { rolesQuery, useDeleteRoles, useSaveRole } from "@/api/roles";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { Can } from "@/components/rbac/Can";
import { NewRoleModal } from "@/components/roles/NewRoleModal";
import { RolesTable } from "@/components/roles/RolesTable";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import type { Member } from "@/types/member";
import type { Role } from "@/types/rbac";

export function RolesPage() {
  const { orgSlug = "" } = useParams();
  const { data: roles } = useQuery(rolesQuery(orgSlug));
  const { data: members } = useQuery(membersQuery(orgSlug));
  const [cloneSource, setCloneSource] = useState<Role | null | undefined>(undefined);
  const custom = roles?.filter((role) => !role.isSystem) ?? [];

  return (
    <>
      <title>Roles · Settings · Uptrail</title>
      <PageHeader
        level={2}
        title="Roles"
        meta={
          roles && (
            <MetaList>
              <span>
                <span className="font-mono text-ink">{roles.length - custom.length}</span> built-in
              </span>
              <span>
                <span className="font-mono text-ink">{custom.length}</span> custom
              </span>
              <span>
                <span className="font-mono text-ink">{ALL_PERMISSIONS.length}</span> permissions available
              </span>
            </MetaList>
          )
        }
        actions={
          <Can permission="role:manage">
            <Button type="primary" icon={<LuPlus />} onClick={() => setCloneSource(null)}>
              Create role
            </Button>
          </Can>
        }
      />
      {roles && members ? (
        <SectionErrorBoundary>
          <RoleGroups roles={roles} members={members} onClone={setCloneSource} onCreate={() => setCloneSource(null)} />
        </SectionErrorBoundary>
      ) : (
        <TableSkeleton columns={["flex-1", "w-40", "w-24", "w-16", "w-6"]} rows={5} />
      )}
      {roles && <NewRoleModal source={cloneSource} roles={roles} onClose={() => setCloneSource(undefined)} />}
    </>
  );
}

type RoleGroupsProps = {
  roles: Role[];
  members: Member[];
  onClone: (role: Role) => void;
  onCreate: () => void;
};

function RoleGroups({ roles, members, onClone, onCreate }: RoleGroupsProps) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const deleteRoles = useDeleteRoles(orgSlug);
  const saveRole = useSaveRole(orgSlug);
  const custom = roles.filter((role) => !role.isSystem);

  async function remove(role: Role) {
    const isConfirmed = await confirm({
      title: `Delete ${role.name}?`,
      description: "No one has this role, so nobody loses access.",
      confirmLabel: "Delete role",
      isDanger: true,
    });
    if (!isConfirmed) return;
    deleteRoles.mutate([role.id]);
    toast.success(`${role.name} deleted`, undefined, { label: "Undo", onClick: () => saveRole.mutate(role) });
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title="Built-in" meta="read-only" className="overflow-hidden">
        <RolesTable
          roles={roles.filter((role) => role.isSystem)}
          members={members}
          onClone={onClone}
          onDelete={remove}
        />
      </Card>
      <Card title="Custom" meta={custom.length} className="overflow-hidden">
        {custom.length > 0 ? (
          <RolesTable roles={custom} members={members} onClone={onClone} onDelete={remove} />
        ) : (
          <EmptyState
            icon={<LuShieldPlus />}
            title="No custom roles yet"
            description="Built-in roles cover most teams. Create one for on-call engineers or client access."
            action={
              <Can permission="role:manage">
                <Button onClick={onCreate}>Create role</Button>
              </Can>
            }
          />
        )}
      </Card>
    </div>
  );
}
