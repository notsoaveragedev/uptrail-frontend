import { Button, Table, Tag, Tooltip, type TableColumnsType } from "antd";
import { LuMonitor, LuSmartphone } from "react-icons/lu";
import { useRevokeSessions } from "@/api/account";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { StatusDot } from "@/components/ui/StatusDot";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { deviceLabel } from "@/lib/account";
import { formatDateTime } from "@/lib/format";
import type { AuthSession } from "@/types/account";

export function SessionsTable({ sessions }: { sessions: AuthSession[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const revoke = useRevokeSessions();

  async function revokeSession(session: AuthSession) {
    const isConfirmed = await confirm({
      title: `Sign out ${deviceLabel(session)}?`,
      description: `That device is signed out right away. Last used from ${session.location}.`,
      confirmLabel: "Sign out device",
      isDanger: true,
    });
    if (!isConfirmed) return;
    revoke.mutate([session.id]);
    toast.success("Device signed out", deviceLabel(session));
  }

  const columns: TableColumnsType<AuthSession> = [
    {
      title: "Device",
      key: "device",
      render: (_, session) => {
        const Icon = session.device === "mobile" ? LuSmartphone : LuMonitor;
        return (
          <span className="flex items-center gap-2.5">
            <Icon aria-hidden className="size-4 shrink-0 text-subtle" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-ink">{deviceLabel(session)}</span>
              <span className="flex items-center gap-2 truncate text-xs text-subtle">
                {session.isCurrent && <Tag className="m-0">This device</Tag>}
                {session.browser} · {session.os}
              </span>
            </span>
          </span>
        );
      },
    },
    { title: "Location", key: "location", width: 160, render: (_, session) => session.location },
    {
      title: "IP",
      key: "ip",
      width: 130,
      render: (_, session) => <span className="font-mono text-xs text-muted">{session.ip}</span>,
    },
    {
      title: "Last active",
      key: "lastSeen",
      width: 120,
      render: (_, session) =>
        session.isCurrent ? (
          <span className="flex items-center gap-1.5 text-xs text-up">
            <StatusDot /> Active now
          </span>
        ) : (
          <Tooltip title={`Signed in ${formatDateTime(session.createdAt)}`}>
            <span className="font-mono text-xs text-subtle">
              <TimeAgo timestamp={session.lastSeenAt} intervalMs={60_000} />
            </span>
          </Tooltip>
        ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 96,
      render: (_, session) =>
        !session.isCurrent && (
          <div className="row-actions flex justify-end">
            <Button size="small" onClick={() => revokeSession(session)}>
              Sign out
            </Button>
          </div>
        ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={sessions}
      tableLayout="fixed"
      scroll={{ x: 680 }}
      rowClassName="group"
      pagination={false}
      className="rounded-lg border border-line bg-card"
    />
  );
}
