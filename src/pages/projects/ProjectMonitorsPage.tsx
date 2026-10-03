import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useState } from "react";
import { LuActivity } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { BulkActionBar } from "@/components/monitors-list/BulkActionBar";
import { MonitorsTable } from "@/components/monitors-list/MonitorsTable";
import { MonitorsToolbar } from "@/components/monitors-list/MonitorsToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMonitorFilters } from "@/hooks/useMonitorFilters";
import { useProject } from "@/hooks/useProject";
import { filterMonitors } from "@/lib/monitorList";
import { paths } from "@/lib/paths";

export function ProjectMonitorsPage() {
  const navigate = useNavigate();
  const { orgSlug = "", projectSlug = "" } = useParams();
  const { project } = useProject();
  const { data: monitors = [], isPending } = useQuery(monitorsQuery(orgSlug));
  const { filters, hasFilters, clear } = useMonitorFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const scoped = monitors.filter((monitor) => monitor.project === projectSlug);
  const visible = filterMonitors(scoped, filters);

  return (
    <div className="flex flex-col gap-3 pb-24">
      <MonitorsToolbar monitors={scoped} />
      <SectionErrorBoundary>
        <MonitorsTable
          monitors={visible}
          isLoading={isPending}
          selectedIds={selectedIds.filter((id) => scoped.some((monitor) => monitor.id === id))}
          onSelect={setSelectedIds}
          emptyText={
            hasFilters ? (
              <EmptyState icon={<LuActivity />} title="No monitors match these filters" onClear={clear} />
            ) : (
              <EmptyState
                icon={<LuActivity />}
                title={`No monitors in ${project?.name ?? "this project"} yet`}
                description="Add a URL and Uptrail checks it from three regions."
                action={<Button onClick={() => navigate(paths.monitorNew(orgSlug))}>New monitor</Button>}
              />
            )
          }
        />
      </SectionErrorBoundary>
      <BulkActionBar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />
    </div>
  );
}
