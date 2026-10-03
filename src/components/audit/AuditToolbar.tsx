import { Segmented } from "antd";
import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";
import { AUDIT_RANGES, DEFAULT_AUDIT_RANGE, RESOURCE_LABELS, type AuditFilters } from "@/lib/audit";
import { countBy } from "@/lib/list";
import type { AuditEvent } from "@/types/audit";
import { AuditAction } from "./AuditAction";

type AuditToolbarProps = {
  events: AuditEvent[];
  filters: AuditFilters;
  hasFilters: boolean;
  setParam: (key: string, value: string | string[] | null, fallback?: string) => void;
  onClear: () => void;
};

export function AuditToolbar({ events, filters, hasFilters, setParam, onClear }: AuditToolbarProps) {
  const actorCounts = countBy(events, (event) => event.actor.name);
  const actionCounts = countBy(events, (event) => event.action);
  const resourceCounts = countBy(events, (event) => event.resource.type);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        aria-label="Time range"
        value={filters.range}
        onChange={(range) => setParam("range", range, DEFAULT_AUDIT_RANGE)}
        options={AUDIT_RANGES.map((range) => ({ value: range, label: range }))}
      />
      <ToolbarDivider />
      <FacetFilter
        label="Actor"
        selected={filters.actors}
        onChange={(values) => setParam("actor", values)}
        options={Object.keys(actorCounts)
          .sort()
          .map((name) => ({ value: name, label: name, count: actorCounts[name] }))}
      />
      <FacetFilter
        label="Action"
        selected={filters.actions}
        onChange={(values) => setParam("action", values)}
        options={Object.keys(actionCounts)
          .sort()
          .map((action) => ({
            value: action,
            label: <AuditAction action={action} />,
            searchText: action,
            count: actionCounts[action],
          }))}
      />
      <FacetFilter
        label="Resource"
        selected={filters.resources}
        onChange={(values) => setParam("resource", values)}
        options={Object.keys(resourceCounts).map((type) => ({
          value: type,
          label: RESOURCE_LABELS[type] ?? type,
          count: resourceCounts[type],
        }))}
      />
      <ResetFiltersButton isVisible={hasFilters} onClick={onClear} />
      <ToolbarSearch
        label="Search audit log"
        placeholder="Resource, IP or request ID"
        value={filters.query}
        onChange={(value) => setParam("q", value)}
      />
    </div>
  );
}
