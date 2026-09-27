import { Tooltip } from "antd";
import { escalationText } from "@/lib/alertLists";
import { formatClock } from "@/lib/format";
import type { AlertChannel, AlertDelivery } from "@/types/alerts";
import { ChannelIcon } from "./ChannelIcon";

type DeliveryIconsProps = {
  deliveries: AlertDelivery[];
  channels: AlertChannel[];
};

export function DeliveryIcons({ deliveries, channels }: DeliveryIconsProps) {
  return (
    <span className="flex items-center gap-2.5">
      {deliveries.map((delivery, index) => {
        const channel = channels.find((item) => item.id === delivery.channelId);
        const name = channel?.name ?? "Deleted channel";
        return (
          <Tooltip
            key={index}
            title={
              <span className="flex flex-col text-xs">
                <span className="font-medium">
                  {name} · {delivery.ok ? "delivered" : "failed"}
                </span>
                <span className="text-muted">
                  {escalationText(delivery.escalationStep)} · {formatClock(delivery.at)}
                </span>
                {delivery.error && <span className="text-down">{delivery.error}</span>}
              </span>
            }
          >
            <span
              tabIndex={0}
              aria-label={`${name}: ${delivery.ok ? "delivered" : `failed, ${delivery.error ?? "unknown error"}`}`}
              className="relative flex rounded-xs focus-visible:outline-1 focus-visible:outline-line-strong"
            >
              {channel ? <ChannelIcon type={channel.type} className="size-3.5" /> : <span className="size-3.5" />}
              <span
                aria-hidden
                className={`absolute -right-1 -bottom-0.5 size-1.5 rounded-full ring-2 ring-card ${delivery.ok ? "bg-up" : "bg-down"}`}
              />
            </span>
          </Tooltip>
        );
      })}
    </span>
  );
}
