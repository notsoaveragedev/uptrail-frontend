import { Tooltip } from "antd";
import type { AlertChannel } from "@/types/alerts";
import { ChannelIcon } from "./ChannelIcon";

const MAX_VISIBLE = 3;

export function ChannelStack({ channels }: { channels: AlertChannel[] }) {
  if (channels.length === 0) return <span className="text-subtle">—</span>;
  const hidden = channels.length - MAX_VISIBLE;

  return (
    <Tooltip title={channels.map((channel) => channel.name).join(", ")}>
      <span className="flex items-center gap-1.5" aria-label={`Notifies ${channels.map((c) => c.name).join(", ")}`}>
        {channels.slice(0, MAX_VISIBLE).map((channel) => (
          <ChannelIcon key={channel.id} type={channel.type} className="size-3.5" />
        ))}
        {hidden > 0 && <span className="font-mono text-xs text-subtle">+{hidden}</span>}
      </span>
    </Tooltip>
  );
}
