import { CheckTrail } from "./CheckTrail";
import { StatusIcon } from "./StatusIcon";
import type { BoardMonitor } from "@/lib/statusBoard";

type BoardRowProps = {
  monitor: BoardMonitor;
  isTrailAlwaysVisible?: boolean;
};

export function BoardRow({ monitor, isTrailAlwaysVisible = false }: BoardRowProps) {
  return (
    <li className={`flex items-center gap-4 px-4 py-3 ${monitor.status === "paused" ? "opacity-60" : ""}`}>
      <StatusIcon status={monitor.status} />
      <span className="flex min-w-0 flex-1 flex-col sm:w-44 sm:flex-none">
        <span className="truncate font-medium">{monitor.name}</span>
        <span className="truncate font-mono text-xs text-subtle">{monitor.url}</span>
      </span>
      <span
        className={`min-w-0 flex-1 justify-end overflow-hidden sm:flex ${isTrailAlwaysVisible ? "flex" : "hidden"}`}
      >
        <CheckTrail checks={monitor.checks} />
      </span>
      <span
        className={`w-16 shrink-0 text-right font-mono text-xs whitespace-nowrap ${monitor.status === "degraded" ? "text-degraded" : "text-ink"}`}
      >
        {monitor.latency}
      </span>
      <span className="hidden w-24 shrink-0 text-right font-mono text-xs whitespace-nowrap text-subtle sm:block">
        {monitor.regions}
      </span>
    </li>
  );
}
