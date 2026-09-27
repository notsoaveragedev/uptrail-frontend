import { useState } from "react";
import { StatusIcon } from "@/components/monitors/StatusIcon";
import { StatusDot } from "@/components/ui/StatusDot";
import { useLiveLogStream } from "@/hooks/useLiveLogStream";
import { useWidgetData } from "@/hooks/useWidgetData";
import { formatClock, latencyText } from "@/lib/format";
import { CHECK_STATUS_LABELS } from "@/lib/logs";
import type { WidgetProps } from "@/types/dashboard";
import type { LiveLogData, LiveLogLine } from "@/types/widgetData";
import { WidgetEmpty, WidgetState } from "./WidgetState";

export function LiveLogWidget({ widget, range, isPreview = false }: WidgetProps) {
  const query = useWidgetData<"live_log">(widget, range);
  const [isHovered, setIsHovered] = useState(false);
  const isStreaming = !isPreview && !isHovered;
  useLiveLogStream(widget, range, isStreaming && query.isSuccess);

  return (
    <WidgetState type="live_log" query={query} noun="live checks">
      {(data) => (
        <div
          className="flex size-full flex-col gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <StreamStatus isStreaming={isStreaming} failed={data.lines.filter((line) => line.status === "down").length} />
          <LogLines data={data} />
        </div>
      )}
    </WidgetState>
  );
}

function StreamStatus({ isStreaming, failed }: { isStreaming: boolean; failed: number }) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted">
      <StatusDot fill={isStreaming ? "bg-up" : "bg-subtle"} className={isStreaming ? "animate-pulse" : ""} />
      {isStreaming ? "Streaming" : "Paused while you read"}
      <span className={`ml-auto font-mono ${failed > 0 ? "text-down" : "text-subtle"}`}>
        {failed > 0 ? `${failed} failed` : "No failures"}
      </span>
    </p>
  );
}

function LogLines({ data }: { data: LiveLogData }) {
  if (data.lines.length === 0) return <WidgetEmpty>No matching checks in the last hour.</WidgetEmpty>;

  return (
    <ol role="log" aria-label="Live checks" className="-mx-1.5 min-h-0 flex-1 overflow-y-auto font-mono text-xs">
      {data.lines.map((line) => (
        <LogLineView key={line.id} line={line} />
      ))}
    </ol>
  );
}

function LogLineView({ line }: { line: LiveLogLine }) {
  const isDown = line.status === "down";

  return (
    <li
      aria-label={`${formatClock(line.ts)} ${line.region} ${line.monitorName} ${CHECK_STATUS_LABELS[line.status]} ${latencyText(line.latencyMs)}`}
      className={`flex animate-flash items-center gap-3 rounded-sm px-1.5 py-0.5 ${isDown ? "text-down" : "text-ink"}`}
    >
      <span className="text-subtle">{formatClock(line.ts)}</span>
      <span className={isDown ? "" : "text-muted"}>{line.region}</span>
      <StatusIcon status={line.status} className="size-3" />
      <span className="min-w-0 flex-1 truncate">{line.monitorName}</span>
      <span className="shrink-0 text-right">{latencyText(line.latencyMs)}</span>
    </li>
  );
}
