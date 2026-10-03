import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { roleStore } from "@/mocks/settingsStore";
import type { Role } from "@/types/rbac";
import { useRemoveMutation, useUpsertMutation } from "./optimistic";

function rolesKey(orgSlug: string) {
  return ["roles", orgSlug] as const;
}

export function rolesQuery(orgSlug: string) {
  return queryOptions({
    queryKey: rolesKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(250);
      return roleStore.list();
    },
    staleTime: 60_000,
  });
}

export function useSaveRole(orgSlug: string) {
  return useUpsertMutation<Role>(rolesKey(orgSlug), roleStore);
}

export function useDeleteRoles(orgSlug: string) {
  return useRemoveMutation<Role>(rolesKey(orgSlug), roleStore);
}
