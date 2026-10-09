import { DatePicker, Segmented } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useLogsFilters } from "@/hooks/useLogsFilters";
import { LOG_HISTORY_MS, LOG_RANGES } from "@/lib/logs";
import { localTimezone, offsetLabel } from "@/lib/timezones";
import { LOGS_ANCHOR } from "@/mocks/logsServer";
import type { LogsRange } from "@/types/logs";

const OLDEST = LOGS_ANCHOR - LOG_HISTORY_MS;

const CUSTOM = "custom";

const OPTIONS = [...LOG_RANGES, { label: "Custom", value: CUSTOM }];

function isOutsideHistory(date: Dayjs) {
  return date.isBefore(OLDEST, "day") || date.isAfter(LOGS_ANCHOR, "day");
}

export function LogsTimeRange() {
  const { filters, setRange, setWindow } = useLogsFilters();
  const customWindow = filters.window;
  const [isPicking, setIsPicking] = useState(false);
  const isCustom = !!customWindow || isPicking;

  function choose(value: string) {
    if (value === CUSTOM) return setIsPicking(true);
    setIsPicking(false);
    setRange(value as LogsRange);
  }

  function changeOpen(isOpen: boolean) {
    if (!isOpen && !customWindow) setIsPicking(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        aria-label="Time range"
        value={isCustom ? CUSTOM : filters.range}
        onChange={choose}
        options={OPTIONS}
        className="font-mono"
      />
      {isCustom && (
        <DatePicker.RangePicker
          aria-label="Custom time range"
          autoFocus={!customWindow}
          defaultOpen={!customWindow}
          onOpenChange={changeOpen}
          showTime={{ format: "HH:mm" }}
          format="MMM D, HH:mm"
          value={customWindow ? [dayjs(customWindow.from), dayjs(customWindow.to)] : null}
          disabledDate={isOutsideHistory}
          onChange={(dates) => {
            setIsPicking(false);
            setWindow(dates?.[0] && dates[1] ? { from: dates[0].valueOf(), to: dates[1].valueOf() } : null);
          }}
          suffixIcon={<span className="font-mono text-xs text-subtle">{offsetLabel(localTimezone())}</span>}
          className="w-80 font-mono"
        />
      )}
    </div>
  );
}
