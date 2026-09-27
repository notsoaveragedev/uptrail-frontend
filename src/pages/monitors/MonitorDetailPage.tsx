import { useQuery } from "@tanstack/react-query";
import { Tabs } from "antd";
import { useParams, useSearchParams } from "react-router";
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
import { DETAIL_RANGES, DETAIL_TABS } from "@/lib/monitorDetail";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";
import type { Monitor } from "@/types/monitor";
import type { TimeRange } from "@/types/overview";

export function MonitorDetailPage() {
  const { orgSlug = "", monitorId } = useParams();
  const { data: monitors, error } = useQuery(monitorsQuery(orgSlug));

  if (error) throw error;
  if (!monitors) return <MonitorDetailSkeleton />;

  const monitor = monitors.find((item) => item.id === monitorId);
  if (!monitor) return <InAppNotFoundPage />;

  return <MonitorDetail key={monitor.id} monitor={monitor} />;
}

function MonitorDetail({ monitor }: { monitor: Monitor }) {
  const { orgSlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: detail, error } = useQuery(monitorDetailQuery(orgSlug, monitor));
  const tab = DETAIL_TABS.find((value) => value === searchParams.get("tab")) ?? "overview";
  const range = DETAIL_RANGES.find((value) => value === searchParams.get("range")) ?? "24h";

  function updateParam(key: string, value: string, fallback: string) {
    setSearchParams(
      (params) => {
        if (value === fallback) params.delete(key);
        else params.set(key, value);
        return params;
      },
      { replace: key === "range" },
    );
  }

  if (error) throw error;

  const activeIncident = detail?.incidents.find((incident) => incident.resolvedAt === null);

  return (
    <>
      <title>{`${monitor.name} · Uptrail`}</title>
      {!detail ? (
        <MonitorDetailSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <MonitorHeader monitor={monitor} />
          {activeIncident && monitor.status === "down" && <IncidentBanner incident={activeIncident} />}
          <Tabs
            activeKey={tab}
            onChange={(value) => updateParam("tab", value, "overview")}
            items={[
              {
                key: "overview",
                label: "Overview",
                children: (
                  <OverviewTab
                    monitor={monitor}
                    detail={detail}
                    range={range}
                    onRangeChange={(value: TimeRange) => updateParam("range", value, "24h")}
                  />
                ),
              },
              {
                key: "checks",
                label: "Checks",
                children: <ChecksTab monitorId={monitor.id} checks={detail.checks} />,
              },
              {
                key: "incidents",
                label: <TabLabel label="Incidents" count={detail.incidents.length} />,
                children: <IncidentsTab incidents={detail.incidents} />,
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
      <span className="rounded-sm bg-hover px-1.5 font-mono text-xs text-muted">{count}</span>
    </span>
  );
}
