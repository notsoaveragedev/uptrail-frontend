import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { getLogDetail, queryLogs } from "@/mocks/logsServer";
import type { LogsFilters } from "@/types/logs";

const LOGS_PAGE_SIZE = 200;

export function logsQuery(orgSlug: string, filters: LogsFilters) {
  return infiniteQueryOptions({
    queryKey: ["logs", orgSlug, filters],
    queryFn: async ({ pageParam }) => {
      await fakeRequest(250);
      return queryLogs(filters, pageParam, LOGS_PAGE_SIZE);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}

export function logDetailQuery(orgSlug: string, id: string) {
  return queryOptions({
    queryKey: ["logs", orgSlug, "detail", id],
    queryFn: async () => {
      await fakeRequest(200);
      const detail = getLogDetail(id);
      if (!detail) throw new Error("Check result not found");
      return detail;
    },
  });
}
