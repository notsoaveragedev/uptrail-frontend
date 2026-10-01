import { useQuery } from "@tanstack/react-query";
import { publicStatusQuery } from "@/api/publicStatus";
import { BACKOFF_MS, isNotFoundError, POLL_MS } from "@/lib/publicStatus";

const queries = new Map<string, ReturnType<typeof publicStatusQuery>>();

function statusQueryFor(slug: string) {
  if (!queries.has(slug)) queries.set(slug, publicStatusQuery(slug));
  return queries.get(slug)!;
}

export function useStatusSnapshot(slug: string) {
  return useQuery({
    ...statusQueryFor(slug),
    throwOnError: false,
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 2,
    refetchInterval: (query) => (query.state.fetchFailureCount > 0 ? BACKOFF_MS : POLL_MS),
  });
}
