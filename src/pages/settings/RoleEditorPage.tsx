import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button } from "antd";
import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { membersQuery } from "@/api/members";
import { rolesQuery } from "@/api/roles";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { NewRoleModal } from "@/components/roles/NewRoleModal";
import { RoleEditor } from "@/components/roles/RoleEditor";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useCurrentRole, usePermission } from "@/hooks/usePermission";
import { canGrantRole } from "@/lib/permissions";
import { membersWithRole } from "@/lib/members";
import { paths } from "@/lib/paths";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";
import type { Role } from "@/types/rbac";
import { plural } from "@/lib/format";

export function RoleEditorPage() {
  const { orgSlug = "", roleId = "" } = useParams();
  const { data: roles } = useQuery(rolesQuery(orgSlug));
  const { data: members } = useQuery(membersQuery(orgSlug));
  const canManage = usePermission("role:manage");
  const { granted } = useCurrentRole();
  const [cloneSource, setCloneSource] = useState<Role | undefined>(undefined);
  const role = roles?.find((item) => item.id === roleId);

  if (roles && !role) return <InAppNotFoundPage />;

  return (
    <>
      <title>{`${role?.name ?? "Role"} · Roles · Uptrail`}</title>
      <Breadcrumb
        className="-mb-3 text-xs"
        items={[{ title: <Link to={paths.settings(orgSlug, "roles")}>Roles</Link> }, { title: role?.name ?? "…" }]}
      />
      <PageHeader
        level={2}
        title={role?.name ?? "Loading role"}
        meta={
          role &&
          members && (
            <MetaList>
              <span>{role.isSystem ? "Built-in role" : "Custom role"}</span>
              <span>{plural(membersWithRole(members, role.id).length, "member")}</span>
              {!role.isSystem && (
                <span>
                  edited <TimeAgo timestamp={role.updatedAt} intervalMs={60_000} />
                </span>
              )}
            </MetaList>
          )
        }
        actions={
          role &&
          canManage.allowed &&
          canGrantRole(granted, role).allowed && (
            <Button icon={<LuCopy />} onClick={() => setCloneSource(role)}>
              Clone
            </Button>
          )
        }
      />
      {role && roles && members ? (
        <RoleEditor key={role.id} role={role} roles={roles} members={members} />
      ) : (
        <div aria-busy className="flex flex-col gap-5">
          <SkeletonBlock className="h-24 border border-line" />
          <SkeletonBlock className="h-120 border border-line" />
        </div>
      )}
      {roles && <NewRoleModal source={cloneSource} roles={roles} onClose={() => setCloneSource(undefined)} />}
    </>
  );
}
