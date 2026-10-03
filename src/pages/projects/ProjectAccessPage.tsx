import { useQuery } from "@tanstack/react-query";
import { Table, Tooltip, type TableColumnsType } from "antd";
import { useParams } from "react-router";
import { membersQuery } from "@/api/members";
import { rolesQuery } from "@/api/roles";
import { useMemberActions } from "@/components/members/useMemberActions";
import { RoleSelect } from "@/components/settings/RoleSelect";
import { RoleTag } from "@/components/settings/RoleTag";
import { PersonCell } from "@/components/ui/PersonCell";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useCurrentRole, usePermission } from "@/hooks/usePermission";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { findRole, INHERIT_ROLE, memberEditCheck, OWNER_ROLE_ID, roleName } from "@/lib/members";
import { expandPermissions, permissionSummary } from "@/lib/permissions";
import { CURRENT_MEMBER_ID } from "@/mocks/team";
import type { Member } from "@/types/member";
import type { Role } from "@/types/rbac";

export function ProjectAccessPage() {
  const { orgSlug = "" } = useParams();
  const { data: members } = useQuery(membersQuery(orgSlug));
  const { data: roles } = useQuery(rolesQuery(orgSlug));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted">
        Members get their org role in every project. An override here replaces it for this project only.
      </p>
      {members && roles ? (
        <AccessTable members={members} roles={roles} />
      ) : (
        <TableSkeleton columns={["flex-1", "w-24", "w-32", "w-48"]} />
      )}
    </div>
  );
}

function effectiveSummary(role: Role | undefined) {
  if (!role) return "—";
  const summary = permissionSummary(expandPermissions(role.permissions));
  if (summary.every((item) => item.isFull)) return "Full access";
  return summary
    .slice(0, 3)
    .map((item) => `${item.resource}: ${item.text.toLowerCase()}`)
    .join(" · ");
}

function AccessTable({ members, roles }: { members: Member[]; roles: Role[] }) {
  const toast = useToast();
  const { project } = useProject();
  const { granted } = useCurrentRole();
  const canUpdate = usePermission("member:update");
  const { saveMember } = useMemberActions();
  const slug = project?.slug ?? "";

  function overrideOf(member: Member) {
    return member.projectOverrides.find((item) => item.project === slug);
  }

  function setOverride(member: Member, roleId: string) {
    const others = member.projectOverrides.filter((item) => item.project !== slug);
    const projectOverrides = roleId === INHERIT_ROLE ? others : [...others, { project: slug, roleId }];
    saveMember.mutate({ ...member, projectOverrides });
    toast.success(
      roleId === INHERIT_ROLE ? "Override removed" : `${member.name} is now ${roleName(roles, roleId)} here`,
      roleId === INHERIT_ROLE ? `${member.name} uses their org role in ${project?.name}.` : `Only in ${project?.name}.`,
    );
  }

  const columns: TableColumnsType<Member> = [
    {
      title: "Member",
      key: "member",
      render: (_, member) => (
        <PersonCell name={member.name} email={member.email} isYou={member.id === CURRENT_MEMBER_ID} />
      ),
    },
    {
      title: "Org role",
      key: "orgRole",
      width: 150,
      render: (_, member) => <RoleTag role={findRole(roles, member.roleId)} />,
    },
    {
      title: "Role in this project",
      key: "projectRole",
      width: 220,
      render: (_, member) => {
        const override = overrideOf(member);
        const check = canUpdate.allowed ? memberEditCheck(member, members, roles, granted) : canUpdate;
        if (member.roleId === OWNER_ROLE_ID || !check.allowed) {
          return (
            <Tooltip title={member.roleId === OWNER_ROLE_ID ? "Owners have full access everywhere." : check.reason}>
              <span className="text-subtle">{override ? roleName(roles, override.roleId) : "Inherits org role"}</span>
            </Tooltip>
          );
        }
        return (
          <span className="flex items-center gap-2">
            <RoleSelect
              aria-label={`${member.name}'s role in this project`}
              size="small"
              variant={override ? "outlined" : "borderless"}
              roles={roles}
              inheritLabel={`Inherit (${roleName(roles, member.roleId)})`}
              value={override?.roleId ?? INHERIT_ROLE}
              onChange={(roleId) => setOverride(member, roleId)}
              className={override ? "w-44" : "-ml-2 w-44"}
            />
            {override && (
              <>
                <span aria-hidden className="size-1.5 rounded-full bg-muted" />
                <span className="sr-only">Override</span>
              </>
            )}
          </span>
        );
      },
    },
    {
      title: "Effective access here",
      key: "effective",
      render: (_, member) => {
        const roleId = overrideOf(member)?.roleId ?? member.roleId;
        return <span className="line-clamp-2 text-xs text-muted">{effectiveSummary(findRole(roles, roleId))}</span>;
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={members}
      tableLayout="fixed"
      scroll={{ x: 880 }}
      pagination={false}
      className="rounded-lg border border-line bg-card"
    />
  );
}
