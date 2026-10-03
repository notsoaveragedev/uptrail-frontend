import { Button, Drawer } from "antd";
import { LuChevronDown, LuChevronUp, LuCopy, LuX } from "react-icons/lu";
import { DrawerSection } from "@/components/logs/drawer/DrawerSection";
import { Fact } from "@/components/ui/Fact";
import { KbdButton } from "@/components/ui/KbdButton";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { useCopy } from "@/hooks/useCopy";
import { describeAuditEvent, RESOURCE_LABELS } from "@/lib/audit";
import { formatClock, formatDay } from "@/lib/format";
import { projectLabel } from "@/lib/monitors";
import type { AuditEvent } from "@/types/audit";
import { AuditAction } from "./AuditAction";
import { AuditActor } from "./AuditActor";
import { DiffView } from "./DiffView";

type AuditEventDrawerProps = {
  event: AuditEvent | undefined;
  onClose: () => void;
  onStep: (offset: number) => void;
};

export function AuditEventDrawer({ event, onClose, onStep }: AuditEventDrawerProps) {
  return (
    <Drawer
      open={event !== undefined}
      onClose={onClose}
      placement="right"
      size="30rem"
      closable={false}
      title={null}
      mask={false}
      aria-labelledby="audit-event-title"
      styles={{ body: { padding: 0 } }}
    >
      {event && <EventDetail event={event} onClose={onClose} onStep={onStep} />}
    </Drawer>
  );
}

function EventDetail({
  event,
  onClose,
  onStep,
}: {
  event: AuditEvent;
  onClose: () => void;
  onStep: (offset: number) => void;
}) {
  const copy = useCopy();

  return (
    <div className="flex flex-col">
      <header className="flex items-start gap-3 border-b border-line px-5 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex items-center gap-2">
            <AuditAction action={event.action} />
            <span className="font-mono text-xs text-subtle">
              <TimeAgo timestamp={event.at} intervalMs={60_000} />
            </span>
          </span>
          <h2 id="audit-event-title" className="text-md font-semibold">
            {describeAuditEvent(event)}
          </h2>
        </div>
        <div className="flex items-center">
          <KbdButton label="Newer event" hint="K" icon={<LuChevronUp />} onClick={() => onStep(-1)} />
          <KbdButton label="Older event" hint="J" icon={<LuChevronDown />} onClick={() => onStep(1)} />
          <Button type="text" aria-label="Close" icon={<LuX />} onClick={onClose} />
        </div>
      </header>

      {(event.before || event.after) && (
        <DrawerSection title="Change">
          <DiffView event={event} />
        </DrawerSection>
      )}

      <DrawerSection title="Context">
        <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-2.5">
          <Fact label="Actor">
            <AuditActor actor={event.actor} />
          </Fact>
          <Fact label="Resource">
            <span className="text-ink">{event.resource.name}</span>{" "}
            <span className="text-xs text-subtle">· {RESOURCE_LABELS[event.resource.type] ?? event.resource.type}</span>
          </Fact>
          <Fact label="Project">{event.project ? projectLabel(event.project) : "—"}</Fact>
          <Fact label="Time">
            <span className="font-mono text-xs">
              {formatDay(event.at)}, {formatClock(event.at)}
            </span>
          </Fact>
          <Fact label="IP address">
            <span className="font-mono text-xs">{event.ip ?? "—"}</span>
          </Fact>
          <Fact label="Client">{event.userAgent ?? "—"}</Fact>
          <Fact label="Request ID">
            <span className="flex items-center gap-1 font-mono text-xs">
              {event.requestId}
              <Button
                type="text"
                size="small"
                aria-label="Copy request ID"
                icon={<LuCopy className="size-3" />}
                onClick={() => copy(event.requestId, "Request ID copied")}
              />
            </span>
          </Fact>
        </dl>
      </DrawerSection>
      <p className="px-5 py-3 text-xs text-subtle">Audit events are append-only and can't be edited or deleted.</p>
    </div>
  );
}
