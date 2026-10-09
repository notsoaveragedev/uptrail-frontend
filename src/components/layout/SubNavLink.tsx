import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { NavLink } from "react-router";
import { usePreloadOnIntent } from "@/hooks/usePreloadOnIntent";

type SubNavLinkProps = {
  to: string;
  label: string;
  icon: IconType;
  badge?: ReactNode;
};

export function SubNavLink({ to, label, icon: Icon, badge }: SubNavLinkProps) {
  const preloadHandlers = usePreloadOnIntent(to);

  return (
    <NavLink
      to={to}
      {...preloadHandlers}
      className={({ isActive }) =>
        `flex h-8 shrink-0 items-center gap-2.5 rounded-md px-2.5 whitespace-nowrap ${isActive ? "bg-hover text-ink" : "text-muted hover:bg-hover hover:text-ink"}`
      }
    >
      <Icon aria-hidden className="size-4" />
      <span className="flex-1">{label}</span>
      {badge}
    </NavLink>
  );
}
