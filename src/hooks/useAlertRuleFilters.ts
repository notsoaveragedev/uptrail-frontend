import { useSearchParams } from "react-router";
import { readRuleFilters, RULE_FILTER_KEYS } from "@/lib/alertLists";
import { writeParam } from "@/lib/searchParams";

export function useAlertRuleFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  function setParam(key: string, value: string | string[] | null) {
    setSearchParams((params) => writeParam(params, key, value), { replace: key === "q" });
  }

  function clear() {
    setSearchParams((params) => {
      RULE_FILTER_KEYS.forEach((key) => params.delete(key));
      return params;
    });
  }

  return {
    filters: readRuleFilters(searchParams),
    hasFilters: RULE_FILTER_KEYS.some((key) => searchParams.has(key)),
    setParam,
    clear,
  };
}
