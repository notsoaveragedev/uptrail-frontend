import { LuActivity, LuGauge, LuShieldCheck, LuSiren } from "react-icons/lu";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { StatusDot } from "@/components/ui/StatusDot";
import { STATUS_FILL, STATUS_LABELS, STATUSES } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";
import type { Kpis, StatusCounts } from "@/types/overview";
import { DeltaPill, KpiCard } from "./KpiCard";

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
