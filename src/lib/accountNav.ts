import type { IconType } from "react-icons";
import { LuBell, LuBuilding2, LuCircleUser, LuShieldCheck } from "react-icons/lu";

export const ACCOUNT_NAV: { key: string; label: string; icon: IconType }[] = [
  { key: "profile", label: "Profile", icon: LuCircleUser },
  { key: "security", label: "Security", icon: LuShieldCheck },
  { key: "notifications", label: "Notifications", icon: LuBell },
  { key: "organizations", label: "Organizations", icon: LuBuilding2 },
];
