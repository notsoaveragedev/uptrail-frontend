import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { PageHeader } from "@/components/ui/PageHeader";
import { paths } from "@/lib/paths";
import type { Dashboard } from "@/types/dashboard";
import { DashboardStatusLine } from "./DashboardStatusLine";

type DashboardHeaderProps = {
  dashboard: Dashboard;
  refreshedAt: number;
  actions: ReactNode;
};

export function DashboardHeader({ dashboard, refreshedAt, actions }: DashboardHeaderProps) {
  const { orgSlug = "" } = useParams();

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link to={paths.dashboards(orgSlug)}>Dashboards</Link>
        <span aria-hidden className="text-faint">
          /
        </span>
        <span aria-current="page" className="truncate text-ink">
          {dashboard.name}
        </span>
      </nav>
      <PageHeader
        title={dashboard.name}
        meta={<DashboardStatusLine project={dashboard.project} refreshedAt={refreshedAt} />}
        actions={actions}
      />
      {dashboard.description && <p className="-mt-1 max-w-2xl text-sm text-muted">{dashboard.description}</p>}
    </div>
  );
}
