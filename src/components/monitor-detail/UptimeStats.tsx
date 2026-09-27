import type { ReactNode } from "react";
import { formatLatency, formatUptime, uptimeTone } from "@/lib/format";
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
          <Stat key={stat.label} label={stat.label} tone={uptimeTone(stat.value)}>
            {stat.value === null ? "—" : formatUptime(stat.value)}
          </Stat>
        ))}
      </dl>
      <dl className="grid grid-cols-3 gap-4">
        {latencyStats.map((stat) => (
          <Stat key={stat.label} label={stat.label} tone="text-ink">
            {stat.value === null ? "—" : <Latency ms={stat.value} />}
          </Stat>
        ))}
      </dl>
    </div>
  );
}

function Stat({ label, tone, children }: { label: string; tone: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-card px-4 py-3.5 transition-colors hover:border-line-strong">
      <dt className="text-caps font-semibold tracking-widest text-muted uppercase">{label}</dt>
      <dd className={`font-mono text-display font-medium tracking-tight ${tone}`}>{children}</dd>
    </div>
  );
}

function Latency({ ms }: { ms: number }) {
  const { value, unit } = formatLatency(ms);
  return (
    <>
      {value}
      <span className="ml-1 text-xs text-subtle">{unit}</span>
    </>
  );
}
