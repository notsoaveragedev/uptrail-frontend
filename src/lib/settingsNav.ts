import type { IconType } from "react-icons";
import { LuBuilding2, LuCreditCard, LuKeyRound, LuScrollText, LuShieldCheck, LuUsers } from "react-icons/lu";

export type SettingsNavItem = { key: string; label: string; icon: IconType; permission: string };

export const SETTINGS_NAV: { label: string; items: SettingsNavItem[] }[] = [
  {
    label: "Organization",
    items: [
      { key: "general", label: "General", icon: LuBuilding2, permission: "org:settings" },
      { key: "members", label: "Members", icon: LuUsers, permission: "member:read" },
      { key: "roles", label: "Roles", icon: LuShieldCheck, permission: "role:read" },
      { key: "billing", label: "Usage & billing", icon: LuCreditCard, permission: "billing:read" },
    ],
  },
  {
    label: "Access",
    items: [
      { key: "api-keys", label: "API keys", icon: LuKeyRound, permission: "apikey:manage" },
      { key: "audit-log", label: "Audit log", icon: LuScrollText, permission: "auditlog:view" },
    ],
  },
];
