import { API_KEY_FILTER_KEYS, API_KEY_TABS, readApiKeyFilters, type ApiKeyTab } from "@/lib/apiKeys";
import { readEnum } from "@/lib/searchParams";
import { useFilterParams } from "./useFilterParams";

export function useApiKeyFilters() {
  const { searchParams, setParam, ...rest } = useFilterParams(API_KEY_FILTER_KEYS, readApiKeyFilters);

  return {
    ...rest,
    tab: readEnum(searchParams, "tab", API_KEY_TABS, "active"),
    setTab: (tab: ApiKeyTab) => setParam("tab", tab, "active"),
    setParam,
  };
}
