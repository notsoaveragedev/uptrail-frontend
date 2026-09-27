import { queryOptions, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { applyMonitorChange } from "@/lib/monitors";
import { monitorStore } from "@/mocks/monitorStore";
import type { Monitor, MonitorChange } from "@/types/monitor";

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
      const previous = queryClient.getQueryData<Monitor[]>(queryKey);
      queryClient.setQueryData<Monitor[]>(queryKey, (monitors) => monitors && applyMonitorChange(monitors, change));
      return { previous };
    },
    onError: (_error, _change, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
  });

  function snapshot() {
    return queryClient.getQueryData<Monitor[]>(queryKey);
  }

  function restore(monitors: Monitor[] | undefined) {
    if (!monitors) return;
    monitorStore.replace(monitors);
    queryClient.setQueryData(queryKey, monitors);
  }

  return { change: mutation.mutate, isPending: mutation.isPending, snapshot, restore };
}

export async function addMonitors(queryClient: QueryClient, orgSlug: string, added: Monitor[]) {
  await fakeRequest(300);
  monitorStore.add(added);
  queryClient.setQueryData<Monitor[]>(monitorsKey(orgSlug), (current) => current && [...current, ...added]);
}

export async function updateMonitor(queryClient: QueryClient, orgSlug: string, updated: Monitor) {
  await fakeRequest(400);
  const replaceIn = (monitors: Monitor[]) => monitors.map((monitor) => (monitor.id === updated.id ? updated : monitor));
  monitorStore.replace(replaceIn(monitorStore.list()));
  queryClient.setQueryData<Monitor[]>(monitorsKey(orgSlug), (current) => current && replaceIn(current));
}
