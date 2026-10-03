import { LuActivity } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { BulkActionBar } from "@/components/monitors-list/BulkActionBar";
import { MonitorCardGrid } from "@/components/monitors-list/MonitorCardGrid";
import { MonitorsHeader } from "@/components/monitors-list/MonitorsHeader";
import { MonitorsTable } from "@/components/monitors-list/MonitorsTable";
import { MonitorsToolbar } from "@/components/monitors-list/MonitorsToolbar";
import { useMonitorFilters } from "@/hooks/useMonitorFilters";
import { toggleItem } from "@/lib/list";
import { filterMonitors } from "@/lib/monitorList";
import { paths } from "@/lib/paths";
import type { MonitorStatus } from "@/types/monitor";
import { EmptyState } from "@/components/ui/EmptyState";

export function MonitorsPage() {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const { data: monitors = [], isPending } = useQuery(monitorsQuery(orgSlug));
  const { filters, hasFilters, setParam, clear } = useMonitorFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visible = filterMonitors(monitors, filters);
  const liveSelection = selectedIds.filter((id) => monitors.some((monitor) => monitor.id === id));

  function toggleStatus(status: MonitorStatus) {
    setParam("status", toggleItem(filters.statuses, status));
  }

  const emptyState = hasFilters ? (
    <EmptyState icon={<LuActivity />} title="No monitors match these filters" onClear={clear} />
  ) : (
    <EmptyState
      icon={<LuActivity />}
      title="No monitors yet"
      description="Add a URL and Uptrail starts checking it from three regions."
      action={
        <Button type="primary" onClick={() => navigate(paths.monitorNew(orgSlug))}>
          Create monitor
        </Button>
      }
    />
  );

  return (
    <>
      <title>Monitors · Uptrail</title>
      <div className="flex flex-col gap-5 pb-24">
        <MonitorsHeader
          monitors={monitors}
          visible={visible}
          selectedStatuses={filters.statuses}
          onToggleStatus={toggleStatus}
        />
        <SectionErrorBoundary>
          <MonitorsToolbar monitors={monitors} />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          {filters.view === "cards" ? (
            visible.length > 0 ? (
              <MonitorCardGrid monitors={visible} />
            ) : (
              <div className="rounded-lg border border-line bg-card py-12">{emptyState}</div>
            )
          ) : (
            <MonitorsTable
              monitors={visible}
              isLoading={isPending}
              selectedIds={liveSelection}
              onSelect={setSelectedIds}
              emptyText={<div className="py-8">{isPending ? <div className="h-40" /> : emptyState}</div>}
            />
          )}
        </SectionErrorBoundary>
      </div>
      <BulkActionBar selectedIds={liveSelection} onClear={() => setSelectedIds([])} />
    </>
  );
}
