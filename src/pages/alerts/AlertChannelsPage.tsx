import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { lazy, Suspense, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { useParams } from "react-router";
import { alertChannelsQuery, alertRulesQuery, useDeleteAlertChannel, useSaveAlertChannel } from "@/api/alerts";
import { AddChannelCard } from "@/components/alerts/AddChannelCard";
import { ChannelCard } from "@/components/alerts/ChannelCard";
import { ChannelGridSkeleton } from "@/components/alerts/ChannelGridSkeleton";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { MetaList } from "@/components/ui/MetaList";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { countRulesUsing, pluralRules } from "@/lib/alertLists";
import { importWithReload } from "@/lib/lazyPage";
import type { AlertChannel } from "@/types/alerts";

const ChannelModal = lazy(() =>
  importWithReload(() => import("@/components/alerts/ChannelModal")).then((module) => ({
    default: module.ChannelModal,
  })),
);

type ModalState = { isOpen: boolean; channel: AlertChannel | null };

export function AlertChannelsPage() {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: channels = [], isPending } = useQuery(alertChannelsQuery(orgSlug));
  const { data: rules = [] } = useQuery(alertRulesQuery(orgSlug));
  const deleteChannel = useDeleteAlertChannel(orgSlug);
  const saveChannel = useSaveAlertChannel(orgSlug);
  const [modal, setModal] = useState<ModalState | null>(null);

  const openModal = (channel: AlertChannel | null) => setModal({ isOpen: true, channel });

  async function remove(channel: AlertChannel) {
    const usedBy = countRulesUsing(rules, channel.id);
    const isConfirmed = await confirm({
      title: `Delete ${channel.name}?`,
      description:
        usedBy > 0
          ? `Used by ${pluralRules(usedBy)}. They will stop notifying this channel.`
          : "No rules use this channel.",
      confirmLabel: "Delete",
      isDanger: true,
    });
    if (!isConfirmed) return;
    deleteChannel.mutate(channel.id);
    toast.success("Channel deleted", channel.name, { label: "Undo", onClick: () => saveChannel.mutate(channel) });
  }

  return (
    <>
      <title>Alert channels · Uptrail</title>
      <div className="flex flex-col gap-4 pt-4 pb-10">
        <div className="flex items-center justify-between gap-3">
          <MetaList className={`text-muted ${isPending ? "invisible" : ""}`}>
            <span>
              <span className="font-mono text-ink">{channels.length}</span> channels
            </span>
            <span>
              <span className="font-mono text-up">{channels.filter((channel) => channel.verified).length}</span>{" "}
              verified
            </span>
          </MetaList>
          <Button type="primary" icon={<LuPlus />} onClick={() => openModal(null)}>
            Add channel
          </Button>
        </div>
        <SectionErrorBoundary>
          {isPending ? (
            <ChannelGridSkeleton />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <ChannelCard
                    channel={channel}
                    usedBy={countRulesUsing(rules, channel.id)}
                    onEdit={() => openModal(channel)}
                    onDelete={() => remove(channel)}
                  />
                </li>
              ))}
              <li>
                <AddChannelCard isEmpty={channels.length === 0} onClick={() => openModal(null)} />
              </li>
            </ul>
          )}
        </SectionErrorBoundary>
      </div>
      <Suspense fallback={null}>
        {modal && (
          <ChannelModal
            open={modal.isOpen}
            channel={modal.channel}
            onClose={() => setModal({ ...modal, isOpen: false })}
          />
        )}
      </Suspense>
    </>
  );
}
