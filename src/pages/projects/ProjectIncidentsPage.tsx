import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LuSiren } from "react-icons/lu";
import { useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { monitorsQuery } from "@/api/monitors";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { IncidentBulkBar } from "@/components/incidents/IncidentBulkBar";
import { IncidentsTable } from "@/components/incidents/IncidentsTable";
import { IncidentsToolbar } from "@/components/incidents/IncidentsToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useIncidentFilters } from "@/hooks/useIncidentFilters";
import { filterIncidents, incidentTabCounts } from "@/lib/incidents";
import { currentUser } from "@/mocks/workspace";

export function ProjectIncidentsPage() {
  const { orgSlug = "", projectSlug = "" } = useParams();
  const { data: incidents = [] } = useQuery(incidentsQuery(orgSlug));
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { tab, filters, hasFilters, clear } = useIncidentFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const scoped = incidents.filter((incident) => incident.project === projectSlug);
  const visible = filterIncidents(scoped, tab, filters, currentUser.name);
  const selected = visible.filter((incident) => selectedIds.includes(incident.id));

  return (
    <div className="flex flex-col gap-3 pb-24">
      <IncidentsToolbar incidents={scoped} tabCounts={incidentTabCounts(scoped, filters, currentUser.name)} />
      <SectionErrorBoundary>
        <IncidentsTable
          incidents={visible}
          monitors={monitors}
          selectedIds={selected.map((incident) => incident.id)}
          onSelect={setSelectedIds}
          emptyText={
            <EmptyState
              icon={<LuSiren />}
              title={hasFilters ? "No incidents match these filters" : `No ${tab} incidents in this project`}
              onClear={hasFilters ? clear : undefined}
            />
          }
        />
      </SectionErrorBoundary>
      <IncidentBulkBar selected={selected} onClear={() => setSelectedIds([])} />
    </div>
  );
}
