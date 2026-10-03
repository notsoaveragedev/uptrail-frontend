import { SeverityTag } from "@/components/alerts/SeverityTag";
import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { ListTabs } from "@/components/ui/ListTabs";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { useIncidentFilters } from "@/hooks/useIncidentFilters";
import { SEVERITIES, SEVERITY_LABELS } from "@/lib/alerts";
import { ASSIGNEE_ME, INCIDENT_TABS, UNASSIGNED, type IncidentTab } from "@/lib/incidents";
import { countBy } from "@/lib/list";
import { PROJECT_OPTIONS } from "@/lib/monitors";
import { INCIDENT_PEOPLE } from "@/mocks/incidents";
import { currentUser } from "@/mocks/workspace";
import type { Incident } from "@/types/incident";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";

type IncidentsToolbarProps = {
  incidents: Incident[];
  tabCounts: Record<IncidentTab, number>;
};

const TAB_LABELS: Record<IncidentTab, string> = { open: "Open", resolved: "Resolved" };

export function IncidentsToolbar({ incidents, tabCounts }: IncidentsToolbarProps) {
  const { tab, filters, hasFilters, setTab, setParam, clear } = useIncidentFilters();
  const severityCounts = countBy(incidents, (incident) => incident.severity);
  const projectCounts = countBy(incidents, (incident) => incident.project);
  const assigneeCounts = countBy(incidents, (incident) =>
    incident.assignee === currentUser.name ? ASSIGNEE_ME : (incident.assignee ?? UNASSIGNED),
  );
  const others = INCIDENT_PEOPLE.filter((name) => name !== currentUser.name);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ListTabs
        label="Incident status"
        value={tab}
        onChange={setTab}
        tabs={INCIDENT_TABS.map((value) => ({ value, label: TAB_LABELS[value], count: tabCounts[value] }))}
      />
      <ToolbarDivider />
      <FacetFilter
        label="Severity"
        selected={filters.severities}
        onChange={(values) => setParam("severity", values)}
        options={[...SEVERITIES].reverse().map((severity) => ({
          value: severity,
          label: <SeverityTag severity={severity} />,
          searchText: SEVERITY_LABELS[severity],
          count: severityCounts[severity],
        }))}
      />
      <FacetFilter
        label="Project"
        selected={filters.projects}
        onChange={(values) => setParam("project", values)}
        options={PROJECT_OPTIONS.map((project) => ({ ...project, count: projectCounts[project.value] }))}
      />
      <FacetFilter
        label="Assignee"
        selected={filters.assignees}
        onChange={(values) => setParam("assignee", values)}
        options={[
          {
            value: ASSIGNEE_ME,
            label: <PersonLabel name={currentUser.name} suffix="(you)" />,
            count: assigneeCounts[ASSIGNEE_ME],
          },
          ...others.map((name) => ({ value: name, label: <PersonLabel name={name} />, count: assigneeCounts[name] })),
          {
            value: UNASSIGNED,
            label: <span className="text-muted">Unassigned</span>,
            count: assigneeCounts[UNASSIGNED],
          },
        ]}
      />
      <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
      <ToolbarSearch
        label="Search incidents"
        placeholder="Search by ID or title"
        value={filters.query}
        onChange={(value) => setParam("q", value)}
      />
    </div>
  );
}

function PersonLabel({ name, suffix }: { name: string; suffix?: string }) {
  return (
    <span className="flex items-center gap-2">
      <PersonAvatar name={name} hasTooltip={false} />
      {name}
      {suffix && <span className="text-subtle">{suffix}</span>}
    </span>
  );
}
