import { useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Segmented } from "antd";
import { LuArrowUpDown, LuLayoutGrid, LuList, LuRefreshCw } from "react-icons/lu";
import { useParams } from "react-router";
import { monitorsKey } from "@/api/monitors";
import { StatusIcon } from "@/components/monitors/StatusIcon";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";
import { useMonitorFilters } from "@/hooks/useMonitorFilters";
import { countBy } from "@/lib/list";
import { SORT_LABELS, type SortKey } from "@/lib/monitorList";
import { MONITOR_TYPE_LABELS, MONITOR_TYPE_VALUES, PROJECT_OPTIONS, TAGS } from "@/lib/monitors";
import { STATUS_LABELS, STATUSES } from "@/lib/status";
import type { Monitor } from "@/types/monitor";
import { FacetFilter } from "./FacetFilter";

export function MonitorsToolbar({ monitors }: { monitors: Monitor[] }) {
  const { orgSlug = "" } = useParams();
  const queryClient = useQueryClient();
  const { filters, hasFilters, setParam, setSort, clear } = useMonitorFilters();

  const statusCounts = countBy(monitors, (monitor) => monitor.status);
  const typeCounts = countBy(monitors, (monitor) => monitor.type);
  const projectCounts = countBy(monitors, (monitor) => monitor.project);
  const tagCounts = countBy(monitors, (monitor) => monitor.tags);

  const sortItems = (Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({ key, label: SORT_LABELS[key] }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolbarSearch
        label="Search monitors"
        placeholder="Search by name or URL"
        value={filters.query}
        onChange={(value) => setParam("q", value)}
        className=""
      />
      <FacetFilter
        label="Status"
        selected={filters.statuses}
        onChange={(values) => setParam("status", values)}
        options={STATUSES.map((status) => ({
          value: status,
          label: (
            <>
              <StatusIcon status={status} className="size-3.5" />
              {STATUS_LABELS[status]}
            </>
          ),
          count: statusCounts[status],
        }))}
      />
      <FacetFilter
        label="Type"
        selected={filters.types}
        onChange={(values) => setParam("type", values)}
        options={MONITOR_TYPE_VALUES.map((type) => ({
          value: type,
          label: MONITOR_TYPE_LABELS[type],
          count: typeCounts[type],
        }))}
      />
      <FacetFilter
        label="Project"
        selected={filters.projects}
        onChange={(values) => setParam("project", values)}
        options={PROJECT_OPTIONS.map((project) => ({ ...project, count: projectCounts[project.value] }))}
      />
      <FacetFilter
        label="Tags"
        selected={filters.tags}
        onChange={(values) => setParam("tag", values)}
        options={TAGS.map((tag) => ({ value: tag, label: tag, count: tagCounts[tag] }))}
      />
      <ResetFiltersButton isVisible={hasFilters} onClick={clear} />

      <div className="ml-auto flex items-center gap-2">
        <Dropdown
          trigger={["click"]}
          menu={{
            items: sortItems,
            selectable: true,
            selectedKeys: [filters.sort.key],
            onClick: ({ key }) => setSort(key as SortKey, key === filters.sort.key && !filters.sort.isDescending),
          }}
        >
          <Button icon={<LuArrowUpDown />}>
            Sort <span className="text-muted">{SORT_LABELS[filters.sort.key]}</span>
          </Button>
        </Dropdown>
        <Segmented
          aria-label="View"
          value={filters.view}
          onChange={(view) => setParam("view", view === "cards" ? "cards" : null)}
          options={[
            { value: "table", icon: <LuList />, title: "Table view" },
            { value: "cards", icon: <LuLayoutGrid />, title: "Cards view" },
          ]}
        />
        <Button
          aria-label="Refresh"
          icon={<LuRefreshCw />}
          onClick={() => queryClient.invalidateQueries({ queryKey: monitorsKey(orgSlug) })}
        />
      </div>
    </div>
  );
}
