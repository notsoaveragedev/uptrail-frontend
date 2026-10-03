import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { projectStore } from "@/mocks/settingsStore";
import type { Project } from "@/types/project";
import { useRemoveMutation, useUpsertMutation } from "./optimistic";

function projectsKey(orgSlug: string) {
  return ["projects", orgSlug] as const;
}

export function projectsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: projectsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(300);
      return projectStore.list();
    },
  });
}

export function useSaveProject(orgSlug: string) {
  return useUpsertMutation<Project>(projectsKey(orgSlug), projectStore);
}

export function useDeleteProjects(orgSlug: string) {
  return useRemoveMutation<Project>(projectsKey(orgSlug), projectStore);
}
