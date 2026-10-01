import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { overviewQuery } from "@/api/overview";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { ActiveIncidentsCard } from "@/components/overview/ActiveIncidentsCard";
import { KpiCards } from "@/components/overview/KpiCards";
import { LiveMonitorsTable } from "@/components/overview/LiveMonitorsTable";
import { NeedsAttention } from "@/components/overview/NeedsAttention";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { OverviewSkeleton } from "@/components/overview/OverviewSkeleton";
import { RecentAlertsCard } from "@/components/overview/RecentAlertsCard";
import { ResponseTimeCard } from "@/components/overview/ResponseTimeCard";
import { useLiveChecks } from "@/hooks/useLiveChecks";
import { useSearchParam } from "@/hooks/useSearchParam";
import { TIME_RANGES } from "@/lib/timeRange";

export function OverviewPage() {
  const { orgSlug = "" } = useParams();
  const [range, setRange] = useSearchParam("range", TIME_RANGES, "24h");
  const { data: overview } = useQuery({ ...overviewQuery(orgSlug, range), placeholderData: keepPreviousData });
  const live = useLiveChecks(orgSlug, range);

  return (
    <>
      <title>Overview · Uptrail</title>
      {!overview ? (
        <OverviewSkeleton />
      ) : (
        <div className="flex flex-col gap-6">
          <OverviewHeader
            range={range}
            onRangeChange={setRange}
            kpis={overview.kpis}
            counts={overview.statusCounts}
            isPaused={live.isPaused}
            onToggleLive={live.isPaused ? live.resume : live.pause}
          />

          <SectionErrorBoundary>
            <NeedsAttention items={overview.attention} healthyCount={overview.statusCounts.up} />
          </SectionErrorBoundary>

          <SectionErrorBoundary>
            <KpiCards kpis={overview.kpis} counts={overview.statusCounts} totalMonitors={overview.totalMonitors} />
          </SectionErrorBoundary>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <SectionErrorBoundary>
              <ResponseTimeCard series={overview.responseTime} anomalies={overview.anomalies} />
            </SectionErrorBoundary>
            <div className="flex flex-col gap-4">
              <SectionErrorBoundary>
                <ActiveIncidentsCard maintenance={overview.maintenance} />
              </SectionErrorBoundary>
              <SectionErrorBoundary>
                <RecentAlertsCard alerts={overview.alerts} />
              </SectionErrorBoundary>
            </div>
          </div>

          <SectionErrorBoundary>
            <LiveMonitorsTable
              monitors={overview.monitors}
              counts={overview.statusCounts}
              totalMonitors={overview.totalMonitors}
              pendingCount={live.pendingCount}
              onShowPending={live.resume}
            />
          </SectionErrorBoundary>
        </div>
      )}
    </>
  );
}
