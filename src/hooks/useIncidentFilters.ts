import { useSearchParams } from "react-router";
import { INCIDENT_FILTER_KEYS, INCIDENT_TABS, readIncidentFilters, type IncidentTab } from "@/lib/incidents";
import { readEnum, writeParam } from "@/lib/searchParams";

export function useIncidentFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  function setParam(key: string, value: string | string[] | null) {
    setSearchParams((params) => writeParam(params, key, value), { replace: key === "q" });
  }

  function setTab(tab: IncidentTab) {
    setSearchParams((params) => writeParam(params, "tab", tab, "open"));
  }

  function clear() {
    setSearchParams((params) => {
      INCIDENT_FILTER_KEYS.forEach((key) => params.delete(key));
      return params;
    });
  }

  return {
    tab: readEnum(searchParams, "tab", INCIDENT_TABS, "open"),
    filters: readIncidentFilters(searchParams),
    hasFilters: INCIDENT_FILTER_KEYS.some((key) => searchParams.has(key)),
    setTab,
    setParam,
    clear,
  };
}
