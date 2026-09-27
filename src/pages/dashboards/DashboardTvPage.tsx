import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LuTvMinimal } from "react-icons/lu";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { dashboardQuery } from "@/api/dashboards";
import { DashboardGrid } from "@/components/dashboards/DashboardGrid";
import { TvTopBar } from "@/components/dashboards/TvTopBar";
import { useDashboardRefresh } from "@/components/dashboards/useDashboardRefresh";
import { useIdle } from "@/hooks/useIdle";
import { useInterval } from "@/hooks/useInterval";
import { useRootFontScale } from "@/components/dashboards/useRootFontScale";
import { useRotation } from "@/components/dashboards/useRotation";
import { StatusScreen } from "@/components/errors/StatusScreen";
import { Loader } from "@/components/ui/Loader";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { DASHBOARD_RANGES, TV_IDLE_MS, TV_REFRESH_MS, tvRotation } from "@/lib/dashboards";
import { paths } from "@/lib/paths";
import { readEnum } from "@/lib/searchParams";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function DashboardTvPage() {
  const navigate = useNavigate();
  const { orgSlug = "", dashboardId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { ids, everySec } = tvRotation(searchParams, dashboardId);
  const { activeId, rotatedAt } = useRotation(ids, everySec);
  const { data: dashboard, isPending } = useQuery({
    ...dashboardQuery(orgSlug, activeId),
    placeholderData: keepPreviousData,
  });
  const { refreshAll } = useDashboardRefresh();
  const isIdle = useIdle(TV_IDLE_MS);

  useRootFontScale("125%");
  useInterval(refreshAll, TV_REFRESH_MS);

  function exit() {
    navigate(paths.dashboard(orgSlug, dashboardId));
  }

  useWindowKeydown((event) => {
    if (event.key === "Escape") exit();
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <Loader size="lg" label="Loading dashboard" className="text-accent" />
      </div>
    );
  }
  if (!dashboard) return <NotFoundPage />;

  const range = readEnum(searchParams, "range", DASHBOARD_RANGES, dashboard.timeRange);
  const position = ids.indexOf(activeId) + 1;

  return (
    <div className={`flex min-h-dvh flex-col bg-canvas ${isIdle ? "cursor-none" : ""}`}>
      <title>{`${dashboard.name} · TV · Uptrail`}</title>
      <TvTopBar
        name={dashboard.name}
        rotation={ids.length > 1 ? { position, total: ids.length, rotatedAt, everySec } : null}
        isIdle={isIdle}
        onExit={exit}
      />
      <main className="flex-1 p-6">
        {dashboard.widgets.length > 0 ? (
          <DashboardGrid key={dashboard.id} dashboard={dashboard} range={range} hasMenus={false} />
        ) : (
          <StatusScreen
            icon={<LuTvMinimal />}
            title="Nothing to show yet"
            description="This dashboard has no widgets. Add some in the editor, then come back to TV mode."
          />
        )}
      </main>
      <p
        aria-hidden={isIdle}
        className={`pointer-events-none fixed right-6 bottom-4 flex items-center gap-2 text-xs text-subtle transition-opacity duration-500 ${
          isIdle ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="kbd">Esc</span> exit TV mode · refreshes every 30s
      </p>
    </div>
  );
}
