import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { paths } from "@/lib/paths";
import { STATUS_TEXT } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";
import type { AlertEvent } from "@/types/overview";

const STATE_TONE: Record<AlertEvent["state"], MonitorStatus> = {
  unacknowledged: "down",
  acknowledged: "paused",
  resolved: "up",
};

function stateLabel(alert: AlertEvent) {
  if (alert.state === "unacknowledged") return "Unacknowledged";
  if (alert.state === "resolved") return "Resolved";
  return `Ack · ${alert.actor}`;
}

export function RecentAlertsCard({ alerts }: { alerts: AlertEvent[] }) {
  const { orgSlug = "" } = useParams();

  return (
    <Card title="Recent alerts" extra={<Link to={paths.alerts(orgSlug)}>View all</Link>}>
      <ul className="divide-y divide-line px-4 pb-1">
        {alerts.map((alert) => (
          <li key={alert.id} className="py-2.5">
            <p className="truncate font-mono text-xs text-ink">{alert.rule}</p>
            <div className="mt-1 flex items-center justify-between gap-2 text-xs">
              <span className="text-subtle">
                {alert.monitorName} · {alert.time}
              </span>
              <span className={`flex items-center gap-1.5 ${STATUS_TEXT[STATE_TONE[alert.state]]}`}>
                <StatusDot />
                {stateLabel(alert)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
