import { Button, Drawer, Timeline } from "antd";
import { LuX } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { DrawerSection } from "@/components/logs/drawer/DrawerSection";
import { Fact } from "@/components/ui/Fact";
import { eventTimeline, type TimelineEntry } from "@/lib/alertLists";
import { formatClock, formatDateTime, formatElapsed } from "@/lib/format";
import { paths } from "@/lib/paths";
import type { AlertChannel, AlertEvent, AlertRule } from "@/types/alerts";
import type { Monitor } from "@/types/monitor";
import { AcknowledgeCell } from "./AcknowledgeCell";
import { ChannelIcon } from "./ChannelIcon";
import { EventStatus } from "./EventStatus";
import { ExpressionText } from "./ExpressionText";
import { SeverityTag } from "./SeverityTag";

type AlertEventDrawerProps = {
  open: boolean;
  event: AlertEvent | undefined;
  rule: AlertRule | undefined;
  monitor: Monitor | undefined;
  channels: AlertChannel[];
  onClose: () => void;
};

const TIMELINE_COLOR: Record<TimelineEntry["kind"], string> = {
  fired: "red",
  delivered: "gray",
  failed: "red",
  acknowledged: "blue",
  resolved: "green",
};

export function AlertEventDrawer({ open, event, rule, monitor, channels, onClose }: AlertEventDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      size="30rem"
      closable={false}
      title={null}
      aria-labelledby="alert-event-title"
      styles={{ body: { padding: 0 } }}
    >
      {event && <EventDetail event={event} rule={rule} monitor={monitor} channels={channels} onClose={onClose} />}
    </Drawer>
  );
}

type EventDetailProps = Omit<AlertEventDrawerProps, "open" | "event"> & { event: AlertEvent };

function EventDetail({ event, rule, monitor, channels, onClose }: EventDetailProps) {
  const { orgSlug = "" } = useParams();

  return (
    <div className="flex flex-col">
      <header className="flex items-start gap-3 border-b border-line px-5 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <EventStatus event={event} />
          <h2 id="alert-event-title" className="text-md font-semibold">
            {rule?.name ?? "Deleted rule"}
          </h2>
          {rule && <ExpressionText expression={rule.expression} />}
        </div>
        <Button type="text" aria-label="Close" icon={<LuX />} onClick={onClose} />
      </header>

      <DrawerSection title="Summary">
        <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2.5">
          <Fact label="Fired">
            <span className="font-mono text-xs">{formatDateTime(event.firedAt)}</span>
          </Fact>
          <Fact label="Duration">
            <span className="font-mono text-xs">
              {event.resolvedAt ? formatElapsed(event.resolvedAt - event.firedAt) : "Ongoing"}
            </span>
          </Fact>
          <Fact label="Monitor">
            {monitor ? (
              <Link to={paths.monitor(orgSlug, monitor.id)} className="text-ink hover:text-ink hover:underline">
                {monitor.name}
              </Link>
            ) : (
              "—"
            )}
          </Fact>
          <Fact label="Severity">{rule ? <SeverityTag severity={rule.severity} /> : "—"}</Fact>
          <Fact label="Acknowledged">
            <AcknowledgeCell event={event} />
          </Fact>
          <Fact label="Incident">
            {event.incidentId ? (
              <Link
                to={paths.incident(orgSlug, event.incidentId)}
                className="font-mono text-xs text-ink hover:text-ink hover:underline"
              >
                {event.incidentId}
              </Link>
            ) : (
              "—"
            )}
          </Fact>
        </dl>
      </DrawerSection>

      <DrawerSection title="Value snapshot">
        <dl className="flex flex-col divide-y divide-line rounded-md border border-line bg-panel">
          {Object.entries(event.valueSnapshot).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-3 py-2 font-mono text-xs">
              <dt className="text-muted">{key}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </DrawerSection>

      <DrawerSection title="Delivery timeline">
        <Timeline
          className="pt-1"
          items={eventTimeline(event, channels).map((entry) => ({
            key: entry.key,
            color: TIMELINE_COLOR[entry.kind],
            content: <TimelineRow entry={entry} />,
          }))}
        />
      </DrawerSection>
    </div>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  return (
    <span className="flex flex-col">
      <span className="flex items-center gap-2">
        {entry.channelType && <ChannelIcon type={entry.channelType} className="size-3.5" />}
        <span className={entry.kind === "failed" ? "text-down" : "text-ink"}>{entry.title}</span>
        <span className="ml-auto font-mono text-xs text-subtle">{formatClock(entry.at)}</span>
      </span>
      {entry.detail && <span className="text-xs text-muted">{entry.detail}</span>}
    </span>
  );
}
