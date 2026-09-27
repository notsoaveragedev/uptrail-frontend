import { queryOptions, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { applyMonitorChange } from "@/lib/monitors";
import { monitorStore } from "@/mocks/monitorStore";
import type { Monitor, MonitorChange } from "@/types/monitor";
import type { Overview } from "@/types/overview";
import { overviewOrgKey } from "./overview";

export function monitorsKey(orgSlug: string) {
  return ["monitors", orgSlug] as const;
}

export function monitorsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: monitorsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(400);
      return monitorStore.list();
    },
  });
}

function refreshOverview(queryClient: QueryClient, orgSlug: string) {
  return queryClient.invalidateQueries({ queryKey: overviewOrgKey(orgSlug) });
}

export function useMonitorChange(orgSlug: string) {
  const queryClient = useQueryClient();
  const queryKey = monitorsKey(orgSlug);

  const mutation = useMutation<void, Error, MonitorChange, { previous?: Monitor[] }>({
    mutationFn: async (change) => {
      await fakeRequest(500);
      monitorStore.apply(change);
    },
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: overviewOrgKey(orgSlug) });
      const previous = queryClient.getQueryData<Monitor[]>(queryKey);
      queryClient.setQueryData<Monitor[]>(queryKey, (monitors) => monitors && applyMonitorChange(monitors, change));
      queryClient.setQueriesData<Overview>(
        { queryKey: overviewOrgKey(orgSlug) },
        (overview) => overview && { ...overview, monitors: applyMonitorChange(overview.monitors, change) },
      );
      return { previous };
    },
    onError: (_error, _change, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => refreshOverview(queryClient, orgSlug),
  });

  function restore(monitors: Monitor[]) {
    monitorStore.replace(monitors);
    queryClient.setQueryData(queryKey, monitors);
    refreshOverview(queryClient, orgSlug);
  }

  function changeWithUndo(change: MonitorChange) {
    const previous = monitorStore.list();
    const settled = mutation.mutateAsync(change).catch(() => undefined);
    return () => settled.then(() => restore(previous));
  }

  return { change: mutation.mutate, changeWithUndo, isPending: mutation.isPending };
}

export async function addMonitors(queryClient: QueryClient, orgSlug: string, added: Monitor[]) {
  await fakeRequest(300);
  monitorStore.add(added);
  queryClient.setQueryData<Monitor[]>(monitorsKey(orgSlug), (current) => current && [...current, ...added]);
  refreshOverview(queryClient, orgSlug);
}

export async function updateMonitor(queryClient: QueryClient, orgSlug: string, updated: Monitor) {
  await fakeRequest(400);
  const replaceIn = (monitors: Monitor[]) => monitors.map((monitor) => (monitor.id === updated.id ? updated : monitor));
  monitorStore.replace(replaceIn(monitorStore.list()));
  queryClient.setQueryData<Monitor[]>(monitorsKey(orgSlug), (current) => current && replaceIn(current));
  refreshOverview(queryClient, orgSlug);
}
