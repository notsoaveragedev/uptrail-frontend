import { Tooltip } from "antd";
import { formatClock, formatDateTime } from "@/lib/format";
import { shortName } from "@/lib/incidents";
import type { TimelineEntry } from "@/types/incident";
import { AssigneeAvatar } from "./AssigneeAvatar";
import { IncidentStatusPill } from "./IncidentStatusPill";
import { MarkdownText } from "@/components/ui/MarkdownText";
import { PublicBadge } from "./PublicBadge";

export function TimelineUpdateCard({ entry, isNew }: { entry: TimelineEntry; isNew: boolean }) {
  const author = entry.author ?? "Uptrail";

  return (
    <li className="flex gap-3">
      <span className="z-10 mt-2.5 shrink-0 rounded-full ring-4 ring-card">
        <AssigneeAvatar name={author} hasTooltip={false} />
      </span>
      <article
        aria-label={`Update from ${author}`}
        className={`min-w-0 flex-1 rounded-lg border border-line bg-card ${isNew ? "animate-flash" : ""}`}
      >
        <header className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
          <span className="font-medium text-ink">{shortName(author)}</span>
          {entry.event === "declared" && <span className="text-muted">declared the incident</span>}
          {entry.status && entry.event !== "note" && (
            <span className="flex items-center gap-1.5 text-subtle">
              <span aria-hidden>→</span>
              <span className="sr-only">set status to</span>
              <IncidentStatusPill status={entry.status} />
            </span>
          )}
          {entry.isPublic && <PublicBadge />}
          <Tooltip title={formatDateTime(entry.at)}>
            <time dateTime={new Date(entry.at).toISOString()} className="ml-auto font-mono text-xs text-subtle">
              {formatClock(entry.at)}
            </time>
          </Tooltip>
        </header>
        {entry.message && <MarkdownText source={entry.message} className="px-3 py-2.5 text-muted" />}
      </article>
    </li>
  );
}
