import { Button } from "antd";
import { LuMenu, LuSearch } from "react-icons/lu";
import { Link, useLocation, useParams } from "react-router";
import { findNavItem } from "@/lib/navigation";
import { paths } from "@/lib/paths";
import { findOrganization } from "@/lib/currentOrg";
import { NotificationsMenu } from "./NotificationsMenu";
import { ThemeToggle } from "./ThemeToggle";

type TopBarProps = {
  onOpenSearch: () => void;
  onOpenMenu: () => void;
};

export function TopBar({ onOpenSearch, onOpenMenu }: TopBarProps) {
  const { orgSlug = "" } = useParams();
  const { pathname } = useLocation();
  const org = findOrganization(orgSlug);
  const page = findNavItem(pathname, orgSlug);

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line px-4 lg:px-8">
      <Button
        aria-label="Open navigation"
        icon={<LuMenu className="size-4" />}
        onClick={onOpenMenu}
        className="lg:hidden"
      />

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-muted sm:flex">
        <Link to={paths.overview(orgSlug)} className="truncate text-muted hover:text-ink">
          {org.name}
        </Link>
        {page && (
          <>
            <span className="text-faint">/</span>
            <span aria-current="page" className="text-ink">
              {page.label}
            </span>
          </>
        )}
      </nav>

      <button
        type="button"
        onClick={onOpenSearch}
        className="mx-auto flex h-8 w-full max-w-md cursor-pointer items-center gap-2 rounded-md border border-line bg-card px-3 text-subtle hover:border-line-strong"
      >
        <LuSearch aria-hidden className="size-4" />
        <span className="flex-1 text-left">Search monitors, incidents, pages…</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsMenu />
      </div>
    </header>
  );
}
