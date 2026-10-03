import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { Suspense } from "react";
import { LuPencil } from "react-icons/lu";
import { useParams, useSearchParams } from "react-router";
import { dashboardQuery } from "@/api/dashboards";
import { DashboardGrid } from "@/components/dashboards/DashboardGrid";
import { DashboardHeader } from "@/components/dashboards/DashboardHeader";
import { DashboardSkeleton } from "@/components/dashboards/DashboardSkeleton";
import { useDashboardRefresh } from "@/components/dashboards/useDashboardRefresh";
import { ViewControls } from "@/components/dashboards/ViewControls";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { useInterval } from "@/hooks/useInterval";
import { useSearchParam } from "@/hooks/useSearchParam";
import { DASHBOARD_RANGES, refreshSeconds, refreshValue, REFRESH_VALUES } from "@/lib/dashboards";
import { lazyComponent } from "@/lib/lazyPage";
import { writeParam } from "@/lib/searchParams";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";
import type { Dashboard } from "@/types/dashboard";

const DashboardEditor = lazyComponent(() => import("@/components/dashboards/DashboardEditor"), "DashboardEditor");

export function DashboardPage() {
  const { orgSlug = "", dashboardId = "" } = useParams();
  const { data: dashboard, isPending } = useQuery(dashboardQuery(orgSlug, dashboardId));

  if (isPending) return <DashboardSkeleton />;
  if (!dashboard) return <InAppNotFoundPage />;

  return <DashboardScreen key={dashboard.id} dashboard={dashboard} />;
}

function DashboardScreen({ dashboard }: { dashboard: Dashboard }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditing = searchParams.get("edit") === "1";
  const [range, setRange] = useSearchParam("range", DASHBOARD_RANGES, dashboard.timeRange, { replace: true });
  const [refresh, setRefresh] = useSearchParam("refresh", REFRESH_VALUES, refreshValue(dashboard.refreshSec), {
    replace: true,
  });
  const { refreshedAt, refreshAll, refreshWidget } = useDashboardRefresh();
  const refreshMs = refreshSeconds(refresh);

  useInterval(refreshAll, isEditing || refreshMs === null ? null : refreshMs * 1000);

  function setEditing(isOn: boolean) {
    setSearchParams((params) => writeParam(params, "edit", isOn ? "1" : null));
  }

  return (
    <>
      <title>{`${dashboard.name} · Uptrail`}</title>
      {isEditing ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardEditor
            dashboard={dashboard}
            range={range}
            refreshedAt={refreshedAt}
            onExit={() => setEditing(false)}
          />
        </Suspense>
      ) : (
        <div className="flex flex-col gap-5 pb-8">
          <DashboardHeader
            dashboard={dashboard}
            refreshedAt={refreshedAt}
            actions={
              <ViewControls
                dashboardId={dashboard.id}
                range={range}
                onRangeChange={setRange}
                refresh={refresh}
                onRefreshChange={setRefresh}
                onRefreshNow={refreshAll}
                onEdit={() => setEditing(true)}
              />
            }
          />
          <SectionErrorBoundary>
            {dashboard.widgets.length > 0 ? (
              <DashboardGrid
                dashboard={dashboard}
                range={range}
                onRefreshWidget={(widget) => refreshWidget(widget, range)}
              />
            ) : (
              <EmptyDashboard onEdit={() => setEditing(true)} />
            )}
          </SectionErrorBoundary>
        </div>
      )}
    </>
  );
}

function EmptyDashboard({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong p-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-md font-semibold">Add your first widget</h2>
        <p className="text-muted">Charts, KPIs, heatmaps and live logs snap onto a 12-column grid.</p>
      </div>
      <Button type="primary" icon={<LuPencil />} onClick={onEdit}>
        Start editing
      </Button>
    </div>
  );
}
