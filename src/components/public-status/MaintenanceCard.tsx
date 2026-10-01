import { LuWrench } from "react-icons/lu";
import { formatDateTime, formatTime } from "@/lib/format";
import { TONE_BORDER } from "@/lib/publicStatus";
import type { ScheduledMaintenance } from "@/types/statusPage";

export function MaintenanceCard({ maintenance }: { maintenance: ScheduledMaintenance }) {
  return (
    <article
      className={`flex flex-col gap-1.5 rounded-lg border border-l-2 border-line bg-card px-4 py-3.5 ${TONE_BORDER.info}`}
    >
      <span className="flex items-center gap-1.5 text-caps font-semibold tracking-widest text-maintenance uppercase">
        <LuWrench aria-hidden className="size-3" />
        Scheduled maintenance
      </span>
      <h3 className="text-md font-semibold">{maintenance.title}</h3>
      <p className="text-muted">
        <time dateTime={new Date(maintenance.startsAt).toISOString()} className="font-mono text-xs text-ink">
          {formatDateTime(maintenance.startsAt)} – {formatTime(maintenance.endsAt)}
        </time>
        {maintenance.components.length > 0 && ` · ${maintenance.components.join(", ")}`}
      </p>
    </article>
  );
}
