import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { ListTabs } from "@/components/ui/ListTabs";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { useApiKeyFilters } from "@/hooks/useApiKeyFilters";
import { countBy } from "@/lib/list";
import type { ApiKey } from "@/types/apiKey";
import { useProjectOptions } from "@/hooks/useProject";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";

type ApiKeysToolbarProps = {
  keys: ApiKey[];
  tabCounts: { active: number; inactive: number };
};

export function ApiKeysToolbar({ keys, tabCounts }: ApiKeysToolbarProps) {
  const projectOptions = useProjectOptions();
  const { tab, filters, hasFilters, setTab, setParam, clear } = useApiKeyFilters();
  const projectCounts = countBy(keys, (key) => key.projects ?? []);
  const creatorCounts = countBy(keys, (key) => key.createdBy);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ListTabs
        label="Key status"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "active", label: "Active", count: tabCounts.active },
          { value: "inactive", label: "Revoked & expired", count: tabCounts.inactive },
        ]}
      />
      <ToolbarDivider />
      <FacetFilter
        label="Project"
        selected={filters.projects}
        onChange={(values) => setParam("project", values)}
        options={projectOptions.map((project) => ({ ...project, count: projectCounts[project.value] }))}
      />
      <FacetFilter
        label="Created by"
        selected={filters.creators}
        onChange={(values) => setParam("creator", values)}
        options={Object.keys(creatorCounts).map((name) => ({ value: name, label: name, count: creatorCounts[name] }))}
      />
      <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
      <ToolbarSearch
        label="Search API keys"
        placeholder="Search by name or prefix"
        value={filters.query}
        onChange={(value) => setParam("q", value)}
      />
    </div>
  );
}
