import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
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
import type { TimeRange } from "@/types/overview";

const RANGES: TimeRange[] = ["1h", "24h", "7d", "30d"];

export function OverviewPage() {
  const { orgSlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const range = RANGES.find((value) => value === searchParams.get("range")) ?? "24h";
  const { data: overview, error } = useQuery({ ...overviewQuery(orgSlug, range), placeholderData: keepPreviousData });
  const live = useLiveChecks(orgSlug, range);

  function changeRange(value: TimeRange) {
    setSearchParams((params) => {
      if (value === "24h") params.delete("range");
      else params.set("range", value);
      return params;
    });
  }

  if (error) throw error;

  return (
    <>
      <title>Overview · Uptrail</title>
      {!overview ? (
        <OverviewSkeleton />
      ) : (
        <div className="flex flex-col gap-6">
          <OverviewHeader
            range={range}
            onRangeChange={changeRange}
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
                <ActiveIncidentsCard incidents={overview.incidents} maintenance={overview.maintenance} />
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
