import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { MarkdownText } from "@/components/ui/MarkdownText";
import { formatDateTime } from "@/lib/format";
import { updatesOldestFirst } from "@/lib/publicStatus";
import type { PublicIncident } from "@/types/statusPage";

export function IncidentTimeline({ incident }: { incident: PublicIncident }) {
  const updates = updatesOldestFirst(incident);

  return (
    <section aria-labelledby="incident-updates" className="flex flex-col gap-4">
      <h2 id="incident-updates" className="text-md font-semibold">
        Updates
      </h2>
      {updates.length === 0 ? (
        <p className="text-muted">No public updates yet. We'll post here as soon as we know more.</p>
      ) : (
        <ol className="flex flex-col">
          {updates.map((update, index) => (
            <li key={update.id} className="relative flex gap-4 pb-6 last:pb-0">
              {index < updates.length - 1 && (
                <span aria-hidden className="absolute top-4 bottom-0 left-[0.3125rem] w-px bg-line" />
              )}
              <span
                aria-hidden
                className="mt-1.5 size-2.75 shrink-0 rounded-full border-2 border-line-strong bg-canvas"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <IncidentStatusPill status={update.status} />
                  <time dateTime={new Date(update.at).toISOString()} className="font-mono text-xs text-subtle">
                    {formatDateTime(update.at)}
                  </time>
                </div>
                <MarkdownText source={update.message} className="text-muted" />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
