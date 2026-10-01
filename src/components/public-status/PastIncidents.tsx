import { Button } from "antd";
import { useState } from "react";
import { MetaList } from "@/components/ui/MetaList";
import { formatDay, formatTime } from "@/lib/format";
import { formatSpanShort, INCIDENT_STATUS_LABELS } from "@/lib/incidents";
import { paths } from "@/lib/paths";
import { HISTORY_PAGE_DAYS, historyByDay } from "@/lib/publicStatus";
import type { PublicIncident } from "@/types/statusPage";
import { StatusLink } from "./StatusLink";

type PastIncidentsProps = {
  history: PublicIncident[];
  slug: string;
  historyDays: number;
  now: number;
  isPreview: boolean;
  isMobile: boolean;
};

export function PastIncidents({ history, slug, historyDays, now, isPreview, isMobile }: PastIncidentsProps) {
  const [dayCount, setDayCount] = useState(HISTORY_PAGE_DAYS);
  const days = historyByDay(history, Math.min(dayCount, historyDays), now);

  return (
    <section aria-labelledby="past-incidents" className="flex flex-col gap-3">
      <h2 id="past-incidents" className="text-md font-semibold">
        Past incidents
      </h2>
      <ol className="flex flex-col divide-y divide-line border-y border-line">
        {days.map((day) => (
          <li key={day.date} className={`grid gap-x-4 gap-y-1.5 py-3 ${isMobile ? "" : "grid-cols-[4.5rem_1fr]"}`}>
            <h3 className="pt-0.5 font-mono text-xs font-medium text-subtle uppercase">{formatDay(day.date)}</h3>
            {day.incidents.length === 0 ? (
              <p className="text-subtle">No incidents reported</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {day.incidents.map((incident) => (
                  <li key={incident.id} className="flex flex-col gap-0.5">
                    <StatusLink
                      to={paths.publicIncident(slug, incident.id)}
                      isPreview={isPreview}
                      className="w-fit font-medium"
                    >
                      {incident.title}
                    </StatusLink>
                    <MetaList className="text-xs text-subtle">
                      <span>{INCIDENT_STATUS_LABELS[incident.status]}</span>
                      {incident.resolvedAt && (
                        <span>Lasted {formatSpanShort(incident.resolvedAt - incident.startedAt)}</span>
                      )}
                      <span className="font-mono">{formatTime(incident.startedAt)}</span>
                      {incident.components.length > 0 && <span>{incident.components.join(", ")}</span>}
                    </MetaList>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      {dayCount < historyDays && (
        <Button className="self-center" onClick={() => setDayCount((count) => count + HISTORY_PAGE_DAYS)}>
          Load older
        </Button>
      )}
    </section>
  );
}
