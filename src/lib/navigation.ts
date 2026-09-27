import type { IconType } from "react-icons";
import {
  LuActivity,
  LuBell,
  LuChartColumn,
  LuGlobe,
  LuLayoutGrid,
  LuScrollText,
  LuSettings,
  LuSiren,
  LuWrench,
} from "react-icons/lu";

export type NavItem = {
  label: string;
  path: string;
  icon: IconType;
  count?: number;
  isUrgent?: boolean;
};

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Monitoring",
    items: [
      { label: "Overview", path: "", icon: LuLayoutGrid },
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
      { label: "Maintenance", path: "maintenance", icon: LuWrench },
      { label: "Status pages", path: "status-pages", icon: LuGlobe },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = { label: "Settings", path: "settings", icon: LuSettings };

export const ALL_NAV_ITEMS = [...NAV_GROUPS.flatMap((group) => group.items), SETTINGS_ITEM];

export function findNavItem(pathname: string, orgSlug: string) {
  const rest = pathname.replace(`/o/${orgSlug}`, "").replace(/^\//, "");
  return ALL_NAV_ITEMS.find((item) => (item.path ? rest.startsWith(item.path) : rest === ""));
}
