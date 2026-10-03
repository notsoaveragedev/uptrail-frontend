import type { MonitorFormValues } from "@/lib/monitorForm";
import type { Monitor } from "@/types/monitor";
import { runFakeTest } from "./monitorTest";
import { newId } from "@/lib/ids";

export function updatedMonitor(monitor: Monitor, values: MonitorFormValues): Monitor {
  return {
    ...monitor,
    name: values.name.trim(),
    url: values.url.trim(),
    type: values.type,
    method: values.method,
    intervalSec: values.intervalSec,
    project: values.project,
    tags: values.tags,
    regions: values.regions.map(
      (code) => monitor.regions.find((region) => region.code === code) ?? { code, status: monitor.status },
    ),
  };
}

export function createdMonitor(values: MonitorFormValues): Monitor {
  const now = Date.now();
  const firstCheck = runFakeTest({
    url: values.url.trim(),
    method: values.method,
    timeoutMs: Number(values.timeoutMs),
    region: values.regions[0] ?? "BOM",
  });
  const status = firstCheck.ok ? "up" : "down";
  const base: Monitor = {
    id: newId("mon"),
    name: "",
    url: "",
    type: values.type,
    method: values.method,
    intervalSec: values.intervalSec,
    project: values.project,
    tags: [],
    status,
    statusSince: now,
    latencyMs: firstCheck.ok ? firstCheck.totalMs : null,
    uptime24h: firstCheck.ok ? 100 : 0,
    uptime30d: firstCheck.ok ? 100 : 0,
    regions: [],
    checks: [status],
    latencyHistory: [firstCheck.totalMs, firstCheck.totalMs],
    lastCheckedAt: now,
  };
  return { ...updatedMonitor(base, values), status };
}
