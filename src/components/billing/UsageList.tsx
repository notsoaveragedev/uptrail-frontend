import { historyText, intervalText, PLAN_LIMITS } from "@/lib/plans";
import type { OrgBilling } from "@/types/billing";
import { UsageMeter, UsageRow } from "./UsageMeter";

function monitorCaption(used: number, limit: number) {
  const left = limit - used;
  if (left <= 0) return "New monitors are blocked until you upgrade or delete some.";
  return left <= limit * 0.2 ? `${left} left before new monitors are blocked.` : `${left} monitors left on this plan.`;
}

export function UsageList({ billing }: { billing: OrgBilling }) {
  const limits = PLAN_LIMITS[billing.plan];
  const { usage } = billing;

  return (
    <dl className="flex flex-col divide-y divide-line">
      <UsageMeter
        label="Monitors"
        used={usage.monitors}
        limit={limits.monitors}
        caption={monitorCaption(usage.monitors, limits.monitors)}
      />
      {limits.members === null ? (
        <UsageRow
          label="Members"
          value={
            <>
              <span className="text-ink">{usage.members}</span>
              <span className="text-subtle"> · Unlimited</span>
            </>
          }
          caption="Invite as many teammates as you need."
        />
      ) : (
        <UsageMeter
          label="Members"
          used={usage.members}
          limit={limits.members}
          caption={
            usage.members >= limits.members
              ? "Invites are blocked until you upgrade or remove someone."
              : "Includes pending invites."
          }
        />
      )}
      <UsageRow
        label="Check interval"
        value={<span className="text-ink">{intervalText(limits.minIntervalSec)} minimum</span>}
        caption={
          billing.plan === "pro"
            ? `Your fastest monitor checks every ${usage.fastestIntervalSec} seconds.`
            : "Pro checks every 30 seconds."
        }
      />
      <UsageRow
        label="Check history"
        value={<span className="text-ink">{historyText(limits.historyDays)}</span>}
        caption="Check results older than this are deleted."
      />
      <UsageRow
        label="Status pages"
        value={<span className="text-ink">{usage.statusPages}</span>}
        caption="Free on every plan, one per project."
      />
    </dl>
  );
}
