import { INCIDENT_FILTER_KEYS, INCIDENT_TABS, readIncidentFilters, type IncidentTab } from "@/lib/incidents";
import { readEnum } from "@/lib/searchParams";
import { useFilterParams } from "./useFilterParams";

export function useIncidentFilters() {
  const { searchParams, setParam, ...rest } = useFilterParams(INCIDENT_FILTER_KEYS, readIncidentFilters);

  return {
    ...rest,
    tab: readEnum(searchParams, "tab", INCIDENT_TABS, "open"),
    setTab: (tab: IncidentTab) => setParam("tab", tab, "open"),
    setParam,
  };
}
