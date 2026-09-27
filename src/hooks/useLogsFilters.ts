import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { DEFAULT_LOG_SORT, FILTER_PARAMS, readLogsFilters } from "@/lib/logs";
import { sortText, writeParam } from "@/lib/searchParams";
import type { LogsSortKey } from "@/types/logs";

export function useLogsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readLogsFilters(searchParams), [searchParams]);

  function setParam(key: string, value: string | string[] | null, { replace = false, fallback = "" } = {}) {
    setSearchParams((params) => writeParam(params, key, value, fallback), { replace });
  }

  function setSort(key: LogsSortKey, isDescending: boolean) {
    setParam("sort", sortText({ key, isDescending }), { fallback: sortText(DEFAULT_LOG_SORT) });
  }

  function clearFilters() {
    setSearchParams((params) => {
      FILTER_PARAMS.forEach((key) => params.delete(key));
      return params;
    });
  }

  const activeFilterCount = FILTER_PARAMS.filter((key) => key !== "q" && searchParams.has(key)).length;

  return { filters, searchParams, setSearchParams, setParam, setSort, clearFilters, activeFilterCount };
}
