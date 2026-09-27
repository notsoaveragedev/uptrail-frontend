import { useQuery } from "@tanstack/react-query";
import { Tabs } from "antd";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { alertChannelsQuery, alertEventsQuery, alertRulesQuery } from "@/api/alerts";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { paths } from "@/lib/paths";

const TABS = [
  { key: "rules", label: "Rules" },
  { key: "channels", label: "Channels" },
  { key: "history", label: "History" },
];

export function AlertsLayout() {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const { pathname } = useLocation();
  const { data: rules = [] } = useQuery(alertRulesQuery(orgSlug));
  const { data: channels = [] } = useQuery(alertChannelsQuery(orgSlug));
  const { data: events = [] } = useQuery(alertEventsQuery(orgSlug));
  const activeTab = TABS.find((tab) => pathname.includes(`/alerts/${tab.key}`))?.key ?? "rules";
  const unacknowledged = events.filter((event) => event.status === "firing" && !event.acknowledgedBy).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Alerts"
        meta={
          <MetaList>
            <span>
              <span className="font-mono text-ink">{rules.length}</span> rules
            </span>
            <span>
              <span className="font-mono text-down">{rules.filter((rule) => rule.state === "firing").length}</span>{" "}
              firing
            </span>
            <span>
              <span className="font-mono text-degraded">{rules.filter((rule) => rule.state === "pending").length}</span>{" "}
              pending
            </span>
            <span>
              <span className="font-mono text-ink">{channels.length}</span> channels
            </span>
            <span>
              <span className="font-mono text-ink">{unacknowledged}</span> unacknowledged
            </span>
          </MetaList>
        }
      />
      <Tabs
        activeKey={activeTab}
        onChange={(key) => navigate(`${paths.alerts(orgSlug)}/${key}`)}
        items={TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
        className="-mb-4"
      />
      <Outlet />
    </div>
  );
}
