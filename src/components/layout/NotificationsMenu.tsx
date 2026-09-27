import { Badge, Button, Dropdown } from "antd";
import { LuBell } from "react-icons/lu";
import { notifications } from "@/mocks/workspace";

const TONE_DOT = {
  down: "bg-down",
  degraded: "bg-degraded",
  up: "bg-up",
  info: "bg-maintenance",
};

export function NotificationsMenu() {
  const unreadCount = notifications.filter((notification) => notification.isUnread).length;

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => (
        <div className="w-88 rounded-lg border border-line bg-card shadow-overlay">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-semibold">Notifications</span>
            <span className="font-mono text-xs text-subtle">{unreadCount} unread</span>
          </div>
          <ul className="max-h-96 divide-y divide-line overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex gap-3 px-4 py-3">
                <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${TONE_DOT[notification.tone]}`} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={notification.isUnread ? "font-medium text-ink" : "text-muted"}>
                    {notification.title}
                  </span>
                  <span className="text-xs text-subtle">{notification.detail}</span>
                </span>
                <span className="font-mono text-xs text-subtle">{notification.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    >
      <Badge count={unreadCount} size="small" offset={[-4, 4]}>
        <Button aria-label={`Notifications, ${unreadCount} unread`} icon={<LuBell className="size-4" />} />
      </Badge>
    </Dropdown>
  );
}
