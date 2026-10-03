import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { DayHeader } from "@/components/ui/DayHeader";
import { groupByDay } from "@/lib/dates";
import type { Incident } from "@/types/incident";
import { TimelineEventRow } from "./TimelineEventRow";
import { TimelineUpdateCard } from "./TimelineUpdateCard";

type IncidentTimelineProps = {
  incident: Incident;
  composer: ReactNode;
};

export function IncidentTimeline({ incident, composer }: IncidentTimelineProps) {
  const now = useNow(60_000);
  const [initialIds] = useState(() => new Set(incident.timeline.map((entry) => entry.id)));
  const days = groupByDay(incident.timeline, (entry) => entry.at, now);

  return (
    <Card title="Timeline" meta={incident.timeline.length}>
      <div className="flex flex-col gap-5 px-4 pb-4">
        {composer}
        {days.map((day) => (
          <section key={day.key} aria-label={day.label} className="flex flex-col gap-3">
            <DayHeader label={day.label} className="-mx-4" />
            <ol className="relative flex flex-col gap-3 before:absolute before:inset-y-0 before:left-2.75 before:w-px before:bg-line">
              {day.items.map((entry) => {
                const isNew = !initialIds.has(entry.id);
                return entry.kind === "update" ? (
                  <TimelineUpdateCard key={entry.id} entry={entry} isNew={isNew} />
                ) : (
                  <TimelineEventRow key={entry.id} entry={entry} isNew={isNew} />
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </Card>
  );
}
