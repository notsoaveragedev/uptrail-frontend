import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { apiKeyStore } from "@/mocks/settingsStore";
import type { ApiKey } from "@/types/apiKey";
import { useUpsertMutation } from "./optimistic";

function apiKeysKey(orgSlug: string) {
  return ["api-keys", orgSlug] as const;
}

export function apiKeysQuery(orgSlug: string) {
  return queryOptions({
    queryKey: apiKeysKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(300);
      return apiKeyStore.list();
    },
  });
}

export function useSaveApiKey(orgSlug: string) {
  return useUpsertMutation<ApiKey>(apiKeysKey(orgSlug), apiKeyStore);
}
