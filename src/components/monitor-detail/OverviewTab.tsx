import { Link, useParams } from "react-router";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { Card } from "@/components/ui/Card";
import { paths } from "@/lib/paths";
import type { Monitor } from "@/types/monitor";
import type { MonitorDetail } from "@/types/monitorDetail";
import type { TimeRange } from "@/types/overview";
import { ChecksTable } from "./ChecksTable";
import { RegionsCard } from "./RegionsCard";
import { ResponseChartCard } from "./ResponseChartCard";
import { TimingBreakdownCard } from "./TimingBreakdownCard";
import { UptimeStats } from "./UptimeStats";
import { UptimeStripCard } from "./UptimeStripCard";

const RECENT_CHECKS = 8;

type OverviewTabProps = {
  monitor: Monitor;
  detail: MonitorDetail;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

export function OverviewTab({ monitor, detail, range, onRangeChange }: OverviewTabProps) {
  const { orgSlug = "" } = useParams();

  return (
    <div className="flex flex-col gap-4">
      <SectionErrorBoundary>
        <UptimeStats uptime={detail.uptime} latency={detail.latency} />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <ResponseChartCard monitor={monitor} range={range} onRangeChange={onRangeChange} />
      </SectionErrorBoundary>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <SectionErrorBoundary>
          <TimingBreakdownCard timing={detail.timing} />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <RegionsCard regions={detail.regions} />
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary>
        <UptimeStripCard days={detail.days} uptime={detail.uptime.quarter} />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <Card
          title="Recent checks"
          extra={<Link to={paths.logs(orgSlug, { monitor: monitor.id })}>View all checks</Link>}
          className="overflow-hidden"
        >
          <ChecksTable checks={detail.checks.slice(0, RECENT_CHECKS)} />
        </Card>
      </SectionErrorBoundary>
    </div>
  );
}
