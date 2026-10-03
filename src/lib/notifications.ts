import type { IconType } from "react-icons";
import {
  LuBellRing,
  LuCircleCheck,
  LuCircleX,
  LuLock,
  LuShield,
  LuSiren,
  LuMessageSquareText,
  LuUserPlus,
} from "react-icons/lu";
import type { AppNotification, NotificationType } from "@/types/workspace";
import { paths } from "./paths";
import { readList } from "./searchParams";
import type { Tone } from "./status";
import { matchesAny, matchesText } from "./list";

export const NOTIFICATION_META: Record<NotificationType, { label: string; icon: IconType; tone: Tone | null }> = {
  monitor_down: { label: "Monitor down", icon: LuCircleX, tone: "down" },
  monitor_up: { label: "Monitor recovered", icon: LuCircleCheck, tone: "up" },
  alert_fired: { label: "Alert fired", icon: LuBellRing, tone: "degraded" },
  incident_created: { label: "Incident declared", icon: LuSiren, tone: "down" },
  incident_updated: { label: "Incident update", icon: LuMessageSquareText, tone: null },
  ssl_expiring: { label: "SSL expiring", icon: LuLock, tone: "degraded" },
  invite_accepted: { label: "Member joined", icon: LuUserPlus, tone: null },
  role_changed: { label: "Role changed", icon: LuShield, tone: null },
};

export const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_META) as NotificationType[];

export const NOTIFICATION_FILTER_KEYS = ["q", "type", "project", "unread"];

export function readNotificationFilters(params: URLSearchParams) {
  return {
    query: params.get("q") ?? "",
    types: readList(params, "type"),
    projects: readList(params, "project"),
    isUnreadOnly: params.get("unread") === "1",
  };
}

export function filterNotifications(items: AppNotification[], filters: ReturnType<typeof readNotificationFilters>) {
  return items.filter(
    (item) =>
      (!filters.isUnreadOnly || item.isUnread) &&
      matchesAny(filters.types, item.type) &&
      matchesAny(filters.projects, item.project ?? []) &&
      matchesText(filters.query, item.title, item.detail),
  );
}

export function notificationPath(orgSlug: string, item: AppNotification) {
  return item.href ? `${paths.overview(orgSlug)}/${item.href}` : null;
}
