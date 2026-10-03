import { Calendar, Popover } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { addDays, startOfDay } from "@/lib/dates";
import { formatTime } from "@/lib/format";
import { occurrences, type Occurrence } from "@/lib/maintenance";
import type { MaintenanceWindow } from "@/types/maintenance";

type MaintenanceCalendarProps = {
  windows: MaintenanceWindow[];
  onOpen: (entry: MaintenanceWindow) => void;
  onCreate: (day: number) => void;
};

const VISIBLE_PER_DAY = 2;

export function MaintenanceCalendar({ windows, onOpen, onCreate }: MaintenanceCalendarProps) {
  const [month, setMonth] = useState(() => dayjs());
  const byDay = useMemo(() => {
    const from = month.startOf("month").subtract(7, "day").valueOf();
    const to = month.endOf("month").add(7, "day").valueOf();
    const map = new Map<number, Occurrence[]>();
    for (const item of windows.flatMap((entry) => occurrences(entry, from, to))) {
      for (let day = startOfDay(item.start); day < item.end; day = addDays(day, 1)) {
        map.set(day, [...(map.get(day) ?? []), item]);
      }
    }
    return map;
  }, [windows, month]);

  function renderDay(date: Dayjs) {
    const items = byDay.get(startOfDay(date.valueOf())) ?? [];
    const hidden = items.slice(VISIBLE_PER_DAY);
    return (
      <ul className="flex flex-col gap-0.5">
        {items.slice(0, VISIBLE_PER_DAY).map((item) => (
          <li key={`${item.entry.id}-${item.start}`}>
            <OccurrenceChip item={item} onOpen={onOpen} />
          </li>
        ))}
        {hidden.length > 0 && (
          <li>
            <Popover
              trigger="click"
              content={
                <ul className="flex w-56 flex-col gap-1">
                  {items.map((item) => (
                    <li key={`${item.entry.id}-${item.start}`}>
                      <OccurrenceChip item={item} onOpen={onOpen} />
                    </li>
                  ))}
                </ul>
              }
            >
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="cursor-pointer px-1 text-xs text-subtle hover:text-ink"
              >
                +{hidden.length} more
              </button>
            </Popover>
          </li>
        )}
      </ul>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-card px-3 pb-2">
      <Calendar
        value={month}
        onPanelChange={(value) => setMonth(value)}
        onSelect={(value, info) => {
          setMonth(value);
          if (info.source === "date" && value.valueOf() >= startOfDay(Date.now())) onCreate(value.valueOf());
        }}
        cellRender={(date, info) => (info.type === "date" ? renderDay(date) : info.originNode)}
      />
    </div>
  );
}

function OccurrenceChip({ item, onOpen }: { item: Occurrence; onOpen: (entry: MaintenanceWindow) => void }) {
  return (
    <button
      type="button"
      title={`${item.entry.title} · ${formatTime(item.start)}–${formatTime(item.end)}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(item.entry);
      }}
      className="flex w-full cursor-pointer items-center gap-1.5 truncate rounded-sm bg-maintenance-soft px-1.5 py-0.5 text-left text-xs text-maintenance hover:brightness-125"
    >
      <span className="shrink-0 font-mono">{formatTime(item.start)}</span>
      <span className="truncate">{item.entry.title}</span>
    </button>
  );
}
