import { LuCircleCheck, LuCrosshair, LuEye, LuSearch } from "react-icons/lu";
import { INCIDENT_STATUS_LABELS, INCIDENT_STATUS_TONE } from "@/lib/incidents";
import { TONE_BADGE } from "@/lib/status";
import type { IncidentStatus } from "@/types/incident";

const ICONS = {
  investigating: LuSearch,
  identified: LuCrosshair,
  monitoring: LuEye,
  resolved: LuCircleCheck,
};

export function IncidentStatusPill({ status }: { status: IncidentStatus }) {
  const Icon = ICONS[status];
  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-sm px-1.5 text-xs font-medium ${TONE_BADGE[INCIDENT_STATUS_TONE[status]]}`}
    >
      <Icon aria-hidden className="size-3" />
      {INCIDENT_STATUS_LABELS[status]}
    </span>
  );
}
