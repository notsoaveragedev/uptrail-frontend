import { MAINTENANCE_FILTER_KEYS, readMaintenanceFilters } from "@/lib/maintenance";
import type { MaintenancePhase } from "@/types/maintenance";
import { useFilterParams } from "./useFilterParams";

export function useMaintenanceFilters() {
  const { setParam, ...rest } = useFilterParams(MAINTENANCE_FILTER_KEYS, readMaintenanceFilters);

  return {
    ...rest,
    setParam,
    setTab: (tab: MaintenancePhase) => setParam("tab", tab, "upcoming"),
    setView: (view: "list" | "calendar") => setParam("view", view, "list"),
  };
}
