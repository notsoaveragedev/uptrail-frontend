import { useSearchParams } from "react-router";
import { DEFAULT_SORT, readFilters, type SortKey } from "@/lib/monitorList";
import { sortText, writeParam } from "@/lib/searchParams";

const FILTER_KEYS = ["q", "status", "type", "project", "tag"];

export function useMonitorFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);

  function setParam(key: string, value: string | string[] | null, fallback?: string) {
    setSearchParams(
      (params) => {
        writeParam(params, key, value, fallback);
        if (key !== "page") params.delete("page");
        return params;
      },
      { replace: key === "q" },
    );
  }

  function setSort(key: SortKey | null, isDescending = false) {
    setParam("sort", key && sortText({ key, isDescending }), sortText(DEFAULT_SORT));
  }

  function clear() {
    setSearchParams((params) => {
      [...FILTER_KEYS, "page"].forEach((key) => params.delete(key));
      return params;
    });
  }

  const hasFilters = FILTER_KEYS.some((key) => searchParams.has(key));

  return { filters, hasFilters, setParam, setSort, clear };
}
