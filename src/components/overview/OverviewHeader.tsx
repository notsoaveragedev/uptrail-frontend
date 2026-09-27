import { Button, Segmented } from "antd";
import { LuPause, LuPlus } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { paths } from "@/lib/paths";
import { TIME_RANGE_LABELS, TIME_RANGES } from "@/lib/timeRange";
import type { Kpis, StatusCounts, TimeRange } from "@/types/overview";

type OverviewHeaderProps = {
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  kpis: Kpis;
  counts: StatusCounts;
  isPaused: boolean;
  onToggleLive: () => void;
};

export function OverviewHeader({ range, onRangeChange, kpis, counts, isPaused, onToggleLive }: OverviewHeaderProps) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();

  return (
    <PageHeader
      title="Overview"
      titleSuffix={TIME_RANGE_LABELS[range]}
      meta={
        <MetaList>
          <MetaItem value={`${kpis.uptime.toFixed(2)}%`} label="uptime" tone="text-up" />
          <MetaItem value={`${kpis.p95} ms`} label="p95" tone="text-ink" />
          <Link to={paths.monitors(orgSlug, { status: "down" })} className="text-muted hover:text-ink">
            <MetaItem value={String(counts.down)} label="down" tone="text-down" />
          </Link>
          <Link to={paths.monitors(orgSlug, { status: "degraded" })} className="text-muted hover:text-ink">
            <MetaItem value={String(counts.degraded)} label="degraded" tone="text-degraded" />
          </Link>
          <Link to={paths.incidents(orgSlug)} className="text-muted hover:text-ink">
            <MetaItem value={String(kpis.openIncidents)} label="open incident" tone="text-down" />
          </Link>
        </MetaList>
      }
      actions={
        <>
          <Segmented
            aria-label="Time range"
            value={range}
            onChange={onRangeChange}
            options={TIME_RANGES}
            className="font-mono"
          />
          <Button onClick={onToggleLive} aria-pressed={!isPaused} className={isPaused ? "" : "text-up"}>
            {isPaused ? (
              <LuPause aria-hidden className="size-3.5" />
            ) : (
              <StatusDot fill="bg-up" className="animate-pulse" />
            )}
            {isPaused ? "Paused" : "Live"}
          </Button>
          <Button type="primary" icon={<LuPlus />} onClick={() => navigate(paths.monitorNew(orgSlug))}>
            New monitor
          </Button>
        </>
      }
    />
  );
}

function MetaItem({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <span>
      <span className={`font-mono ${tone}`}>{value}</span> {label}
    </span>
  );
}
