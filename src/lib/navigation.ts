import type { IconType } from "react-icons";
import {
  LuActivity,
  LuBell,
  LuChartColumn,
  LuFolder,
  LuInbox,
  LuGlobe,
  LuLayoutGrid,
  LuScrollText,
  LuSettings,
  LuSiren,
  LuWrench,
} from "react-icons/lu";
import { paths } from "./paths";
import { SETTINGS_NAV } from "./settingsNav";

export type NavItem = {
  label: string;
  path: string;
  icon: IconType;
  count?: number;
  isUrgent?: boolean;
  permissions?: string[];
};

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Monitoring",
    items: [
      { label: "Overview", path: "", icon: LuLayoutGrid },
      { label: "Projects", path: "projects", icon: LuFolder, permissions: ["project:read"] },
      { label: "Monitors", path: "monitors", icon: LuActivity, count: 42 },
      { label: "Logs", path: "logs", icon: LuScrollText },
      { label: "Dashboards", path: "dashboards", icon: LuChartColumn },
    ],
  },
  {
    label: "Response",
    items: [
      { label: "Alerts", path: "alerts", icon: LuBell },
      { label: "Incidents", path: "incidents", icon: LuSiren, count: 1, isUrgent: true },
      { label: "Maintenance", path: "maintenance", icon: LuWrench, permissions: ["monitor:update"] },
      { label: "Status pages", path: "status-pages", icon: LuGlobe },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  path: "settings",
  icon: LuSettings,
  permissions: SETTINGS_NAV.flatMap((group) => group.items.map((item) => item.permission)),
};

const NOTIFICATIONS_ITEM: NavItem = { label: "Notifications", path: "notifications", icon: LuInbox };

export const ALL_NAV_ITEMS = [...NAV_GROUPS.flatMap((group) => group.items), SETTINGS_ITEM, NOTIFICATIONS_ITEM];

export function canSeeNavItem(item: NavItem, granted: Set<string>) {
  return !item.permissions || item.permissions.some((permission) => granted.has(permission));
}

export function findNavItem(pathname: string, orgSlug: string) {
  const rest = pathname.replace(paths.overview(orgSlug), "").replace(/^\//, "");
  return ALL_NAV_ITEMS.find((item) => (item.path ? rest.startsWith(item.path) : rest === ""));
}
