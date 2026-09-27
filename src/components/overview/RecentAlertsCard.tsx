import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import type { AlertEvent } from "@/types/overview";

const STATE_STYLES = {
  unacknowledged: { dot: "bg-down", text: "text-down" },
  acknowledged: { dot: "bg-paused", text: "text-subtle" },
  resolved: { dot: "bg-up", text: "text-up" },
};

function stateLabel(alert: AlertEvent) {
  if (alert.state === "unacknowledged") return "Unacknowledged";
  if (alert.state === "resolved") return "Resolved";
  return `Ack · ${alert.actor}`;
}

export function RecentAlertsCard({ alerts }: { alerts: AlertEvent[] }) {
  const { orgSlug } = useParams();

  return (
    <Card title="Recent alerts" extra={<Link to={`/o/${orgSlug}/alerts`}>View all</Link>}>
      <ul className="divide-y divide-line px-4 pb-1">
        {alerts.map((alert) => {
          const styles = STATE_STYLES[alert.state];
          return (
            <li key={alert.id} className="py-2.5">
              <p className="truncate font-mono text-xs text-ink">{alert.rule}</p>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                <span className="text-subtle">
                  {alert.monitorName} · {alert.time}
                </span>
                <span className={`flex items-center gap-1.5 ${styles.text}`}>
                  <span className={`size-1.5 rounded-full ${styles.dot}`} />
                  {stateLabel(alert)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
