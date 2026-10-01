import { LuWrench } from "react-icons/lu";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { COMPONENT_STATUS_LABELS } from "@/lib/publicStatus";
import { TONE_BADGE } from "@/lib/status";
import type { ComponentStatus } from "@/types/statusPage";

export function ComponentStatusBadge({ status }: { status: ComponentStatus }) {
  if (status !== "maintenance") return <StatusBadge status={status} label={COMPONENT_STATUS_LABELS[status]} />;

  return (
    <span className={`inline-flex h-5 items-center gap-1 rounded-sm px-1.5 text-xs font-medium ${TONE_BADGE.info}`}>
      <LuWrench aria-hidden className="size-3 shrink-0" />
      {COMPONENT_STATUS_LABELS.maintenance}
    </span>
  );
}
