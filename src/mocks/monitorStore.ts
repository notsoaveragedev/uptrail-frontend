import { applyMonitorChange } from "@/lib/monitors";
import type { Monitor, MonitorChange } from "@/types/monitor";
import { MONITORS } from "./monitors";

let monitors = MONITORS;

export const monitorStore = {
  list: () => monitors,
  apply: (change: MonitorChange) => {
    monitors = applyMonitorChange(monitors, change);
  },
  replace: (next: Monitor[]) => {
    monitors = next;
  },
  add: (added: Monitor[]) => {
    monitors = [...monitors, ...added];
  },
};
