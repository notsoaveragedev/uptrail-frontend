import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Dropdown, Table, Tooltip, type TableColumnsType } from "antd";
import { LuCopy, LuEllipsis, LuEye, LuPencil, LuTrash2 } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import { invitationsQuery } from "@/api/members";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { RoleTag } from "@/components/settings/RoleTag";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { TickMeter } from "@/components/ui/TickMeter";
import { useCurrentRole, usePermission } from "@/hooks/usePermission";
import { isRowControl } from "@/lib/dom";
import { membersWithRole } from "@/lib/members";
import { paths } from "@/lib/paths";
import { ALL_PERMISSIONS, canGrantRole, expandPermissions } from "@/lib/permissions";
import type { Member } from "@/types/member";
import type { Role } from "@/types/rbac";
import { plural } from "@/lib/format";

type RolesTableProps = {
  roles: Role[];
  members: Member[];
  onClone: (role: Role) => void;
  onDelete: (role: Role) => void;
};

export function RolesTable({ roles, members, onClone, onDelete }: RolesTableProps) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const canManage = usePermission("role:manage");
  const { data: invitations = [] } = useQuery(invitationsQuery(orgSlug));
  const { granted } = useCurrentRole();

  const columns: TableColumnsType<Role> = [
    {
      title: "Role",
      key: "role",
      render: (_, role) => (
        <span className="flex min-w-0 flex-col items-start gap-1">
          <Link to={paths.role(orgSlug, role.id)} className="hover:no-underline">
            <RoleTag role={role} />
          </Link>
          <span className="truncate text-xs text-muted">{role.description}</span>
        </span>
      ),
    },
    {
      title: "Permissions",
      key: "permissions",
      width: 200,
      render: (_, role) => {
        const count = expandPermissions(role.permissions).size;
        return (
          <span className="flex items-center gap-2.5">
            <TickMeter
              value={Math.round((count / ALL_PERMISSIONS.length) * 20)}
              total={20}
              fillClassName="bg-muted"
              label={`${count} of ${ALL_PERMISSIONS.length} permissions`}
            />
            <span className="font-mono text-xs text-muted">{count}</span>
          </span>
        );
      },
    },
    {
      title: "Members",
      key: "members",
      width: 150,
      render: (_, role) => {
        const holders = membersWithRole(members, role.id);
        if (holders.length === 0) return <span className="text-subtle">None</span>;
        return (
          <Link
            to={paths.settings(orgSlug, "members", { role: role.id })}
            className="flex items-center gap-2 text-muted hover:text-ink"
          >
            <Avatar.Group max={{ count: 3 }} size="small">
              {holders.map((member) => (
                <PersonAvatar key={member.id} name={member.name} />
              ))}
            </Avatar.Group>
            <span className="font-mono text-xs">{holders.length}</span>
          </Link>
        );
      },
    },
    {
      title: "Updated",
      key: "updated",
      width: 100,
      render: (_, role) =>
        role.isSystem ? (
          <span className="text-xs text-subtle">Built-in</span>
        ) : (
          <span className="font-mono text-xs text-subtle">
            <TimeAgo timestamp={role.updatedAt} intervalMs={60_000} />
          </span>
        ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 56,
      render: (_, role) => {
        const holders = membersWithRole(members, role.id).length;
        const invites = invitations.filter((invitation) => invitation.roleId === role.id).length;
        const blocker = holders
          ? `${plural(holders, "member")} use this role. Reassign them first.`
          : invites
            ? `${plural(invites, "pending invite")} use this role. Revoke them first.`
            : null;
        const isEditable = !role.isSystem && canManage.allowed;
        return (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "open",
                  icon: isEditable ? <LuPencil /> : <LuEye />,
                  label: isEditable ? "Edit permissions" : "View permissions",
                  onClick: () => navigate(paths.role(orgSlug, role.id)),
                },
                ...(canManage.allowed
                  ? [
                      ...(canGrantRole(granted, role).allowed
                        ? [{ key: "clone", icon: <LuCopy />, label: "Clone", onClick: () => onClone(role) }]
                        : []),
                      ...(role.isSystem
                        ? []
                        : [
                            { type: "divider" as const },
                            {
                              key: "delete",
                              icon: <LuTrash2 />,
                              danger: true,
                              disabled: blocker !== null,
                              label: (
                                <Tooltip placement="left" title={blocker}>
                                  <span>Delete</span>
                                </Tooltip>
                              ),
                              onClick: () => onDelete(role),
                            },
                          ]),
                    ]
                  : []),
              ],
            }}
          >
            <Button
              type="text"
              size="small"
              aria-label={`Actions for ${role.name}`}
              icon={<LuEllipsis />}
              className="row-actions"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={roles}
      tableLayout="fixed"
      scroll={{ x: 720 }}
      rowClassName="group cursor-pointer"
      onRow={(role) => ({
        onClick: (event) => {
          if (isRowControl(event.target)) return;
          navigate(paths.role(orgSlug, role.id));
        },
      })}
      pagination={false}
    />
  );
}
