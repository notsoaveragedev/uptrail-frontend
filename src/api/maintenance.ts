import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { maintenanceStore } from "@/mocks/settingsStore";
import type { MaintenanceWindow } from "@/types/maintenance";
import { useRemoveMutation, useUpsertMutation } from "./optimistic";

function maintenanceKey(orgSlug: string) {
  return ["maintenance", orgSlug] as const;
}

export function maintenanceQuery(orgSlug: string) {
  return queryOptions({
    queryKey: maintenanceKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(350);
      return maintenanceStore.list();
    },
  });
}

export function useSaveMaintenance(orgSlug: string) {
  return useUpsertMutation<MaintenanceWindow>(maintenanceKey(orgSlug), maintenanceStore);
}

export function useDeleteMaintenance(orgSlug: string) {
  return useRemoveMutation<MaintenanceWindow>(maintenanceKey(orgSlug), maintenanceStore);
}
