import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { buildOverview } from "@/mocks/overview";
import type { TimeRange } from "@/types/overview";

export function overviewOrgKey(orgSlug: string) {
  return ["overview", orgSlug] as const;
}

export function overviewKey(orgSlug: string, range: TimeRange) {
  return [...overviewOrgKey(orgSlug), range] as const;
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
