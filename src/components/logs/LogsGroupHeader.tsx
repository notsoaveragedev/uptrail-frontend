import { CheckTrail } from "@/components/monitors/CheckTrail";
import { latencyText } from "@/lib/format";
import type { LogsGroup } from "@/types/logs";

export function LogsGroupHeader({ group }: { group: LogsGroup }) {
  return (
    <span className="flex min-w-0 items-center gap-4">
      <span className="truncate font-semibold">{group.label}</span>
      <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-subtle">
        <span>{group.count.toLocaleString()} checks</span>·
        <span className={group.failed > 0 ? "text-down" : ""}>{group.failed.toLocaleString()} failed</span>·
        <span>avg {latencyText(group.avgLatencyMs)}</span>·<span>p95 {latencyText(group.p95LatencyMs)}</span>
      </span>
      <CheckTrail checks={group.recent} />
    </span>
  );
}
