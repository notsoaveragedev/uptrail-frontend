import { useWidgetData } from "@/hooks/useWidgetData";
import { formatElapsed } from "@/lib/format";
import { TONE_TEXT } from "@/lib/status";
import { widgetRange } from "@/lib/widgetConfig";
import { percentOf, SEVERITY_TONE, timeAxisLabels } from "@/lib/widgetFormat";
import type { DashboardRange, WidgetProps } from "@/types/dashboard";
import type { TimelineData, TimelineIncident, TimelineLane } from "@/types/widgetData";
import { WidgetEmpty, WidgetState } from "./WidgetState";

export function IncidentTimelineWidget({ widget, range }: WidgetProps) {
  const query = useWidgetData<"incident_timeline">(widget, range);

  return (
    <WidgetState type="incident_timeline" query={query} noun="incidents">
      {(data) => <TimelineView data={data} range={widgetRange(widget, range)} />}
    </WidgetState>
  );
}

function TimelineView({ data, range }: { data: TimelineData; range: DashboardRange }) {
  const count = data.lanes.reduce((sum, lane) => sum + lane.incidents.length, 0);
  if (data.lanes.length === 0) return <WidgetEmpty>No monitors match this widget.</WidgetEmpty>;

  return (
    <div className="flex size-full flex-col gap-2">
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {data.lanes.map((lane) => (
          <Lane key={lane.monitorId} lane={lane} start={data.start} end={data.end} />
        ))}
      </ul>
      <div aria-hidden className="ml-35 flex justify-between font-mono text-xs text-subtle">
        {timeAxisLabels(data.start, data.end, range).map((label) => (
          <span key={label}>{label}</span>
        ))}
        <span>Now</span>
      </div>
      {count === 0 && <p className="text-center text-xs text-subtle">All clear · no incidents in the last {range}.</p>}
    </div>
  );
}

function Lane({ lane, start, end }: { lane: TimelineLane; start: number; end: number }) {
  return (
    <li className="flex h-6 shrink-0 items-center gap-3">
      <span className="w-32 shrink-0 truncate text-xs text-muted">{lane.name}</span>
      <div className="@container relative h-full flex-1">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line" />
        {lane.incidents.map((incident) => (
          <IncidentBar key={incident.id} incident={incident} start={start} end={end} />
        ))}
      </div>
    </li>
  );
}

function IncidentBar({ incident, start, end }: { incident: TimelineIncident; start: number; end: number }) {
  const isOpen = incident.resolvedAt === null;
  const left = percentOf(incident.startedAt, start, end);
  const right = percentOf(incident.resolvedAt ?? end, start, end);
  const label = `${incident.id} · ${formatElapsed((incident.resolvedAt ?? end) - incident.startedAt)}`;
  const isLabelLeft = left > 70;

  return (
    <div
      title={`${incident.severity} · ${incident.title}${isOpen ? " · ongoing" : ""}`}
      className={`absolute inset-y-0 flex items-center ${isLabelLeft ? "flex-row-reverse" : ""}`}
      style={isLabelLeft ? { right: `${100 - right}%` } : { left: `${left}%` }}
    >
      <span
        className={`h-3 min-w-1.5 rounded-xs bg-current ${TONE_TEXT[SEVERITY_TONE[incident.severity]]} ${isOpen ? "animate-pulse rounded-r-none" : ""}`}
        style={{ width: `${right - left}cqw` }}
      />
      <span className="px-1.5 font-mono text-xs whitespace-nowrap text-muted">{label}</span>
    </div>
  );
}
