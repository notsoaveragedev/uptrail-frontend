import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { buildOverview } from "@/mocks/overview";
import type { TimeRange } from "@/types/overview";

export function overviewKey(orgSlug: string, range: TimeRange) {
  return ["overview", orgSlug, range] as const;
}

export function overviewQuery(orgSlug: string, range: TimeRange) {
  return queryOptions({
    queryKey: overviewKey(orgSlug, range),
    queryFn: async () => {
      await fakeRequest(400);
      return buildOverview(range);
    },
  });
}
