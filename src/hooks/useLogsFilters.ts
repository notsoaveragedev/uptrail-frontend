import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { DEFAULT_LOG_RANGE, DEFAULT_LOG_SORT, FILTER_PARAMS, readLogsFilters } from "@/lib/logs";
import { sortText, writeParam } from "@/lib/searchParams";
import type { LogsRange, LogsSortKey, TimeWindow } from "@/types/logs";

export function useLogsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readLogsFilters(searchParams), [searchParams]);

  function setParam(key: string, value: string | string[] | null, { replace = false, fallback = "" } = {}) {
    setSearchParams((params) => writeParam(params, key, value, fallback), { replace });
  }

  function setSort(key: LogsSortKey, isDescending: boolean) {
    setParam("sort", sortText({ key, isDescending }), { fallback: sortText(DEFAULT_LOG_SORT) });
  }

  function setRange(range: LogsRange) {
    setSearchParams((params) => {
      params.delete("from");
      params.delete("to");
      return writeParam(params, "range", range, DEFAULT_LOG_RANGE);
    });
  }

  function setWindow(timeWindow: TimeWindow | null) {
    if (!timeWindow) return setRange(filters.range);
    setSearchParams((params) => {
      params.set("from", String(timeWindow.from));
      params.set("to", String(timeWindow.to));
      return params;
    });
  }

  function clearFilters() {
    setSearchParams((params) => {
      FILTER_PARAMS.forEach((key) => params.delete(key));
      return params;
    });
  }

  const activeFilterCount = FILTER_PARAMS.filter((key) => key !== "q" && searchParams.has(key)).length;

  return {
    filters,
    searchParams,
    setSearchParams,
    setParam,
    setRange,
    setWindow,
    setSort,
    clearFilters,
    activeFilterCount,
  };
}
