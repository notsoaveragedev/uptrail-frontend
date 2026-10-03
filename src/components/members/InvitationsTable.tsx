import { Button, Table, Tooltip, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { LuLink, LuRotateCw, LuX } from "react-icons/lu";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { RoleTag } from "@/components/settings/RoleTag";
import { ExpiresIn } from "@/components/ui/ExpiresIn";
import { PersonCell } from "@/components/ui/PersonCell";
import { useCopy } from "@/hooks/useCopy";
import { useNow } from "@/hooks/useNow";
import { usePermission } from "@/hooks/usePermission";
import { formatDateTime } from "@/lib/format";
import { findRole, isInvitationExpired } from "@/lib/members";
import type { Invitation } from "@/types/member";
import type { Role } from "@/types/rbac";
import { useMemberActions } from "./useMemberActions";

type InvitationsTableProps = {
  invitations: Invitation[];
  roles: Role[];
  emptyText: ReactNode;
};

export function InvitationsTable({ invitations, roles, emptyText }: InvitationsTableProps) {
  const now = useNow(60_000);
  const copy = useCopy();
  const actions = useMemberActions();
  const canInvite = usePermission("member:invite");

  const columns: TableColumnsType<Invitation> = [
    {
      title: "Email",
      key: "email",
      render: (_, invitation) => <span className="truncate font-medium text-ink">{invitation.email}</span>,
    },
    {
      title: "Role",
      key: "role",
      width: 150,
      render: (_, invitation) => <RoleTag role={findRole(roles, invitation.roleId)} />,
    },
    {
      title: "Invited by",
      key: "invitedBy",
      width: 150,
      render: (_, invitation) => <PersonCell name={invitation.invitedBy} isMuted />,
    },
    {
      title: "Sent",
      key: "sent",
      width: 90,
      render: (_, invitation) => (
        <Tooltip title={formatDateTime(invitation.createdAt)}>
          <span className="font-mono text-xs text-subtle">
            <TimeAgo timestamp={invitation.createdAt} intervalMs={60_000} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Expires",
      key: "expires",
      width: 110,
      render: (_, invitation) =>
        isInvitationExpired(invitation, now) ? (
          <StatusBadge status="paused" label="Expired" />
        ) : (
          <ExpiresIn expiresAt={invitation.expiresAt} />
        ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 120,
      render: (_, invitation) =>
        canInvite.allowed && (
          <div className="row-actions flex justify-end gap-1">
            <Tooltip title="Resend">
              <Button
                size="small"
                aria-label={`Resend invite to ${invitation.email}`}
                icon={<LuRotateCw />}
                onClick={() => actions.resend(invitation)}
              />
            </Tooltip>
            <Tooltip title="Copy invite link">
              <Button
                size="small"
                aria-label={`Copy invite link for ${invitation.email}`}
                icon={<LuLink />}
                onClick={() => copy(`${window.location.origin}/invite/${invitation.id}`, "Invite link copied")}
              />
            </Tooltip>
            <Tooltip title="Revoke">
              <Button
                size="small"
                danger
                aria-label={`Revoke invite for ${invitation.email}`}
                icon={<LuX />}
                onClick={() => actions.revoke(invitation)}
              />
            </Tooltip>
          </div>
        ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={invitations}
      tableLayout="fixed"
      scroll={{ x: 760 }}
      rowClassName="group"
      pagination={false}
      locale={{ emptyText }}
      className="rounded-lg border border-line bg-card"
    />
  );
}
