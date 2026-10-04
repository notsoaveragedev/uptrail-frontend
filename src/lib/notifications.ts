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
import type { NotificationPreference } from "@/types/account";
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

export const PREFERENCE_GROUPS: { label: string; types: NotificationType[] }[] = [
  { label: "Monitors", types: ["monitor_down", "monitor_up", "ssl_expiring"] },
  { label: "Alerts & incidents", types: ["alert_fired", "incident_created", "incident_updated"] },
  { label: "Organization", types: ["invite_accepted", "role_changed"] },
];

export const PREFERENCE_DESCRIPTIONS: Record<NotificationType, string> = {
  monitor_down: "A monitor fails its check in 2 or more regions.",
  monitor_up: "A monitor that was down passes again.",
  ssl_expiring: "A certificate expires in 14 days or less.",
  alert_fired: "An alert rule's condition becomes true.",
  incident_created: "Someone declares an incident, or one opens automatically.",
  incident_updated: "An incident changes status or gets a new update.",
  invite_accepted: "Someone you invited joins the organization.",
  role_changed: "Your role changes in any organization or project.",
};

export const LOCKED_EMAIL_TYPES: NotificationType[] = ["role_changed"];

const ORG_TYPES: NotificationType[] = ["invite_accepted", "role_changed"];

export function isProjectScoped(type: NotificationType) {
  return !ORG_TYPES.includes(type);
}

export type PreferenceChannel = "inApp" | "email";

const CRITICAL: NotificationType[] = [
  "monitor_down",
  "alert_fired",
  "incident_created",
  "ssl_expiring",
  "role_changed",
];

export const PREFERENCE_PRESETS: {
  key: string;
  label: string;
  apply: (type: NotificationType) => { inApp: boolean; email: boolean };
}[] = [
  { key: "everything", label: "Everything", apply: () => ({ inApp: true, email: true }) },
  {
    key: "critical",
    label: "Only critical",
    apply: (type) => ({ inApp: CRITICAL.includes(type), email: CRITICAL.includes(type) }),
  },
  { key: "in-app", label: "In-app only", apply: (type) => ({ inApp: true, email: LOCKED_EMAIL_TYPES.includes(type) }) },
];

export function applyPreset(preferences: NotificationPreference[], presetKey: string) {
  const preset = PREFERENCE_PRESETS.find((item) => item.key === presetKey);
  return preset ? preferences.map((item) => ({ ...item, ...preset.apply(item.type) })) : preferences;
}

export function matchingPreset(preferences: NotificationPreference[]) {
  return PREFERENCE_PRESETS.find((preset) =>
    preferences.every((item) => {
      const expected = preset.apply(item.type);
      return item.inApp === expected.inApp && item.email === expected.email;
    }),
  )?.key;
}

export function countPreferenceChanges(saved: NotificationPreference[], draft: NotificationPreference[]) {
  return draft.reduce((count, item, index) => {
    const before = saved[index];
    return (
      count +
      Number(item.inApp !== before.inApp) +
      Number(item.email !== before.email) +
      Number(item.projects.join() !== before.projects.join())
    );
  }, 0);
}
