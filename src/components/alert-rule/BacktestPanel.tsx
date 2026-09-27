import { Button } from "antd";
import { useCallback, useId, useMemo, useState } from "react";
import { LuCircleCheck, LuMaximize2, LuMinimize2, LuRefreshCw } from "react-icons/lu";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Loader } from "@/components/ui/Loader";
import { MetaList } from "@/components/ui/MetaList";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import type { BacktestResult } from "@/lib/alertExpression/backtest";
import { formatFieldValue } from "@/lib/alertExpression/catalog";
import { rootFontSize } from "@/lib/dom";
import { formatTime } from "@/lib/format";
import type { Monitor } from "@/types/monitor";
import { backtestSummary, chartView, checksReplayed, intervalDuration, intervalPeak, type Zoom } from "./backtestUtils";

type BacktestPanelProps = {
  result: BacktestResult | null;
  isValid: boolean;
  isRunning: boolean;
  isError: boolean;
  monitors: Monitor[];
  monitorId: string;
  onMonitorChange: (monitorId: string) => void;
  onRerun: () => void;
};

const CHART_HEIGHT_REM = 12;

export function BacktestPanel({
  result,
  isValid,
  isRunning,
  isError,
  monitors,
  monitorId,
  onMonitorChange,
  onRerun,
}: BacktestPanelProps) {
  const titleId = useId();
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const monitor = monitors.find((item) => item.id === monitorId);

  return (
    <aside
      aria-labelledby={titleId}
      aria-busy={isRunning}
      className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-card xl:sticky xl:top-6 xl:w-104"
    >
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <h2 id={titleId} className="flex items-baseline gap-2 text-md font-semibold">
          Backtest
          <span className="font-mono text-xs font-normal text-subtle">last 24h</span>
        </h2>
        <Button
          type="text"
          size="small"
          icon={<LuRefreshCw className={isRunning ? "animate-spin" : ""} />}
          disabled={!isValid || !monitorId}
          onClick={onRerun}
          className="text-muted"
        >
          Re-run
        </Button>
      </header>

      <div aria-hidden className="relative h-px overflow-hidden bg-line">
        {isRunning && <span className="absolute inset-y-0 left-0 w-1/3 animate-progress bg-accent" />}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <CustomSelect<string>
          size="middle"
          aria-label="Monitor to replay"
          placeholder="No monitors in this project"
          value={monitorId || undefined}
          onChange={(value) => {
            setZoom(null);
            onMonitorChange(value);
          }}
          options={monitors.map((item) => ({ value: item.id, label: item.name }))}
        />

        {!isValid && (
          <p role="status" className="text-xs text-degraded">
            Fix the condition to re-run the backtest.
          </p>
        )}
        {isError && <p className="text-xs text-down">Couldn't replay checks. Try Re-run.</p>}

        {result ? (
          <BacktestResultView result={result} zoom={zoom} onZoom={setZoom} />
        ) : (
          <BacktestSkeleton checks={checksReplayed(monitor)} />
        )}
      </div>
    </aside>
  );
}

function BacktestSkeleton({ checks }: { checks: number }) {
  return (
    <div className="relative">
      <SkeletonBlock isInset className="h-48" />
      <span className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-muted">
        <Loader size="sm" label="Running backtest" />
        Replaying {checks.toLocaleString()} checks…
      </span>
    </div>
  );
}

type BacktestResultViewProps = {
  result: BacktestResult;
  zoom: Zoom | null;
  onZoom: (zoom: Zoom | null) => void;
};

function BacktestResultView({ result, zoom, onZoom }: BacktestResultViewProps) {
  const view = useMemo(() => chartView(result, zoom), [result, zoom]);
  const { field } = result;
  const formatValue = useCallback((value: number) => formatFieldValue(field, value), [field]);
  const threshold = result.threshold ?? undefined;
  const totalMinutes = Math.round(result.totalMinutes);

  return (
    <>
      {zoom && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span>
            Zoomed to{" "}
            <span className="font-mono text-ink">
              {formatTime(zoom.start * 1000)}–{formatTime(zoom.end * 1000)}
            </span>
          </span>
          <Button type="link" size="small" icon={<LuMinimize2 />} onClick={() => onZoom(null)} className="px-0">
            Show 24h
          </Button>
        </div>
      )}
      <div>
        <TimeSeriesChart
          timestamps={view.timestamps}
          series={view.series}
          threshold={threshold}
          thresholdLabel={threshold === undefined ? undefined : formatValue(threshold)}
          bands={view.bands}
          height={CHART_HEIGHT_REM * rootFontSize()}
          formatValue={formatValue}
        />
        <p className="sr-only">{backtestSummary(result)}</p>
      </div>

      {result.count > 0 ? (
        <MetaList>
          <span>
            Would have fired <span className="font-mono text-down">{result.count}</span>{" "}
            {result.count === 1 ? "time" : "times"}
          </span>
          <span className="text-muted">
            <span className="font-mono text-ink">{totalMinutes}</span> min firing
          </span>
        </MetaList>
      ) : (
        <p className="flex items-center gap-1.5">
          <LuCircleCheck aria-hidden className="text-up" />
          Wouldn't have fired in the last 24h
        </p>
      )}

      {result.intervals.length > 0 && (
        <ul aria-label="Firing intervals" className="-mx-2 flex max-h-48 flex-col overflow-y-auto">
          {result.intervals.map((interval) => {
            const isZoomed = zoom?.start === interval.start;
            return (
              <li key={interval.start}>
                <button
                  type="button"
                  aria-pressed={isZoomed}
                  onClick={() => onZoom(isZoomed ? null : interval)}
                  className={`group/interval flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-hover ${
                    isZoomed ? "bg-hover" : ""
                  }`}
                >
                  <span aria-hidden className="h-3 w-0.5 rounded-full bg-down" />
                  <span className="font-mono text-xs text-ink">{formatTime(interval.start * 1000)}</span>
                  <span className="w-14 font-mono text-xs text-muted">{intervalDuration(interval)}</span>
                  <span className="text-xs text-muted">
                    peak <span className="font-mono text-ink">{intervalPeak(result, interval)}</span>
                  </span>
                  <LuMaximize2
                    aria-hidden
                    className="ml-auto size-3.5 text-subtle opacity-0 transition-opacity group-hover/interval:opacity-100"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
