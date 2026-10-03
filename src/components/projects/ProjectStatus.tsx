import { StatusBadge } from "@/components/monitors/StatusBadge";
import type { ProjectHealth } from "@/lib/projects";

const LABELS = { up: "All up", degraded: "Degraded", down: "Down", paused: "Paused" };

export function ProjectStatus({ health }: { health: ProjectHealth }) {
  if (!health.worst) return <StatusBadge status="paused" label="No monitors" />;
  return <StatusBadge status={health.worst} label={LABELS[health.worst]} />;
}
