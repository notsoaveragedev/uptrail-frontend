import { useQuery } from "@tanstack/react-query";
import { Button, Table, type TableColumnsType } from "antd";
import { useState } from "react";
import { LuDownload, LuX } from "react-icons/lu";
import { subscribersQuery, useRemoveSubscriber, useRestoreSubscriber } from "@/api/statusPages";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { CustomInput } from "@/components/ui/CustomInput";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { downloadBlob } from "@/lib/download";
import { formatDay } from "@/lib/format";
import { filterSubscribers, subscribersCsv } from "@/lib/statusPages";
import type { StatusSubscriber } from "@/types/statusPage";

type SubscribersSectionProps = {
  orgSlug: string;
  pageId: string;
  slug: string;
};

const PAGE_SIZE = 8;

export function SubscribersSection({ orgSlug, pageId, slug }: SubscribersSectionProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: subscribers, isPending } = useQuery(subscribersQuery(orgSlug, pageId));
  const removeSubscriber = useRemoveSubscriber(orgSlug, pageId);
  const restoreSubscriber = useRestoreSubscriber(orgSlug, pageId);
  const [query, setQuery] = useState("");
  const visible = filterSubscribers(subscribers ?? [], query);

  async function remove(subscriber: StatusSubscriber) {
    const isConfirmed = await confirm({
      title: `Remove ${subscriber.email}?`,
      description: "They stop receiving incident updates. They can subscribe again from the status page.",
      confirmLabel: "Remove",
      isDanger: true,
    });
    if (!isConfirmed) return;
    removeSubscriber.mutate(subscriber.id, {
      onSuccess: () =>
        toast.success("Subscriber removed", subscriber.email, {
          label: "Undo",
          onClick: () => restoreSubscriber.mutate(subscriber),
        }),
      onError: () =>
        toast.error("Couldn't remove the subscriber", "Try again in a moment.", {
          label: "Retry",
          onClick: () => remove(subscriber),
        }),
    });
  }

  function exportCsv() {
    downloadBlob(new Blob([subscribersCsv(visible)], { type: "text/csv" }), `${slug}-subscribers.csv`);
    toast.success("Export ready", `${visible.length} subscribers saved as CSV.`);
  }

  const columns: TableColumnsType<StatusSubscriber> = [
    {
      title: "Email",
      key: "email",
      ellipsis: true,
      render: (_, subscriber) => <span className="font-mono text-xs">{subscriber.email}</span>,
    },
    {
      title: "Status",
      key: "status",
      width: 88,
      render: (_, subscriber) => (
        <StatusBadge
          status={subscriber.confirmed ? "up" : "paused"}
          label={subscriber.confirmed ? "Confirmed" : "Pending"}
        />
      ),
    },
    {
      title: "Since",
      key: "since",
      width: 64,
      render: (_, subscriber) => (
        <span className="font-mono text-xs text-muted">{formatDay(subscriber.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      width: 32,
      render: (_, subscriber) => (
        <Button
          type="text"
          size="small"
          aria-label={`Remove ${subscriber.email}`}
          icon={<LuX />}
          onClick={() => remove(subscriber)}
          className="text-subtle opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <CustomInput
            type="search"
            size="middle"
            aria-label="Search subscribers"
            placeholder="Search emails"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button icon={<LuDownload />} disabled={visible.length === 0} onClick={exportCsv}>
          CSV
        </Button>
      </div>
      <Table<StatusSubscriber>
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={visible}
        loading={isPending}
        onRow={() => ({ className: "group/row" })}
        pagination={visible.length > PAGE_SIZE ? { pageSize: PAGE_SIZE, size: "small", showSizeChanger: false } : false}
        locale={{ emptyText: query ? `No subscribers match “${query}”.` : "No subscribers yet." }}
        tableLayout="fixed"
      />
    </div>
  );
}
