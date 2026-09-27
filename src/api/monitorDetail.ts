import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { buildMonitorDetail, buildResponseHistory } from "@/mocks/monitorDetail";
import type { Monitor } from "@/types/monitor";
import type { TimeRange } from "@/types/overview";

export function monitorDetailQuery(orgSlug: string, monitor: Monitor) {
  return queryOptions({
    queryKey: ["monitor-detail", orgSlug, monitor.id] as const,
    queryFn: async () => {
      await fakeRequest(450);
      return buildMonitorDetail(monitor);
    },
  });
}

export function responseHistoryQuery(orgSlug: string, monitor: Monitor, range: TimeRange) {
  return queryOptions({
    queryKey: ["monitor-response", orgSlug, monitor.id, range] as const,
    queryFn: async () => {
      await fakeRequest(350);
      return buildResponseHistory(monitor, range);
    },
  });
}
