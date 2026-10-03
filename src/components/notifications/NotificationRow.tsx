import { Button, Checkbox, Tooltip } from "antd";
import { LuMail, LuMailOpen } from "react-icons/lu";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { formatDateTime } from "@/lib/format";
import { projectLabel } from "@/lib/monitors";
import type { AppNotification } from "@/types/workspace";
import { NotificationIcon } from "./NotificationIcon";

type NotificationRowProps = {
  item: AppNotification;
  isSelected?: boolean;
  isSelecting?: boolean;
  isCompact?: boolean;
  onSelect?: (isSelected: boolean) => void;
  onOpen: () => void;
  onToggleRead?: () => void;
};

export function NotificationRow({
  item,
  isSelected = false,
  isSelecting = false,
  isCompact = false,
  onSelect,
  onOpen,
  onToggleRead,
}: NotificationRowProps) {
  return (
    <li
      className={`group flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-hover ${isSelected ? "bg-hover" : ""}`}
    >
      {onSelect && (
        <Checkbox
          aria-label={`Select ${item.title}`}
          checked={isSelected}
          onChange={(event) => onSelect(event.target.checked)}
          className={`mt-0.5 transition-opacity group-hover:opacity-100 focus-within:opacity-100 ${isSelecting ? "opacity-100" : "opacity-0"}`}
        />
      )}
      <span
        aria-hidden
        className={`mt-2 size-1.5 shrink-0 rounded-full ${item.isUnread ? "bg-accent" : "bg-transparent"}`}
      />
      <span className="mt-0.5">
        <NotificationIcon type={item.type} />
      </span>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 cursor-pointer flex-col text-left">
        <span className={`truncate ${item.isUnread ? "font-medium text-ink" : "text-muted"}`}>{item.title}</span>
        <span className="truncate text-xs text-subtle">
          {item.detail}
          {!isCompact && item.project && ` · ${projectLabel(item.project)}`}
        </span>
        {item.isUnread && <span className="sr-only">Unread</span>}
      </button>
      <Tooltip title={formatDateTime(item.at)}>
        <span className="mt-0.5 shrink-0 font-mono text-xs text-subtle">
          <TimeAgo timestamp={item.at} intervalMs={60_000} />
        </span>
      </Tooltip>
      {onToggleRead && (
        <Tooltip title={item.isUnread ? "Mark as read" : "Mark as unread"}>
          <Button
            size="small"
            type="text"
            aria-label={item.isUnread ? `Mark ${item.title} as read` : `Mark ${item.title} as unread`}
            icon={item.isUnread ? <LuMailOpen /> : <LuMail />}
            onClick={onToggleRead}
            className="row-actions -my-0.5"
          />
        </Tooltip>
      )}
    </li>
  );
}
