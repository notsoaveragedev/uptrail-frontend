import { Button } from "antd";
import { LuWrench } from "react-icons/lu";
import { MetaList } from "@/components/ui/MetaList";
import { formatElapsed, formatTime, plural } from "@/lib/format";
import { currentOccurrence } from "@/lib/maintenance";
import { projectLabel } from "@/lib/monitors";
import type { MaintenanceWindow } from "@/types/maintenance";
import { useMaintenanceActions } from "./useMaintenanceActions";

export function ActiveMaintenanceBanner({ entry, now }: { entry: MaintenanceWindow; now: number }) {
  const actions = useMaintenanceActions();
  const occurrence = currentOccurrence(entry, now);
  if (!occurrence) return null;

  return (
    <section
      aria-label="Maintenance in progress"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-maintenance/40 bg-maintenance-soft px-4 py-3"
    >
      <LuWrench aria-hidden className="size-4 text-maintenance" />
      <span className="text-caps font-semibold tracking-widest text-maintenance uppercase">In progress</span>
      <span className="font-medium text-ink">{entry.title}</span>
      <MetaList className="text-muted">
        <span className="font-mono text-xs">
          {formatTime(occurrence.start)}–{formatTime(occurrence.end)}
        </span>
        <span>{projectLabel(entry.project)}</span>
        <span>{plural(entry.monitorIds.length, "monitor")} silenced</span>
        <span>
          ends in <span className="font-mono text-ink">{formatElapsed(occurrence.end - now)}</span>
        </span>
      </MetaList>
      {!entry.recurrence && (
        <Button size="small" className="ml-auto" onClick={() => actions.endNow(entry)}>
          End now
        </Button>
      )}
    </section>
  );
}
