import { useQuery } from "@tanstack/react-query";
import { Button, Empty } from "antd";
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
import { filterMonitors } from "@/lib/monitorList";
import type { MonitorStatus } from "@/types/monitor";

export function MonitorsPage() {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const { data: monitors = [], isPending, error } = useQuery(monitorsQuery(orgSlug));
  const { filters, hasFilters, setParam, clear } = useMonitorFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (error) throw error;

  const visible = filterMonitors(monitors, filters);
  const liveSelection = selectedIds.filter((id) => monitors.some((monitor) => monitor.id === id));

  function toggleStatus(status: MonitorStatus) {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((item) => item !== status)
      : [...filters.statuses, status];
    setParam("status", next);
  }

  const emptyState = hasFilters ? (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No monitors match these filters.">
      <Button onClick={clear}>Reset filters</Button>
    </Empty>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No monitors yet. Add a URL to start checking it.">
      <Button type="primary" onClick={() => navigate(`/o/${orgSlug}/monitors/new`)}>
        Create monitor
      </Button>
    </Empty>
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
              emptyText={<div className="py-8">{emptyState}</div>}
            />
          )}
        </SectionErrorBoundary>
      </div>
      <BulkActionBar selectedIds={liveSelection} onClear={() => setSelectedIds([])} />
    </>
  );
}
