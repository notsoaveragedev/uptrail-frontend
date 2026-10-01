import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { alertEventsQuery, alertRulesQuery } from "@/api/alerts";
import { ExpressionText } from "@/components/alerts/ExpressionText";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { paths } from "@/lib/paths";
import type { Incident } from "@/types/incident";

export function RelatedAlerts({ incident }: { incident: Incident }) {
  const { orgSlug = "" } = useParams();
  const { data: events = [] } = useQuery(alertEventsQuery(orgSlug));
  const { data: rules = [] } = useQuery(alertRulesQuery(orgSlug));
  const related = events.filter(
    (event) => event.incidentId === incident.id || incident.alertEventIds.includes(event.id),
  );

  return (
    <Card title="Related alerts" meta={related.length}>
      {related.length === 0 ? (
        <p className="px-4 pb-4 text-muted">No alerts fired for this incident.</p>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {related.map((event) => {
            const rule = rules.find((item) => item.id === event.ruleId);
            return (
              <li key={event.id} className="border-b border-line last:border-b-0">
                <Link
                  to={paths.alertHistory(orgSlug, { rule: event.ruleId, range: "30d" })}
                  className="flex flex-col gap-1 px-4 py-3 text-ink hover:bg-hover hover:text-ink"
                >
                  <span className="flex items-center gap-2">
                    <StatusDot className={event.status === "firing" ? "animate-pulse text-down" : "text-up"} />
                    <span className="truncate font-medium">{rule?.name ?? "Deleted rule"}</span>
                    <span className="ml-auto shrink-0 font-mono text-xs text-subtle">
                      <TimeAgo timestamp={event.firedAt} intervalMs={30_000} />
                    </span>
                  </span>
                  {rule && <ExpressionText expression={rule.expression} className="text-muted" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
