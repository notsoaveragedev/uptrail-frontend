import { Link, useParams } from "react-router";
import { Logo } from "@/components/Logo";
import { paths } from "@/lib/paths";
import { OrgSwitcher } from "./OrgSwitcher";
import { ProjectSelect } from "./ProjectSelect";
import { SidebarNav } from "./SidebarNav";
import { StatusPageCard } from "./StatusPageCard";
import { UserMenu } from "./UserMenu";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { orgSlug = "" } = useParams();

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto bg-panel px-3 py-4">
      <Link
        to={paths.overview(orgSlug)}
        onClick={onNavigate}
        aria-label="Uptrail overview"
        className="w-fit rounded-md px-2"
      >
        <Logo />
      </Link>
      <div className="flex flex-col gap-2">
        <OrgSwitcher />
        <ProjectSelect />
      </div>
      <SidebarNav onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-3">
        <StatusPageCard />
        <UserMenu />
      </div>
    </div>
  );
}
