import { NOTIFICATION_META } from "@/lib/notifications";
import { TONE_TEXT } from "@/lib/status";
import type { NotificationType } from "@/types/workspace";

export function NotificationIcon({ type }: { type: NotificationType }) {
  const { icon: Icon, tone, label } = NOTIFICATION_META[type];
  return <Icon aria-label={label} className={`size-4 shrink-0 ${tone ? TONE_TEXT[tone] : "text-muted"}`} />;
}
