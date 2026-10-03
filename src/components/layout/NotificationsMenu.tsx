import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Dropdown } from "antd";
import { useState } from "react";
import { LuBell } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { notificationsQuery } from "@/api/notifications";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { paths } from "@/lib/paths";
import type { AppNotification } from "@/types/workspace";

const PREVIEW_COUNT = 6;

export function NotificationsMenu() {
  const { orgSlug = "" } = useParams();
  const { data: notifications = [] } = useQuery(notificationsQuery(orgSlug));
  const actions = useNotificationActions();
  const [isOpen, setIsOpen] = useState(false);
  const unread = notifications.filter((item) => item.isUnread);

  function openItem(item: AppNotification) {
    setIsOpen(false);
    actions.open(item);
  }

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      open={isOpen}
      onOpenChange={setIsOpen}
      popupRender={() => (
        <div className="w-96 overflow-hidden rounded-lg border border-line bg-card shadow-overlay">
          <div className="flex items-center justify-between border-b border-line py-2 pr-2 pl-4">
            <span className="font-semibold">Notifications</span>
            <Button size="small" type="text" disabled={unread.length === 0} onClick={() => actions.markAllRead(unread)}>
              Mark all read
            </Button>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && <li className="px-4 py-6 text-center text-subtle">No notifications yet</li>}
            {notifications.slice(0, PREVIEW_COUNT).map((item) => (
              <NotificationRow key={item.id} item={item} isCompact onOpen={() => openItem(item)} />
            ))}
          </ul>
          <Link
            to={paths.notifications(orgSlug)}
            onClick={() => setIsOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-xs font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    >
      <Badge count={unread.length} size="small" offset={[-4, 4]}>
        <Button
          aria-label={`Notifications, ${unread.length} unread`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          icon={<LuBell className="size-4" />}
        />
      </Badge>
    </Dropdown>
  );
}
