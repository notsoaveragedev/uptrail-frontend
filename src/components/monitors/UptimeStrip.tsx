import { Tooltip } from "antd";
import { useState, type KeyboardEvent } from "react";
import { formatDay, formatUptime } from "@/lib/format";
import { STATUS_FILL, uptimeStatus } from "@/lib/status";
import type { UptimeDay } from "@/types/monitorDetail";

type UptimeStripProps = {
  days: UptimeDay[];
  label: string;
  className?: string;
};

const NAV_KEYS: Record<string, (index: number, last: number) => number> = {
  ArrowLeft: (index) => Math.max(0, index - 1),
  ArrowRight: (index, last) => Math.min(last, index + 1),
  Home: () => 0,
  End: (_, last) => last,
};

function describe(day: UptimeDay) {
  const uptime = day.uptime === null ? "no data" : formatUptime(day.uptime);
  const incidents = day.incidents === 0 ? "no incidents" : `${day.incidents} incident${day.incidents > 1 ? "s" : ""}`;
  return `${formatDay(day.date)} · ${uptime} · ${incidents}`;
}

export function UptimeStrip({ days, label, className = "h-8" }: UptimeStripProps) {
  const last = days.length - 1;
  const [rovingIndex, setRovingIndex] = useState(last);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? focusedIndex;
  const tabIndex = Math.min(rovingIndex, last);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const move = NAV_KEYS[event.key];
    if (!move || focusedIndex === null) return;
    event.preventDefault();
    const next = move(focusedIndex, last);
    (event.currentTarget.children[next] as HTMLElement | undefined)?.focus();
  }

  return (
    <div role="list" aria-label={label} onKeyDown={handleKeyDown} className={`flex gap-0.5 ${className}`}>
      {days.map((day, index) => {
        const status = uptimeStatus(day.uptime);
        return (
          <Tooltip
            key={day.date}
            open={activeIndex === index}
            title={<span className="font-mono">{describe(day)}</span>}
          >
            <span
              role="listitem"
              tabIndex={index === tabIndex ? 0 : -1}
              aria-label={describe(day)}
              onFocus={() => {
                setFocusedIndex(index);
                setRovingIndex(index);
              }}
              onBlur={() => setFocusedIndex(null)}
              onPointerEnter={(event) => event.pointerType === "mouse" && setHoveredIndex(index)}
              onPointerLeave={() => setHoveredIndex(null)}
              className={`min-w-0 flex-1 rounded-xs opacity-85 outline-offset-1 hover:opacity-100 focus-visible:opacity-100 ${status ? STATUS_FILL[status] : "bg-line-strong"}`}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}
