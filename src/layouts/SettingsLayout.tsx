import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useParams } from "react-router";
import { invitationsQuery, membersQuery } from "@/api/members";
import { orgSettingsQuery } from "@/api/org";
import { SubNavLink } from "@/components/layout/SubNavLink";
import { CountBadge } from "@/components/ui/CountBadge";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { useNow } from "@/hooks/useNow";
import { useCurrentRole } from "@/hooks/usePermission";
import { pendingInvitations, seatsUsed } from "@/lib/members";
import { paths } from "@/lib/paths";
import { SETTINGS_NAV, type SettingsNavItem } from "@/lib/settingsNav";
import { SEAT_LIMIT } from "@/mocks/workspace";

export function SettingsLayout() {
  const { orgSlug = "" } = useParams();
  const { role, granted } = useCurrentRole();
  const { data: settings } = useQuery(orgSettingsQuery(orgSlug));
  const { data: members } = useQuery(membersQuery(orgSlug));
  const { data: invitations } = useQuery(invitationsQuery(orgSlug));
  const now = useNow(60_000);
  const pendingInvites = invitations && pendingInvitations(invitations, now).length;
  const groups = SETTINGS_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => granted.has(item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        meta={
          <MetaList>
            <span className="text-ink">{settings?.name ?? "…"}</span>
            <span>
              <span className="font-mono text-ink">
                {members && invitations ? seatsUsed(members, invitations, now) : "—"}
              </span>{" "}
              of <span className="font-mono">{SEAT_LIMIT}</span> seats
            </span>
            <span>
              Your role <span className="text-ink">{role.name}</span>
            </span>
          </MetaList>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
        <nav
          aria-label="Settings"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-0 lg:mx-0 lg:flex-col lg:gap-5 lg:self-start lg:overflow-visible lg:px-0"
        >
          {groups.map((group) => (
            <div key={group.label} className="flex gap-1 lg:flex-col lg:gap-0.5">
              <span className="hidden px-2.5 pb-1.5 text-caps font-semibold tracking-widest text-subtle uppercase lg:block">
                {group.label}
              </span>
              {group.items.map((item) => (
                <SettingsLink key={item.key} item={item} count={item.key === "members" ? pendingInvites : undefined} />
              ))}
            </div>
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function SettingsLink({ item, count }: { item: SettingsNavItem; count?: number }) {
  const { orgSlug = "" } = useParams();

  return (
    <SubNavLink
      to={paths.settings(orgSlug, item.key)}
      label={item.label}
      icon={item.icon}
      badge={
        count ? (
          <span title={`${count} pending invitations`}>
            <CountBadge count={count} isMuted />
          </span>
        ) : null
      }
    />
  );
}

export function SettingsIndexRedirect() {
  const { orgSlug = "" } = useParams();
  const { granted } = useCurrentRole();
  const first = SETTINGS_NAV.flatMap((group) => group.items).find((item) => granted.has(item.permission));
  return <Navigate to={first ? paths.settings(orgSlug, first.key) : paths.overview(orgSlug)} replace />;
}
