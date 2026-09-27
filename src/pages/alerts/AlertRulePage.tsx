import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { alertRuleQuery } from "@/api/alerts";
import { RuleEditor } from "@/components/alert-rule/RuleEditor";
import { RuleEditorSkeleton } from "@/components/alert-rule/RuleEditorSkeleton";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";

export function AlertRulePage() {
  const { orgSlug = "", ruleId } = useParams();
  const [searchParams] = useSearchParams();
  const { data: rule, isPending, isError } = useQuery({ ...alertRuleQuery(orgSlug, ruleId ?? ""), enabled: !!ruleId });

  if (!ruleId) {
    return <RuleEditor orgSlug={orgSlug} rule={null} initialExpression={searchParams.get("expression")} />;
  }
  if (isPending) return <RuleEditorSkeleton />;
  if (isError || !rule) return <InAppNotFoundPage />;
  return <RuleEditor key={rule.id} orgSlug={orgSlug} rule={rule} initialExpression={null} />;
}
