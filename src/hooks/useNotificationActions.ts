import { useNavigate, useParams } from "react-router";
import { useMarkNotifications } from "@/api/notifications";
import { notificationPath } from "@/lib/notifications";
import type { AppNotification } from "@/types/workspace";
import { useToast } from "./useToast";

export function useNotificationActions() {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const mark = useMarkNotifications(orgSlug);

  function setRead(items: AppNotification[], isUnread: boolean) {
    mark.mutate({ ids: items.map((item) => item.id), isUnread });
  }

  function markAllRead(unread: AppNotification[]) {
    setRead(unread, false);
    toast.success(`${unread.length} marked as read`, undefined, {
      label: "Undo",
      onClick: () => setRead(unread, true),
    });
  }

  function open(item: AppNotification) {
    if (item.isUnread) setRead([item], false);
    const path = notificationPath(orgSlug, item);
    if (path) navigate(path);
  }

  return { setRead, markAllRead, open };
}
