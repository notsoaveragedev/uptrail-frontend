import { StatusDot } from "@/components/ui/StatusDot";
import { RULE_STATE_LABELS, RULE_STATE_TONE } from "@/lib/alerts";
import { STATUS_FILL, TONE_TEXT } from "@/lib/status";
import type { AlertRuleState } from "@/types/alerts";

export function RuleStateLabel({ state }: { state: AlertRuleState }) {
  const tone = RULE_STATE_TONE[state];
  return (
    <span className={`flex items-center gap-1.5 ${TONE_TEXT[tone]}`}>
      <StatusDot
        fill={tone === "info" ? "bg-maintenance" : STATUS_FILL[tone]}
        className={state === "firing" ? "animate-pulse" : ""}
      />
      {RULE_STATE_LABELS[state]}
    </span>
  );
}
