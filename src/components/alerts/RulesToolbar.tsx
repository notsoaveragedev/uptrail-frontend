import { Button } from "antd";
import { LuPlus } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { useAlertRuleFilters } from "@/hooks/useAlertRuleFilters";
import { SEVERITIES, SEVERITY_LABELS } from "@/lib/alerts";
import { RULE_STATES } from "@/lib/alertLists";
import { countBy } from "@/lib/list";
import { PROJECT_OPTIONS } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { AlertRule } from "@/types/alerts";
import { RuleStateLabel } from "./RuleStateLabel";
import { SeverityTag } from "./SeverityTag";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";

export function RulesToolbar({ rules }: { rules: AlertRule[] }) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const { filters, hasFilters, setParam, clear } = useAlertRuleFilters();

  const projectCounts = countBy(rules, (rule) => rule.project);
  const stateCounts = countBy(rules, (rule) => rule.state);
  const severityCounts = countBy(rules, (rule) => rule.severity);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolbarSearch
        label="Search rules"
        placeholder="Search by name or expression"
        value={filters.query}
        onChange={(value) => setParam("q", value)}
        className=""
      />
      <FacetFilter
        label="Project"
        selected={filters.projects}
        onChange={(values) => setParam("project", values)}
        options={PROJECT_OPTIONS.map((project) => ({ ...project, count: projectCounts[project.value] }))}
      />
      <FacetFilter
        label="State"
        selected={filters.states}
        onChange={(values) => setParam("state", values)}
        options={RULE_STATES.map((state) => ({
          value: state,
          label: <RuleStateLabel state={state} />,
          count: stateCounts[state],
        }))}
      />
      <FacetFilter
        label="Severity"
        selected={filters.severities}
        onChange={(values) => setParam("severity", values)}
        options={SEVERITIES.map((severity) => ({
          value: severity,
          label: <SeverityTag severity={severity} />,
          searchText: SEVERITY_LABELS[severity],
          count: severityCounts[severity],
        }))}
      />
      <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
      <Button
        type="primary"
        icon={<LuPlus />}
        className="ml-auto"
        onClick={() => navigate(paths.alertRuleNew(orgSlug))}
      >
        New rule
      </Button>
    </div>
  );
}
