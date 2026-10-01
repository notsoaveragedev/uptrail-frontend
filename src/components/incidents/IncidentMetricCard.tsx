import { useState } from "react";
import type { IconType } from "react-icons";
import { formatDay } from "@/lib/format";
import { formatSpan } from "@/lib/incidents";
import { TONE_BADGE } from "@/lib/status";
import { DailyColumns } from "./DailyColumns";

type IncidentMetricCardProps = {
  icon: IconType;
  label: string;
  description: string;
  currentMs: number;
  previousMs: number;
  daily: { date: number; valueMs: number | null }[];
};

export function IncidentMetricCard({
  icon: Icon,
  label,
  description,
  currentMs,
  previousMs,
  daily,
}: IncidentMetricCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : daily[activeIndex];
  const hasCurrent = currentMs > 0;

  return (
    <section className="flex flex-col rounded-lg border border-line bg-card transition-colors hover:border-line-strong">
      <div className="flex items-center gap-2 px-5 pt-4">
        <Icon aria-hidden className="size-3.5 text-subtle" />
        <h2 className="text-caps font-semibold tracking-widest text-muted uppercase">{label}</h2>
        <span className="ml-auto font-mono text-xs text-subtle">{description}</span>
      </div>
      <div className="flex items-end gap-6 px-5 pt-3 pb-4">
        <p className="shrink-0 font-mono text-display font-medium tracking-tight">
          {hasCurrent ? formatSpan(currentMs) : "—"}
        </p>
        <div className="min-w-0 flex-1">
          <DailyColumns
            values={daily.map((day) => day.valueMs)}
            mean={currentMs}
            label={`${label} per day over the last 30 days, averaging ${hasCurrent ? formatSpan(currentMs) : "no data"}.`}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
          />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-5 py-2.5 font-mono text-xs text-subtle">
        {active ? (
          <span>
            {formatDay(active.date)} · {active.valueMs ? formatSpan(active.valueMs) : "no incidents"}
          </span>
        ) : (
          <span>vs prev 30d: {previousMs > 0 ? formatSpan(previousMs) : "—"}</span>
        )}
        {hasCurrent && previousMs > 0 && <DeltaPill currentMs={currentMs} previousMs={previousMs} />}
      </div>
    </section>
  );
}

function DeltaPill({ currentMs, previousMs }: { currentMs: number; previousMs: number }) {
  const deltaMs = currentMs - previousMs;
  const isBetter = deltaMs <= 0;

  return (
    <span className={`rounded-sm px-1.5 py-0.5 ${TONE_BADGE[isBetter ? "up" : "down"]}`}>
      <span aria-hidden>{isBetter ? "▼" : "▲"}</span>
      <span className="sr-only">{isBetter ? "Down" : "Up"}</span> {formatSpan(Math.abs(deltaMs))}
    </span>
  );
}
