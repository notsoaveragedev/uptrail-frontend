import { StatusIcon } from "@/components/monitors/StatusIcon";
import { useLogsFilters } from "@/hooks/useLogsFilters";
import { CHECK_STATUS_LABELS } from "@/lib/logs";
import { REGIONS } from "@/lib/monitors";
import { MONITORS } from "@/mocks/monitors";
import type { CheckStatus, FacetCounts } from "@/types/logs";
import { FacetSection } from "./FacetSection";

const CHECK_STATUSES: CheckStatus[] = ["down", "degraded", "up"];

const CODE_OPTIONS = [
  { value: "2xx", label: "2xx success" },
  { value: "3xx", label: "3xx redirect" },
  { value: "4xx", label: "4xx client error" },
  { value: "5xx", label: "5xx server error" },
  { value: "none", label: "No response" },
];

const EMPTY_FACETS: FacetCounts = { status: {}, region: {}, monitor: {}, code: {} };

type FacetSidebarProps = {
  facets: FacetCounts | undefined;
  isStale: boolean;
};

export function FacetSidebar({ facets = EMPTY_FACETS, isStale }: FacetSidebarProps) {
  const { filters, setParam, clearFilters, activeFilterCount } = useLogsFilters();
  const monitorOptions = MONITORS.filter((monitor) => monitor.status !== "paused")
    .map((monitor) => ({ value: monitor.id, label: monitor.name, searchText: monitor.name }))
    .sort((a, b) => (facets.monitor[b.value] ?? 0) - (facets.monitor[a.value] ?? 0));

  return (
    <aside
      aria-label="Filters"
      className="flex w-56 shrink-0 flex-col overflow-y-auto rounded-lg border border-line bg-panel"
    >
      <FacetSection
        title="Status"
        options={CHECK_STATUSES.map((status) => ({
          value: status,
          label: (
            <>
              <StatusIcon status={status} className="size-3.5" />
              {CHECK_STATUS_LABELS[status]}
            </>
          ),
          searchText: CHECK_STATUS_LABELS[status],
        }))}
        counts={facets.status}
        selected={filters.statuses}
        isStale={isStale}
        onChange={(values) => setParam("status", values)}
      />
      <FacetSection
        title="Region"
        options={REGIONS.map((region) => ({
          value: region.code,
          label: (
            <>
              <span className="font-mono">{region.code}</span>
              <span className="truncate text-subtle">{region.city}</span>
            </>
          ),
          searchText: region.city,
        }))}
        counts={facets.region}
        selected={filters.regions}
        isStale={isStale}
        onChange={(values) => setParam("region", values)}
      />
      <FacetSection
        title="Monitor"
        options={monitorOptions}
        counts={facets.monitor}
        selected={filters.monitors}
        isStale={isStale}
        onChange={(values) => setParam("monitor", values)}
        collapsedLimit={8}
      />
      <FacetSection
        title="Status code"
        options={CODE_OPTIONS}
        counts={facets.code}
        selected={filters.codes}
        isStale={isStale}
        onChange={(values) => setParam("code", values)}
      />
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="cursor-pointer px-4 py-3 text-left text-xs text-muted hover:text-ink"
        >
          Reset all filters
        </button>
      )}
    </aside>
  );
}
