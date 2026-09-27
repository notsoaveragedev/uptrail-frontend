import { Tag } from "antd";
import { useLogsFilters } from "@/hooks/useLogsFilters";
import { toggleItem } from "@/lib/list";
import { CHECK_STATUS_LABELS, FACET_FILTERS, FACET_KEYS, FACET_LABELS } from "@/lib/logs";
import { MONITORS } from "@/mocks/monitors";
import type { CheckStatus, FacetKey } from "@/types/logs";

function valueLabel(facet: FacetKey, value: string) {
  if (facet === "monitor") return MONITORS.find((monitor) => monitor.id === value)?.name ?? value;
  if (facet === "status") return CHECK_STATUS_LABELS[value as CheckStatus] ?? value;
  return value;
}

export function ActiveFilterChips() {
  const { filters, setParam, clearFilters, activeFilterCount } = useLogsFilters();
  if (activeFilterCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {FACET_KEYS.flatMap((facet) => {
        const selected = filters[FACET_FILTERS[facet]];
        return selected.map((value) => (
          <Tag
            key={`${facet}-${value}`}
            closable
            onClose={() => setParam(facet, toggleItem(selected, value))}
            className="m-0"
          >
            <span className="text-subtle">{FACET_LABELS[facet]}:</span> {valueLabel(facet, value)}
          </Tag>
        ));
      })}
      <button type="button" onClick={clearFilters} className="cursor-pointer text-xs text-muted hover:text-ink">
        Clear all
      </button>
    </div>
  );
}
