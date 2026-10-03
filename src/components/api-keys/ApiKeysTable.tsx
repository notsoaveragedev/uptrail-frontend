import { Button, Table, Tooltip, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { LuBan } from "react-icons/lu";
import { useParams } from "react-router";
import { useSaveApiKey } from "@/api/apiKeys";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { ExpiresIn } from "@/components/ui/ExpiresIn";
import { PersonCell } from "@/components/ui/PersonCell";
import { useConfirm } from "@/hooks/useConfirm";
import { useNow } from "@/hooks/useNow";
import { useToast } from "@/hooks/useToast";
import { apiKeyStatus } from "@/lib/apiKeys";
import { DAY_MS } from "@/lib/dates";
import { formatAgo, formatDateTime, formatDay } from "@/lib/format";
import { projectLabel } from "@/lib/monitors";
import type { ApiKey, ApiKeyStatus } from "@/types/apiKey";
import type { MonitorStatus } from "@/types/monitor";
import { ScopeList } from "./ScopeList";

const STATUS_BADGE: Record<ApiKeyStatus, { status: MonitorStatus; label: string }> = {
  active: { status: "up", label: "Active" },
  expired: { status: "degraded", label: "Expired" },
  revoked: { status: "paused", label: "Revoked" },
};

export function ApiKeysTable({ keys, emptyText }: { keys: ApiKey[]; emptyText: ReactNode }) {
  const { orgSlug = "" } = useParams();
  const now = useNow(60_000);
  const toast = useToast();
  const confirm = useConfirm();
  const save = useSaveApiKey(orgSlug);

  async function revoke(key: ApiKey) {
    const isConfirmed = await confirm({
      title: `Revoke ${key.name}?`,
      description: `Requests using ${key.prefix}… fail right away. This can't be undone.${key.lastUsedAt ? ` Last used ${formatAgo(key.lastUsedAt, Date.now())}${key.lastUsedIp ? ` from ${key.lastUsedIp}` : ""}.` : ""}`,
      confirmLabel: "Revoke key",
      isDanger: true,
    });
    if (!isConfirmed) return;
    save.mutate({ ...key, revokedAt: Date.now() });
    toast.success("Key revoked", key.name);
  }

  const columns: TableColumnsType<ApiKey> = [
    {
      title: "Name",
      key: "name",
      render: (_, key) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-ink">{key.name}</span>
          <span className="truncate font-mono text-xs whitespace-nowrap text-subtle">{key.prefix}••••</span>
        </span>
      ),
    },
    { title: "Scopes", key: "scopes", width: 170, render: (_, key) => <ScopeList permissions={key.permissions} /> },
    {
      title: "Projects",
      key: "projects",
      width: 110,
      render: (_, key) =>
        key.projects ? (
          <span className="truncate">{key.projects.map(projectLabel).join(", ")}</span>
        ) : (
          <span className="text-subtle">All projects</span>
        ),
    },
    {
      title: "Created by",
      key: "createdBy",
      width: 150,
      render: (_, key) => (
        <Tooltip title={`Created ${formatDay(key.createdAt)}`}>
          <span>
            <PersonCell name={key.createdBy} isMuted />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Last used",
      key: "lastUsed",
      width: 104,
      render: (_, key) =>
        key.lastUsedAt ? (
          <Tooltip title={`${formatDateTime(key.lastUsedAt)} · ${key.lastUsedIp}`}>
            <span className="font-mono text-xs text-muted">
              <TimeAgo timestamp={key.lastUsedAt} intervalMs={60_000} />
            </span>
          </Tooltip>
        ) : (
          <span className="text-xs text-subtle">Never</span>
        ),
    },
    {
      title: "Expires",
      key: "expires",
      width: 90,
      render: (_, key) => {
        const status = apiKeyStatus(key, now);
        if (status !== "active") return <StatusBadge {...STATUS_BADGE[status]} />;
        if (key.expiresAt === null) return <span className="text-xs text-subtle">Never</span>;
        return <ExpiresIn expiresAt={key.expiresAt} warnWithinMs={14 * DAY_MS} />;
      },
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 96,
      render: (_, key) =>
        apiKeyStatus(key, now) === "active" && (
          <div className="row-actions flex justify-end">
            <Button size="small" danger icon={<LuBan />} onClick={() => revoke(key)}>
              Revoke
            </Button>
          </div>
        ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={keys}
      tableLayout="fixed"
      scroll={{ x: 880 }}
      rowClassName="group"
      pagination={false}
      locale={{ emptyText }}
      className="rounded-lg border border-line bg-card"
    />
  );
}
