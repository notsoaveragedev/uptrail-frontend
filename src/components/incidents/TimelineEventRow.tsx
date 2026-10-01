import type { IconType } from "react-icons";
import { LuBellRing, LuCheckCheck, LuCircleCheck, LuCircleX, LuRefreshCw, LuSiren, LuUserRound } from "react-icons/lu";
import { formatClock } from "@/lib/format";
import type { TimelineEntry, TimelineEvent } from "@/types/incident";

const EVENT_ICONS: Record<TimelineEvent, { icon: IconType; tone: string }> = {
  declared: { icon: LuSiren, tone: "text-down" },
  monitor_down: { icon: LuCircleX, tone: "text-down" },
  alert_sent: { icon: LuBellRing, tone: "text-muted" },
  acknowledged: { icon: LuCheckCheck, tone: "text-maintenance" },
  status_changed: { icon: LuRefreshCw, tone: "text-muted" },
  note: { icon: LuUserRound, tone: "text-muted" },
  recovered: { icon: LuCircleCheck, tone: "text-up" },
};

function sentence(entry: TimelineEntry) {
  if (entry.event === "acknowledged") return `Acknowledged by ${entry.author ?? "someone"}`;
  return entry.message ?? "";
}

export function TimelineEventRow({ entry, isNew }: { entry: TimelineEntry; isNew: boolean }) {
  const { icon: Icon, tone } = EVENT_ICONS[entry.event];

  return (
    <li className={`flex items-center gap-3 rounded-md pr-2 ${isNew ? "animate-flash" : ""}`}>
      <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-line bg-card">
        <Icon aria-hidden className={`size-3.5 ${tone}`} />
      </span>
      <p className="min-w-0 flex-1 text-muted">{sentence(entry)}</p>
      <time dateTime={new Date(entry.at).toISOString()} className="shrink-0 font-mono text-xs text-subtle">
        {formatClock(entry.at)}
      </time>
    </li>
  );
}
