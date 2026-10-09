import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { billingQuery } from "@/api/billing";
import { PLAN_LIMITS } from "@/lib/plans";

export function usePlan() {
  const { orgSlug = "" } = useParams();
  const { data: billing } = useQuery(billingQuery(orgSlug));
  const plan = billing?.plan ?? null;
  return { plan, memberLimit: plan ? PLAN_LIMITS[plan].members : null, memberCount: billing?.usage.members ?? null };
}
