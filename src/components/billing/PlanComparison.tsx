import { LuCheck } from "react-icons/lu";
import { formatCents } from "@/lib/billing";
import { cycleUnit, PLAN_NAMES, planFeatures, PRO_PRICE_CENTS } from "@/lib/plans";
import type { BillingCycle, PlanKey } from "@/types/billing";

const PLAN_SUMMARIES: Record<PlanKey, string> = {
  free: "For side projects and small teams.",
  pro: "For teams that go on call.",
};

export function PlanComparison({ cycle, current }: { cycle: BillingCycle; current: PlanKey }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(["pro", "free"] as const).map((plan) => (
        <PlanCard key={plan} plan={plan} cycle={cycle} isCurrent={plan === current} />
      ))}
    </div>
  );
}

function PlanCard({ plan, cycle, isCurrent }: { plan: PlanKey; cycle: BillingCycle; isCurrent: boolean }) {
  const isPro = plan === "pro";
  const price = isPro ? formatCents(PRO_PRICE_CENTS[cycle]).replace(".00", "") : "$0";

  return (
    <article className={`flex flex-col rounded-lg border bg-card p-5 ${isPro ? "border-line-strong" : "border-line"}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-md font-semibold">{PLAN_NAMES[plan]}</h2>
        {isCurrent && <span className="rounded-sm bg-hover px-1.5 text-xs text-muted">Current plan</span>}
      </div>
      <p className="mt-1 text-muted">{PLAN_SUMMARIES[plan]}</p>
      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-mono text-display font-medium tracking-tight">{price}</span>
        <span className="text-xs text-subtle">{isPro ? `per ${cycleUnit(cycle)}` : "forever"}</span>
      </p>
      <dl className="mt-5 flex flex-col divide-y divide-line border-y border-line">
        {planFeatures(plan).map((feature) => (
          <div key={feature.label} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-muted">{feature.label}</dt>
            <dd
              className={`flex items-center gap-1.5 font-mono text-xs ${feature.value === "Not included" ? "text-subtle" : "text-ink"}`}
            >
              {isPro && <LuCheck aria-hidden className="size-3.5 text-up" />}
              {feature.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
