import { Tag } from "antd";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatDateTime } from "@/lib/format";
import { paths } from "@/lib/paths";
import { TONE_BADGE } from "@/lib/status";
import type { MonitorStatus } from "@/types/monitor";
import type { AlertHistoryItem, AlertRule } from "@/types/monitorDetail";

const ALERT_STATE: Record<AlertHistoryItem["state"], { label: string; tone: MonitorStatus }> = {
  firing: { label: "Firing", tone: "down" },
  acknowledged: { label: "Acknowledged", tone: "degraded" },
  resolved: { label: "Resolved", tone: "up" },
};

type AlertsTabProps = {
  rules: AlertRule[];
  history: AlertHistoryItem[];
};

export function AlertsTab({ rules, history }: AlertsTabProps) {
  const { orgSlug = "" } = useParams();

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card title="Attached rules" meta={rules.length} extra={<Link to={paths.alerts(orgSlug)}>Manage rules</Link>}>
        <ul className="flex flex-col border-t border-line">
          {rules.map((rule) => (
            <li key={rule.id} className="flex flex-col gap-2 border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{rule.name}</span>
                <span className={`flex items-center gap-1.5 text-xs ${rule.isEnabled ? "text-up" : "text-paused"}`}>
                  <StatusDot />
                  {rule.isEnabled ? "Enabled" : "Muted"}
                </span>
              </div>
              <code className="rounded-md border border-line bg-panel px-2.5 py-1.5 font-mono text-xs text-ink">
                {rule.expression}
              </code>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-subtle">
                Notifies
                {rule.channels.map((channel) => (
                  <Tag key={channel} className="m-0 font-mono text-xs">
                    {channel}
                  </Tag>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Alert history" meta={history.length}>
        <ul className="flex flex-col border-t border-line">
          {history.map((alert) => (
            <li key={alert.id} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0">
              <span
                className={`mt-0.5 w-24 shrink-0 rounded-sm px-1.5 py-0.5 text-center text-xs font-medium ${TONE_BADGE[ALERT_STATE[alert.state].tone]}`}
              >
                {ALERT_STATE[alert.state].label}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{alert.rule}</span>
                <span className="truncate text-muted">{alert.detail}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-subtle">{formatDateTime(alert.firedAt)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
