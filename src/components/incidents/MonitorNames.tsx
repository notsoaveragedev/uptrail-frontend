import { Tooltip } from "antd";
import type { Monitor } from "@/types/monitor";

const VISIBLE = 2;

export function MonitorNames({ monitorIds, monitors }: { monitorIds: string[]; monitors: Monitor[] }) {
  const names = monitorIds.map((id) => monitors.find((monitor) => monitor.id === id)?.name ?? id);
  if (names.length === 0) return <span className="text-subtle">—</span>;

  const hidden = names.slice(VISIBLE);
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate text-muted">{names.slice(0, VISIBLE).join(", ")}</span>
      {hidden.length > 0 && (
        <Tooltip title={hidden.join(", ")}>
          <span className="shrink-0 rounded-sm bg-hover px-1 font-mono text-xs text-muted">+{hidden.length}</span>
        </Tooltip>
      )}
    </span>
  );
}
