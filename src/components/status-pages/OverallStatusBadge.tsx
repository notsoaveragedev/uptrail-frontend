import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuWrench } from "react-icons/lu";
import { TONE_BADGE, type Tone } from "@/lib/status";
import { OVERALL_STATUS_LABELS, OVERALL_STATUS_TONE } from "@/lib/statusTheme";
import type { OverallStatus } from "@/types/statusPage";

const TONE_ICONS: Record<Tone, typeof LuCircleCheck> = {
  up: LuCircleCheck,
  degraded: LuTriangleAlert,
  down: LuCircleX,
  paused: LuCircleCheck,
  info: LuWrench,
};

export function OverallStatusBadge({ status }: { status: OverallStatus }) {
  const tone = OVERALL_STATUS_TONE[status];
  const Icon = TONE_ICONS[tone];

  return (
    <span className={`inline-flex h-5 items-center gap-1 rounded-sm px-1.5 text-xs font-medium ${TONE_BADGE[tone]}`}>
      <Icon aria-hidden className="size-3 shrink-0" />
      {OVERALL_STATUS_LABELS[status]}
    </span>
  );
}
