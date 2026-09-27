import { useQuery } from "@tanstack/react-query";
import { Button, Empty } from "antd";
import { useState } from "react";
import { useParams } from "react-router";
import { alertChannelsQuery, alertRulesQuery } from "@/api/alerts";
import { AlertTableSkeleton } from "@/components/alerts/AlertTableSkeleton";
import { RuleBulkBar } from "@/components/alerts/RuleBulkBar";
import { RulesEmptyState } from "@/components/alerts/RulesEmptyState";
import { RulesTable } from "@/components/alerts/RulesTable";
import { RulesToolbar } from "@/components/alerts/RulesToolbar";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { useAlertRuleFilters } from "@/hooks/useAlertRuleFilters";
import { filterRules } from "@/lib/alertLists";

const SKELETON_COLUMNS = ["w-4", "w-14", "w-40", "flex-1", "w-16", "w-12", "w-14", "w-12", "w-8"];

export function AlertRulesPage() {
  const { orgSlug = "" } = useParams();
  const { data: rules = [], isPending } = useQuery(alertRulesQuery(orgSlug));
  const { data: channels = [] } = useQuery(alertChannelsQuery(orgSlug));
  const { filters, hasFilters, clear } = useAlertRuleFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visible = filterRules(rules, filters);
  const selected = rules.filter((rule) => selectedIds.includes(rule.id));

  const emptyState = hasFilters ? (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rules match these filters.">
      <Button onClick={clear}>Reset filters</Button>
    </Empty>
  ) : (
    <RulesEmptyState />
  );

  return (
    <>
      <title>Alert rules · Uptrail</title>
      <div className="flex flex-col gap-4 pt-4 pb-24">
        <RulesToolbar rules={rules} />
        <SectionErrorBoundary>
          {isPending ? (
            <AlertTableSkeleton columns={SKELETON_COLUMNS} />
          ) : (
            <RulesTable
              rules={visible}
              channels={channels}
              selectedIds={selected.map((rule) => rule.id)}
              onSelect={setSelectedIds}
              emptyText={<div className="py-10">{emptyState}</div>}
            />
          )}
        </SectionErrorBoundary>
      </div>
      <RuleBulkBar selected={selected} onClear={() => setSelectedIds([])} />
    </>
  );
}
