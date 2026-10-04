import { useQuery } from "@tanstack/react-query";
import { Dropdown } from "antd";
import { LuArrowLeft, LuLogOut } from "react-icons/lu";
import { Link, Navigate, Outlet } from "react-router";
import { accountOrganizationsQuery, accountQuery, securityQuery } from "@/api/account";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { Logo } from "@/components/Logo";
import { SubNavLink } from "@/components/layout/SubNavLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { useRouteFocus } from "@/hooks/useRouteFocus";
import { useLogOut } from "@/hooks/useLogOut";
import { needsSecurityAttention } from "@/lib/account";
import { ACCOUNT_NAV } from "@/lib/accountNav";
import { plural } from "@/lib/format";
import { lastOrg } from "@/lib/currentOrg";
import { paths } from "@/lib/paths";

export function AccountLayout() {
  const org = lastOrg();
  const { data: account } = useQuery(accountQuery);
  const { data: security } = useQuery(securityQuery);
  const { data: organizations } = useQuery(accountOrganizationsQuery);

  useRouteFocus();

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-panel px-4 lg:px-8">
        <Link to={paths.overview(org.slug)} aria-label={`${org.name} overview`} className="rounded-md">
          <Logo />
        </Link>
        <Link to={paths.overview(org.slug)} className="flex items-center gap-1.5 text-muted hover:text-ink">
          <LuArrowLeft aria-hidden className="size-4" />
          Back to {org.name}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu name={account?.name ?? null} />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 lg:px-8">
          <PageHeader
            title="Account"
            meta={
              account &&
              security &&
              organizations && (
                <MetaList>
                  <span className="text-ink">{account.name}</span>
                  <span>{account.email}</span>
                  <span className={security.twoFactorEnabledAt ? "" : "text-degraded"}>
                    2FA {security.twoFactorEnabledAt ? "on" : "off"}
                  </span>
                  <span>{plural(organizations.length, "organization")}</span>
                </MetaList>
              )
            }
          />
          <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
            <nav
              aria-label="Account"
              className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-0 lg:mx-0 lg:flex-col lg:gap-0.5 lg:self-start lg:overflow-visible lg:px-0"
            >
              {ACCOUNT_NAV.map((item) => (
                <SubNavLink
                  key={item.key}
                  to={paths.account(item.key)}
                  label={item.label}
                  icon={item.icon}
                  badge={
                    item.key === "security" &&
                    security &&
                    needsSecurityAttention(security) && (
                      <span
                        title="2FA is off or backup codes are running low"
                        className="size-1.5 rounded-full bg-degraded"
                      >
                        <span className="sr-only">Needs attention</span>
                      </span>
                    )
                  }
                />
              ))}
            </nav>
            <div className="flex min-w-0 flex-col gap-5">
              <SectionErrorBoundary>
                <Outlet />
              </SectionErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AccountMenu({ name }: { name: string | null }) {
  const logOut = useLogOut();

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{ items: [{ key: "logout", icon: <LuLogOut />, label: "Log out", danger: true, onClick: logOut }] }}
    >
      <button type="button" aria-label="Account menu" className="cursor-pointer rounded-full">
        <PersonAvatar name={name} size="default" hasTooltip={false} />
      </button>
    </Dropdown>
  );
}

export function AccountIndexRedirect() {
  return <Navigate to={paths.account()} replace />;
}
