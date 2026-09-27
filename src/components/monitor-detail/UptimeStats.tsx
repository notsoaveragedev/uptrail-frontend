import type { ReactNode } from "react";
import { LatencyValue } from "@/components/monitors/LatencyValue";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import type { MonitorDetail } from "@/types/monitorDetail";

export function UptimeStats({ uptime, latency }: Pick<MonitorDetail, "uptime" | "latency">) {
  const uptimeStats = [
    { label: "Uptime 24h", value: uptime.day },
    { label: "Uptime 7d", value: uptime.week },
    { label: "Uptime 30d", value: uptime.month },
    { label: "Uptime 90d", value: uptime.quarter },
  ];
  const latencyStats = [
    { label: "Avg response", value: latency.avg },
    { label: "p95", value: latency.p95 },
    { label: "p99", value: latency.p99 },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,4fr)_minmax(0,3fr)]">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {uptimeStats.map((stat) => (
          <Stat key={stat.label} label={stat.label}>
            <UptimeValue value={stat.value} />
          </Stat>
        ))}
      </dl>
      <dl className="grid grid-cols-3 gap-4">
        {latencyStats.map((stat) => (
          <Stat key={stat.label} label={stat.label}>
            {stat.value === null ? "—" : <LatencyValue ms={stat.value} />}
          </Stat>
        ))}
      </dl>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-card px-4 py-3.5 transition-colors hover:border-line-strong">
      <dt className="text-caps font-semibold tracking-widest text-muted uppercase">{label}</dt>
      <dd className="font-mono text-display font-medium tracking-tight text-ink">{children}</dd>
    </div>
  );
}
