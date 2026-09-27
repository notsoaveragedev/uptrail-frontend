import { useSearchParams } from "react-router";
import { HISTORY_RANGES, HISTORY_STATUSES, type HistoryRange, type HistoryStatus } from "@/lib/alertLists";
import { readEnum, writeParam } from "@/lib/searchParams";

const DEFAULT_STATUS: HistoryStatus = "all";
const DEFAULT_RANGE: HistoryRange = "7d";

export function useAlertHistoryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    ruleId: searchParams.get("rule"),
    status: readEnum(searchParams, "status", HISTORY_STATUSES, DEFAULT_STATUS),
    range: readEnum(searchParams, "range", HISTORY_RANGES, DEFAULT_RANGE),
  };

  function setRule(ruleId: string | null) {
    setSearchParams((params) => writeParam(params, "rule", ruleId));
  }

  function setStatus(status: HistoryStatus) {
    setSearchParams((params) => writeParam(params, "status", status, DEFAULT_STATUS));
  }

  function setRange(range: HistoryRange) {
    setSearchParams((params) => writeParam(params, "range", range, DEFAULT_RANGE));
  }

  function clear() {
    setSearchParams((params) => {
      ["rule", "status"].forEach((key) => params.delete(key));
      return params;
    });
  }

  const hasFilters = filters.ruleId !== null || filters.status !== DEFAULT_STATUS;

  return { filters, hasFilters, setRule, setStatus, setRange, clear };
}
