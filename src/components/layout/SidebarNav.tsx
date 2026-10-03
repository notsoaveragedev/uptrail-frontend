import { NavLink, useParams } from "react-router";
import { useCurrentRole } from "@/hooks/usePermission";
import { canSeeNavItem, NAV_GROUPS, SETTINGS_ITEM, type NavItem } from "@/lib/navigation";
import { paths } from "@/lib/paths";
import { TONE_BADGE } from "@/lib/status";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { granted } = useCurrentRole();

  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <span className="px-2.5 pb-1.5 text-caps font-semibold tracking-widest text-subtle uppercase">
            {group.label}
          </span>
          {group.items
            .filter((item) => canSeeNavItem(item, granted))
            .map((item) => (
              <SidebarLink key={item.label} item={item} onNavigate={onNavigate} />
            ))}
        </div>
      ))}
      {canSeeNavItem(SETTINGS_ITEM, granted) && (
        <div className="border-t border-line pt-3">
          <SidebarLink item={SETTINGS_ITEM} onNavigate={onNavigate} />
        </div>
      )}
    </nav>
  );
}

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const { orgSlug = "" } = useParams();
  const Icon = item.icon;

  return (
    <NavLink
      to={paths.section(orgSlug, item.path)}
      end={!item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex h-8 items-center gap-2.5 rounded-md px-2.5 ${
          isActive
            ? "bg-hover text-ink before:absolute before:inset-y-2 before:-left-3 before:w-0.75 before:rounded-r-sm before:bg-ink"
            : "text-muted hover:bg-hover hover:text-ink"
        }`
      }
    >
      <Icon aria-hidden className="size-4" />
      <span className="flex-1">{item.label}</span>
      {item.count !== undefined && (
        <span className={`rounded-sm px-1.5 font-mono text-xs ${item.isUrgent ? TONE_BADGE.down : "text-subtle"}`}>
          {item.count}
        </span>
      )}
    </NavLink>
  );
}
