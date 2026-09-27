import { Button, Segmented } from "antd";
import { LuPause, LuPlus } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import type { Kpis, StatusCounts, TimeRange } from "@/types/overview";

const RANGE_LABELS: Record<TimeRange, string> = {
  "1h": "Last hour",
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

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
  const { orgSlug } = useParams();
  const monitorsPath = `/o/${orgSlug}/monitors`;

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight outline-none">
          Overview <span className="text-subtle">— {RANGE_LABELS[range]}</span>
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-muted">
          <Fragment value={`${kpis.uptime.toFixed(2)}%`} label="uptime" tone="text-up" />
          <Separator />
          <Fragment value={`${kpis.p95} ms`} label="p95" tone="text-ink" />
          <Separator />
          <Link to={`${monitorsPath}?status=down`} className="text-muted hover:text-ink">
            <Fragment value={String(counts.down)} label="down" tone="text-down" />
          </Link>
          <Separator />
          <Link to={`${monitorsPath}?status=degraded`} className="text-muted hover:text-ink">
            <Fragment value={String(counts.degraded)} label="degraded" tone="text-degraded" />
          </Link>
          <Separator />
          <Link to={`/o/${orgSlug}/incidents`} className="text-muted hover:text-ink">
            <Fragment value={String(kpis.openIncidents)} label="open incident" tone="text-down" />
          </Link>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Segmented
          aria-label="Time range"
          value={range}
          onChange={onRangeChange}
          options={Object.keys(RANGE_LABELS) as TimeRange[]}
          className="font-mono"
        />
        <Button onClick={onToggleLive} aria-pressed={!isPaused} className={isPaused ? "" : "text-up"}>
          {isPaused ? (
            <LuPause aria-hidden className="size-3.5" />
          ) : (
            <span className="size-1.5 animate-pulse rounded-full bg-up" />
          )}
          {isPaused ? "Paused" : "Live"}
        </Button>
        <Button type="primary" icon={<LuPlus />} onClick={() => navigate(`${monitorsPath}/new`)}>
          New monitor
        </Button>
      </div>
    </div>
  );
}

function Fragment({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <span>
      <span className={`font-mono ${tone}`}>{value}</span> {label}
    </span>
  );
}

function Separator() {
  return <span className="text-faint">·</span>;
}
