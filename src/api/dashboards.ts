import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { dashboardStore } from "@/mocks/dashboardStore";
import { currentUser } from "@/mocks/workspace";
import type { Dashboard } from "@/types/dashboard";
import { useCollectionMutation } from "./optimistic";

export class VersionConflictError extends Error {
  latest: Dashboard;

  constructor(latest: Dashboard) {
    super(`${latest.updatedBy} saved a newer version of this dashboard.`);
    this.latest = latest;
  }
}

export function dashboardsKey(orgSlug: string) {
  return ["dashboards", orgSlug] as const;
}

export function dashboardsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: dashboardsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(350);
      return dashboardStore.list();
    },
  });
}

export function dashboardQuery(orgSlug: string, dashboardId: string) {
  return queryOptions({
    queryKey: [...dashboardsKey(orgSlug), dashboardId],
    queryFn: async () => {
      await fakeRequest(300);
      return dashboardStore.get(dashboardId);
    },
  });
}

function stamp(dashboard: Dashboard): Dashboard {
  return { ...dashboard, version: dashboard.version + 1, updatedAt: Date.now(), updatedBy: currentUser.name };
}

export function useSaveDashboard(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dashboard: Dashboard) => {
      await fakeRequest(500);
      const current = dashboardStore.get(dashboard.id);
      if (current && current.version !== dashboard.version) throw new VersionConflictError(current);
      const saved = stamp(dashboard);
      dashboardStore.upsert(saved);
      return saved;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(dashboardQuery(orgSlug, saved.id).queryKey, saved);
      queryClient.invalidateQueries({ queryKey: dashboardsKey(orgSlug), exact: true });
    },
  });
}

export function useCreateDashboard(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dashboard: Dashboard) => {
      await fakeRequest(400);
      dashboardStore.upsert(dashboard);
      return dashboard;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardsKey(orgSlug), exact: true }),
  });
}

export function useDeleteDashboard(orgSlug: string) {
  return useCollectionMutation<Dashboard, string>({
    queryKey: dashboardsKey(orgSlug),
    apply: (dashboards, id) => dashboards.filter((dashboard) => dashboard.id !== id),
    commit: (id) => dashboardStore.remove(id),
  });
}

export function useRestoreDashboard(orgSlug: string) {
  return useCollectionMutation<Dashboard, Dashboard>({
    queryKey: dashboardsKey(orgSlug),
    apply: (dashboards, dashboard) => [dashboard, ...dashboards.filter((item) => item.id !== dashboard.id)],
    commit: (dashboard) => dashboardStore.upsert(dashboard),
  });
}
