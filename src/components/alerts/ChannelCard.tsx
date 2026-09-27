import { Button, Tooltip } from "antd";
import { LuPencil, LuSend, LuTrash2 } from "react-icons/lu";
import { useParams } from "react-router";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { Card } from "@/components/ui/Card";
import { MetaList } from "@/components/ui/MetaList";
import { useChannelTest } from "@/hooks/useChannelTest";
import { useToast } from "@/hooks/useToast";
import { channelTargetText, pluralRules } from "@/lib/alertLists";
import { TONE_BADGE } from "@/lib/status";
import type { AlertChannel } from "@/types/alerts";
import { ChannelIcon } from "./ChannelIcon";

type ChannelCardProps = {
  channel: AlertChannel;
  usedBy: number;
  onEdit: () => void;
  onDelete: () => void;
};

export function ChannelCard({ channel, usedBy, onEdit, onDelete }: ChannelCardProps) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const test = useChannelTest(orgSlug);

  async function sendTest() {
    const result = await test.send(channel);
    if (result.ok) toast.success("Test delivered", result.message);
    else toast.error(`Couldn't reach ${channel.name}`, result.message, { label: "Edit channel", onClick: onEdit });
  }

  return (
    <Card isInteractive className="group h-full">
      <div className="flex items-start gap-3 px-4 pt-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-panel">
          <ChannelIcon type={channel.type} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold">{channel.name}</span>
          <span className="truncate font-mono text-xs text-subtle">{channelTargetText(channel)}</span>
        </span>
        <span
          className={`shrink-0 rounded-sm px-1.5 py-0.5 text-caps font-semibold tracking-widest uppercase ${TONE_BADGE[channel.verified ? "up" : "degraded"]}`}
        >
          {channel.verified ? "Verified" : "Unverified"}
        </span>
      </div>
      <div className="mt-4 flex min-h-12 items-center justify-between gap-2 border-t border-line px-4 py-2">
        <MetaList className="text-xs text-subtle">
          <span>
            {channel.lastTestAt ? (
              <>
                Last test <TimeAgo timestamp={channel.lastTestAt} intervalMs={60_000} />
              </>
            ) : (
              "Never tested"
            )}
          </span>
          <span>Used by {pluralRules(usedBy)}</span>
        </MetaList>
        <span className="flex items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Tooltip title="Send test">
            <Button
              type="text"
              size="small"
              icon={<LuSend />}
              loading={test.isSending}
              aria-label={`Send test to ${channel.name}`}
              onClick={sendTest}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<LuPencil />} aria-label={`Edit ${channel.name}`} onClick={onEdit} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<LuTrash2 />}
              aria-label={`Delete ${channel.name}`}
              onClick={onDelete}
            />
          </Tooltip>
        </span>
      </div>
    </Card>
  );
}
