import { useQuery } from "@tanstack/react-query";
import { Tabs } from "antd";
import { useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { monitorDetailQuery } from "@/api/monitorDetail";
import { monitorsQuery } from "@/api/monitors";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { AlertsTab } from "@/components/monitor-detail/AlertsTab";
import { ChecksTab } from "@/components/monitor-detail/ChecksTab";
import { IncidentBanner } from "@/components/monitor-detail/IncidentBanner";
import { IncidentsTab } from "@/components/monitor-detail/IncidentsTab";
import { MonitorDetailSkeleton } from "@/components/monitor-detail/MonitorDetailSkeleton";
import { MonitorHeader } from "@/components/monitor-detail/MonitorHeader";
import { OverviewTab } from "@/components/monitor-detail/OverviewTab";
import { SettingsTab } from "@/components/monitor-detail/SettingsTab";
import { CountBadge } from "@/components/ui/CountBadge";
import { useSearchParam } from "@/hooks/useSearchParam";
import { DETAIL_TABS } from "@/lib/monitorDetail";
import { TIME_RANGES } from "@/lib/timeRange";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";
import type { Monitor } from "@/types/monitor";
import type { DetailTab } from "@/types/monitorDetail";

export function MonitorDetailPage() {
  const { orgSlug = "", monitorId } = useParams();
  const { data: monitors } = useQuery(monitorsQuery(orgSlug));

  if (!monitors) return <MonitorDetailSkeleton />;

  const monitor = monitors.find((item) => item.id === monitorId);
  if (!monitor) return <InAppNotFoundPage />;

  return <MonitorDetail key={monitor.id} monitor={monitor} />;
}

function MonitorDetail({ monitor }: { monitor: Monitor }) {
  const { orgSlug = "" } = useParams();
  const { data: detail } = useQuery(monitorDetailQuery(orgSlug, monitor));
  const [tab, setTab] = useSearchParam("tab", DETAIL_TABS, "overview");
  const [range, setRange] = useSearchParam("range", TIME_RANGES, "24h", { replace: true });

  const { data: incidentCount = 0 } = useQuery({
    ...incidentsQuery(orgSlug),
    select: (incidents) => incidents.filter((incident) => incident.monitorIds.includes(monitor.id)).length,
  });

  return (
    <>
      <title>{`${monitor.name} · Uptrail`}</title>
      {!detail ? (
        <MonitorDetailSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <MonitorHeader monitor={monitor} />
          <IncidentBanner monitorId={monitor.id} />
          <Tabs
            activeKey={tab}
            onChange={(value) => setTab(value as DetailTab)}
            items={[
              {
                key: "overview",
                label: "Overview",
                children: <OverviewTab monitor={monitor} detail={detail} range={range} onRangeChange={setRange} />,
              },
              {
                key: "checks",
                label: "Checks",
                children: <ChecksTab monitorId={monitor.id} checks={detail.checks} />,
              },
              {
                key: "incidents",
                label: <TabLabel label="Incidents" count={incidentCount} />,
                children: <IncidentsTab monitorId={monitor.id} />,
              },
              {
                key: "alerts",
                label: <TabLabel label="Alerts" count={detail.alertHistory.length} />,
                children: <AlertsTab rules={detail.rules} history={detail.alertHistory} />,
              },
              {
                key: "settings",
                label: "Settings",
                children: <SettingsTab monitorId={monitor.id} config={detail.config} />,
              },
            ].map((item) => ({ ...item, children: <SectionErrorBoundary>{item.children}</SectionErrorBoundary> }))}
          />
        </div>
      )}
    </>
  );
}

function TabLabel({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      <CountBadge count={count} isMuted />
    </span>
  );
}
