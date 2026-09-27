import { FaDiscord, FaSlack } from "react-icons/fa";
import { LuMail, LuWebhook } from "react-icons/lu";
import { CHANNEL_TYPE_LABELS } from "@/lib/alerts";
import type { ChannelType } from "@/types/alerts";

const ICONS = {
  email: LuMail,
  slack: FaSlack,
  discord: FaDiscord,
  webhook: LuWebhook,
};

export function ChannelIcon({ type, className = "size-4" }: { type: ChannelType; className?: string }) {
  const Icon = ICONS[type];
  return <Icon aria-label={CHANNEL_TYPE_LABELS[type]} className={`shrink-0 text-muted ${className}`} />;
}
