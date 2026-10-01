import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { groupTimelineByDay } from "@/lib/incidents";
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
  const days = groupTimelineByDay(incident.timeline, now);

  return (
    <Card title="Timeline" meta={incident.timeline.length}>
      <div className="flex flex-col gap-5 px-4 pb-4">
        {composer}
        {days.map((day) => (
          <section key={day.key} aria-label={day.label} className="flex flex-col gap-3">
            <h3 className="sticky top-0 z-20 -mx-4 bg-card/95 px-4 py-1.5 text-caps font-semibold tracking-widest text-subtle uppercase backdrop-blur-sm">
              {day.label}
            </h3>
            <ol className="relative flex flex-col gap-3 before:absolute before:inset-y-0 before:left-2.75 before:w-px before:bg-line">
              {day.entries.map((entry) => {
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
