import { useSearchParams } from "react-router";
import { readFilters, type SortKey } from "@/lib/monitorList";

const FILTER_KEYS = ["q", "status", "type", "project", "tag"];

export function useMonitorFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);

  function setParam(key: string, value: string | string[] | null) {
    setSearchParams(
      (params) => {
        const text = Array.isArray(value) ? value.join(",") : value;
        if (text) params.set(key, text);
        else params.delete(key);
        if (key !== "page") params.delete("page");
        return params;
      },
      { replace: key === "q" },
    );
  }

  function setSort(key: SortKey | null, isDescending = false) {
    const isDefault = !key || (key === "status" && !isDescending);
    setParam("sort", isDefault ? null : `${isDescending ? "-" : ""}${key}`);
  }

  function clear() {
    setSearchParams((params) => {
      FILTER_KEYS.forEach((key) => params.delete(key));
      params.delete("page");
      return params;
    });
  }

  const hasFilters = FILTER_KEYS.some((key) => searchParams.has(key));

  return { filters, hasFilters, setParam, setSort, clear };
}
