import type { Monitor } from "@/types/monitor";
import { MonitorRowActions } from "./MonitorRowActions";
import { TimeAgo } from "./TimeAgo";

export function LastCheckedCell({ monitor }: { monitor: Monitor }) {
  return (
    <span className="relative flex justify-end">
      <span className="font-mono text-xs text-subtle group-focus-within:invisible group-hover:invisible">
        <TimeAgo timestamp={monitor.lastCheckedAt} />
      </span>
      <span className="row-actions absolute top-1/2 right-0 -translate-y-1/2">
        <MonitorRowActions monitor={monitor} />
      </span>
    </span>
  );
}
