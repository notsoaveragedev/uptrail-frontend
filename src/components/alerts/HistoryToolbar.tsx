import { Segmented } from "antd";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useAlertHistoryFilters } from "@/hooks/useAlertHistoryFilters";
import { HISTORY_RANGES, HISTORY_STATUS_LABELS, HISTORY_STATUSES } from "@/lib/alertLists";
import type { AlertRule } from "@/types/alerts";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";

export function HistoryToolbar({ rules }: { rules: AlertRule[] }) {
  const { filters, hasFilters, setRule, setStatus, setRange, clear } = useAlertHistoryFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-60">
        <CustomSelect<string>
          size="middle"
          aria-label="Filter by rule"
          placeholder="All rules"
          allowClear
          showSearch={{ optionFilterProp: "label" }}
          value={filters.ruleId ?? undefined}
          onChange={(value) => setRule(value ?? null)}
          options={rules.map((rule) => ({ value: rule.id, label: rule.name }))}
        />
      </div>
      <Segmented
        aria-label="Status"
        value={filters.status}
        onChange={setStatus}
        options={HISTORY_STATUSES.map((status) => ({ value: status, label: HISTORY_STATUS_LABELS[status] }))}
      />
      <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
      <Segmented
        aria-label="Time range"
        className="ml-auto"
        value={filters.range}
        onChange={setRange}
        options={HISTORY_RANGES.map((range) => ({ value: range, label: range }))}
      />
    </div>
  );
}
