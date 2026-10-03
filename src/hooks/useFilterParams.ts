import { useSearchParams } from "react-router";
import { writeParam } from "@/lib/searchParams";

export function useFilterParams<Filters>(keys: readonly string[], read: (params: URLSearchParams) => Filters) {
  const [searchParams, setSearchParams] = useSearchParams();

  function setParam(key: string, value: string | string[] | null, fallback?: string) {
    setSearchParams((params) => writeParam(params, key, value, fallback), { replace: key === "q" });
  }

  function clear() {
    setSearchParams((params) => {
      keys.forEach((key) => params.delete(key));
      return params;
    });
  }

  return {
    searchParams,
    filters: read(searchParams),
    hasFilters: keys.some((key) => searchParams.has(key)),
    setParam,
    clear,
  };
}
