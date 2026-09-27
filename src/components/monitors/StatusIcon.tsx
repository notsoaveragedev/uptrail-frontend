import { LuCircleCheck, LuCirclePause, LuCircleX, LuTriangleAlert } from "react-icons/lu";
import { STATUS_TEXT } from "@/lib/status";
import type { MonitorStatus } from "@/types/overview";

const ICONS = {
  up: LuCircleCheck,
  degraded: LuTriangleAlert,
  down: LuCircleX,
  paused: LuCirclePause,
};

export function StatusIcon({ status, className = "size-4" }: { status: MonitorStatus; className?: string }) {
  const Icon = ICONS[status];
  return <Icon aria-hidden className={`shrink-0 ${STATUS_TEXT[status]} ${className}`} />;
}
