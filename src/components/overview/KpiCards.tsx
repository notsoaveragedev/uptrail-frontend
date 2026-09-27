import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuActivity, LuGauge, LuShieldCheck, LuSiren } from "react-icons/lu";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { StatusDot } from "@/components/ui/StatusDot";
import { STATUS_FILL, STATUS_LABELS, STATUSES, TONE_BADGE } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";
import type { Kpis, StatusCounts } from "@/types/overview";

type KpiCardsProps = {
  kpis: Kpis;
  counts: StatusCounts;
  totalMonitors: number;
};

export function KpiCards({ kpis, counts, totalMonitors }: KpiCardsProps) {
  const fleet = STATUSES.flatMap((status) => Array<MonitorStatus>(counts[status]).fill(status));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={LuShieldCheck}
        label="Uptime 24h"
        sublabel={`SLO ${kpis.slo}%`}
        value={kpis.uptime.toFixed(2)}
        unit="%"
        caption="+0.02% vs prev 24h"
        pill={<DeltaPill tone="good">SLO met</DeltaPill>}
      />
      <KpiCard
        icon={LuGauge}
        label="p95 latency"
        sublabel="fleet-wide"
        value={String(kpis.p95)}
        unit="ms"
        caption={`${kpis.p95Previous} ms prev 24h`}
        pill={<DeltaPill tone="bad">▲ {kpis.p95 - kpis.p95Previous} ms</DeltaPill>}
      />
      <KpiCard
        icon={LuActivity}
        label="Monitors"
        sublabel="3 regions"
        value={String(totalMonitors)}
        visual={<CheckTrail checks={fleet} />}
        caption={
          <span className="flex gap-3">
            {STATUSES.map((status) => (
              <span key={status} title={STATUS_LABELS[status]} className="flex items-center gap-1.5">
                <StatusDot fill={STATUS_FILL[status]} />
                {counts[status]}
              </span>
            ))}
          </span>
        }
      />
      <KpiCard
        icon={LuSiren}
        label="Open incidents"
        sublabel="1 critical"
        value={String(kpis.openIncidents)}
        caption={`MTTR 30d ${kpis.mttrMinutes}m`}
        pill={<DeltaPill tone="good">▼ {kpis.openIncidentsPrevious - kpis.openIncidents}</DeltaPill>}
      />
    </div>
  );
}

type KpiCardProps = {
  icon: IconType;
  label: string;
  sublabel: string;
  value: string;
  unit?: string;
  visual?: ReactNode;
  caption: ReactNode;
  pill?: ReactNode;
};

function KpiCard({ icon: Icon, label, sublabel, value, unit, visual, caption, pill }: KpiCardProps) {
  return (
    <section className="flex flex-col rounded-lg border border-line bg-card transition-colors hover:border-line-strong">
      <div className="flex items-center gap-2 px-5 pt-4">
        <Icon aria-hidden className="size-3.5 text-subtle" />
        <h2 className="text-caps font-semibold tracking-widest text-muted uppercase">{label}</h2>
        <span className="ml-auto font-mono text-xs text-subtle">{sublabel}</span>
      </div>
      <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
        <p className="font-mono text-display font-medium tracking-tight">
          {value}
          {unit && <span className="ml-1 text-xs text-subtle">{unit}</span>}
        </p>
        {visual}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-5 py-2.5 font-mono text-xs text-subtle">
        {caption}
        {pill}
      </div>
    </section>
  );
}

function DeltaPill({ tone, children }: { tone: "good" | "bad"; children: ReactNode }) {
  return <span className={`rounded-sm px-1.5 py-0.5 ${TONE_BADGE[tone === "good" ? "up" : "down"]}`}>{children}</span>;
}
