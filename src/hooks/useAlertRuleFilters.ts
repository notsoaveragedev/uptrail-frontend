import { readRuleFilters, RULE_FILTER_KEYS } from "@/lib/alertLists";
import { useFilterParams } from "./useFilterParams";

export function useAlertRuleFilters() {
  return useFilterParams(RULE_FILTER_KEYS, readRuleFilters);
}
