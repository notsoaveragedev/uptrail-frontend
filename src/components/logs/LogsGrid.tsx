import { Button, Tooltip } from "antd";
import type { MouseEvent, ReactNode } from "react";
import { LuChevronRight, LuLink } from "react-icons/lu";
import { DataGrid, type DataGridProps } from "@/components/data-grid/DataGrid";
import { LatencyValue } from "@/components/monitors/LatencyValue";
import { StatusLabel } from "@/components/monitors/StatusLabel";
import { useCopy } from "@/hooks/useCopy";
import { formatBytes, formatClockMs, LATENCY_THRESHOLD_MS } from "@/lib/format";
import { checkLink, isErrorCode, LATENCY_SCALE_MS, LOG_COLUMNS } from "@/lib/logColumns";
import { displayUrl } from "@/lib/monitors";
import { TIMING_PHASES } from "@/lib/timing";
import type { GridColumn } from "@/types/dataGrid";
import type { CheckResult } from "@/types/logs";

type LogsGridProps = Omit<DataGridProps<CheckResult>, "columns" | "label">;

function TimeCell({ result }: { result: CheckResult }) {
  return (
    <>
      {result.status === "down" && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-down" />}
      <span title={new Date(result.ts).toISOString()} className="font-mono text-xs text-muted">
        {formatClockMs(result.ts)}
      </span>
    </>
  );
}

function MonitorCell({ result }: { result: CheckResult }) {
  return (
    <span className="flex min-w-0 items-baseline gap-2">
      <span className="max-w-full shrink-0 truncate font-medium">{result.monitorName}</span>
      <span className="truncate font-mono text-xs text-subtle">{displayUrl(result.monitorUrl)}</span>
    </span>
  );
}

function CodeCell({ code }: { code: number | null }) {
  if (code === null) return <span className="text-faint">—</span>;
  return <span className={`font-mono text-xs ${isErrorCode(code) ? "text-down" : "text-muted"}`}>{code}</span>;
}

function latencyFill(result: CheckResult) {
  if (result.error?.type === "timeout") return "bg-down";
  if (result.latencyMs > LATENCY_THRESHOLD_MS) return "bg-degraded";
  return "bg-muted";
}

function LatencyCell({ result }: { result: CheckResult }) {
  const fill = Math.min(1, result.latencyMs / LATENCY_SCALE_MS);
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className="h-1 w-10 overflow-hidden rounded-full bg-line">
        <span className={`block h-full rounded-full ${latencyFill(result)}`} style={{ width: `${fill * 100}%` }} />
      </span>
      <LatencyValue ms={result.latencyMs} className="min-w-12 text-right text-xs" />
    </span>
  );
}

function TimingsCell({ result }: { result: CheckResult }) {
  const summary = TIMING_PHASES.map((phase) => `${phase.label} ${result.timings[phase.key]} ms`).join(" · ");
  return (
    <span title={summary} className="flex h-1.5 w-28 overflow-hidden rounded-full">
      {TIMING_PHASES.map((phase) => (
        <span key={phase.key} className={phase.fill} style={{ flexGrow: result.timings[phase.key] }} />
      ))}
    </span>
  );
}

function ErrorCell({ error }: { error: CheckResult["error"] }) {
  if (!error) return null;
  return (
    <span className="truncate text-muted">
      <span className="font-medium text-down">{error.type}</span> · {error.message}
    </span>
  );
}

function ActionsCell({ result }: { result: CheckResult }) {
  const copy = useCopy();

  function copyLink(event: MouseEvent) {
    event.stopPropagation();
    copy(checkLink(result.id), "Link copied", `Anyone in this org can open check ${result.id}.`);
  }

  return (
    <span className="flex items-center opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100 group-data-active/row:opacity-100">
      <Tooltip title="Copy link">
        <Button
          type="text"
          size="small"
          tabIndex={-1}
          aria-label="Copy link to check"
          icon={<LuLink />}
          onClick={copyLink}
        />
      </Tooltip>
      <Button type="text" size="small" tabIndex={-1} aria-label="Open check details" icon={<LuChevronRight />} />
    </span>
  );
}

const CELLS: Record<string, (result: CheckResult) => ReactNode> = {
  time: (result) => <TimeCell result={result} />,
  monitor: (result) => <MonitorCell result={result} />,
  region: (result) => <span className="font-mono text-xs text-muted">{result.region}</span>,
  status: (result) => <StatusLabel status={result.status} />,
  code: (result) => <CodeCell code={result.statusCode} />,
  latency: (result) => <LatencyCell result={result} />,
  timings: (result) => <TimingsCell result={result} />,
  size: (result) => <span className="font-mono text-xs text-muted">{formatBytes(result.sizeBytes)}</span>,
  error: (result) => <ErrorCell error={result.error} />,
  id: (result) => <span className="font-mono text-xs text-subtle">{result.id}</span>,
  actions: (result) => <ActionsCell result={result} />,
};

const LOG_GRID_COLUMNS: GridColumn<CheckResult>[] = LOG_COLUMNS.map((column) => ({
  ...column,
  render: CELLS[column.key],
}));

export function LogsGrid(props: LogsGridProps) {
  return <DataGrid label="Check results" columns={LOG_GRID_COLUMNS} {...props} />;
}
