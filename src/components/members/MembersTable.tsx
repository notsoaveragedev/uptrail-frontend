import { useQuery } from "@tanstack/react-query";
import { Button, Dropdown, Table, Tooltip, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { LuCopy, LuEllipsis, LuFolderLock, LuLogOut, LuUserMinus } from "react-icons/lu";
import { useParams } from "react-router";
import { orgSettingsQuery } from "@/api/org";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { PersonCell } from "@/components/ui/PersonCell";
import { StatusDot } from "@/components/ui/StatusDot";
import { useCopy } from "@/hooks/useCopy";
import { useLeaveOrganization } from "@/hooks/useLeaveOrganization";
import { useNow } from "@/hooks/useNow";
import { useCurrentRole, usePermission } from "@/hooks/usePermission";
import { formatDay, plural } from "@/lib/format";
import { memberEditCheck } from "@/lib/members";
import { CURRENT_MEMBER_ID } from "@/mocks/team";
import type { Member } from "@/types/member";
import type { Role } from "@/types/rbac";
import { MemberRoleCell } from "./MemberRoleCell";
import { useMemberActions } from "./useMemberActions";

const ACTIVE_NOW_MS = 5 * 60_000;

type MembersTableProps = {
  members: Member[];
  allMembers: Member[];
  roles: Role[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onManageOverrides: (member: Member) => void;
  emptyText: ReactNode;
};

export function MembersTable({
  members,
  allMembers,
  roles,
  selectedIds,
  onSelect,
  onManageOverrides,
  emptyText,
}: MembersTableProps) {
  const { granted } = useCurrentRole();
  const canUpdate = usePermission("member:update");
  const canRemove = usePermission("member:remove");
  const actions = useMemberActions();
  const copy = useCopy();
  const leave = useLeaveOrganization();
  const now = useNow(60_000);
  const { orgSlug = "" } = useParams();
  const { data: settings } = useQuery(orgSettingsQuery(orgSlug));

  function editCheck(member: Member) {
    return canUpdate.allowed ? memberEditCheck(member, allMembers, roles, granted) : canUpdate;
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
      title: "Role",
      key: "role",
      width: 180,
      render: (_, member) => (
        <MemberRoleCell
          member={member}
          roles={roles}
          check={editCheck(member)}
          onChange={(role) => actions.changeRole([member], role)}
        />
      ),
    },
    {
      title: "Project access",
      key: "overrides",
      width: 140,
      render: (_, member) => {
        if (!member.projectOverrides.length) return <span className="text-subtle">Org role</span>;
        const check = editCheck(member);
        const label = plural(member.projectOverrides.length, "override");
        if (!check.allowed) {
          return (
            <Tooltip title={check.reason}>
              <span className="text-muted">{label}</span>
            </Tooltip>
          );
        }
        return (
          <button
            type="button"
            onClick={() => onManageOverrides(member)}
            className="cursor-pointer text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
          >
            {label}
          </button>
        );
      },
    },
    {
      title: "Joined",
      key: "joined",
      width: 100,
      render: (_, member) => <span className="font-mono text-xs text-muted">{formatDay(member.joinedAt)}</span>,
    },
    {
      title: "Last active",
      key: "active",
      width: 120,
      render: (_, member) =>
        now - member.lastActiveAt < ACTIVE_NOW_MS ? (
          <span className="flex items-center gap-1.5 text-xs text-up">
            <StatusDot /> Active now
          </span>
        ) : (
          <span className="font-mono text-xs text-subtle">
            <TimeAgo timestamp={member.lastActiveAt} intervalMs={60_000} />
          </span>
        ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 56,
      render: (_, member) => {
        const isYou = member.id === CURRENT_MEMBER_ID;
        const check = canRemove.allowed ? editCheck(member) : canRemove;
        return (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "overrides",
                  icon: <LuFolderLock />,
                  label: "Project access",
                  disabled: !editCheck(member).allowed,
                  onClick: () => onManageOverrides(member),
                },
                {
                  key: "copy",
                  icon: <LuCopy />,
                  label: "Copy email",
                  onClick: () => copy(member.email, "Email copied", member.email),
                },
                { type: "divider" },
                {
                  key: "remove",
                  icon: isYou ? <LuLogOut /> : <LuUserMinus />,
                  danger: true,
                  disabled: !check.allowed,
                  label: (
                    <Tooltip title={check.reason} placement="left">
                      <span>{isYou ? "Leave organization" : "Remove from organization"}</span>
                    </Tooltip>
                  ),
                  onClick: () => (isYou ? leave(settings?.name ?? "this organization") : actions.remove([member])),
                },
              ],
            }}
          >
            <Button
              type="text"
              size="small"
              aria-label={`Actions for ${member.name}`}
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
      dataSource={members}
      tableLayout="fixed"
      scroll={{ x: 820 }}
      rowClassName="group"
      rowSelection={
        canRemove.allowed
          ? {
              selectedRowKeys: selectedIds,
              onChange: (keys) => onSelect(keys as string[]),
              columnWidth: 44,
              getCheckboxProps: (member) => ({
                disabled: member.id === CURRENT_MEMBER_ID || !editCheck(member).allowed,
              }),
            }
          : undefined
      }
      pagination={members.length > 20 ? { pageSize: 20, size: "small", showSizeChanger: false } : false}
      locale={{ emptyText }}
      className="rounded-lg border border-line bg-card"
    />
  );
}
