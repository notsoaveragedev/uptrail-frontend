import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { LuTimer, LuWrench } from "react-icons/lu";
import { useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { monitorsQuery } from "@/api/monitors";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { IncidentBulkBar } from "@/components/incidents/IncidentBulkBar";
import { IncidentMetricCard } from "@/components/incidents/IncidentMetricCard";
import { IncidentsEmptyState } from "@/components/incidents/IncidentsEmptyState";
import { IncidentsHeader } from "@/components/incidents/IncidentsHeader";
import { IncidentsSkeleton } from "@/components/incidents/IncidentsSkeleton";
import { IncidentsTable } from "@/components/incidents/IncidentsTable";
import { IncidentsToolbar } from "@/components/incidents/IncidentsToolbar";
import { useIncidentFilters } from "@/hooks/useIncidentFilters";
import { useLazyDisclosure } from "@/hooks/useLazyDisclosure";
import { useNow } from "@/hooks/useNow";
import {
  daysSinceLastIncident,
  filterIncidents,
  incidentTabCounts,
  incidentMetrics,
  isIncidentOpen,
} from "@/lib/incidents";
import { lazyComponent } from "@/lib/lazyPage";
import { currentUser } from "@/mocks/workspace";
import type { Incident } from "@/types/incident";

const DeclareIncidentModal = lazyComponent(
  () => import("@/components/incidents/DeclareIncidentModal"),
  "DeclareIncidentModal",
);

export function IncidentsPage() {
  const { orgSlug = "" } = useParams();
  const { data: incidents } = useQuery(incidentsQuery(orgSlug));
  const declare = useLazyDisclosure();

  return (
    <>
      <title>Incidents · Uptrail</title>
      {incidents ? <IncidentsView incidents={incidents} onDeclare={declare.open} /> : <IncidentsSkeleton />}
      <Suspense fallback={null}>
        {declare.hasOpened && <DeclareIncidentModal open={declare.isOpen} onClose={declare.close} />}
      </Suspense>
    </>
  );
}

function IncidentsView({ incidents, onDeclare }: { incidents: Incident[]; onDeclare: () => void }) {
  const { orgSlug = "" } = useParams();
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { tab, filters, hasFilters, clear } = useIncidentFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const now = useNow(60_000);

  const metrics = incidentMetrics(incidents, 30, now);
  const visible = filterIncidents(incidents, tab, filters, currentUser.name);
  const selected = visible.filter((incident) => selectedIds.includes(incident.id));
  const tabCounts = incidentTabCounts(incidents, filters, currentUser.name);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <IncidentsHeader
        incidents={incidents}
        mttaMs={metrics.current.mttaMs}
        mttrMs={metrics.current.mttrMs}
        onDeclare={onDeclare}
      />

      <SectionErrorBoundary>
        <div className="grid gap-4 md:grid-cols-2">
          <IncidentMetricCard
            icon={LuTimer}
            label="MTTA · 30d"
            description="time to acknowledge"
            currentMs={metrics.current.mttaMs}
            previousMs={metrics.previous.mttaMs}
            daily={metrics.daily.map((day) => ({ date: day.date, valueMs: day.count ? day.mttaMs : null }))}
          />
          <IncidentMetricCard
            icon={LuWrench}
            label="MTTR · 30d"
            description="time to resolve"
            currentMs={metrics.current.mttrMs}
            previousMs={metrics.previous.mttrMs}
            daily={metrics.daily.map((day) => ({ date: day.date, valueMs: day.count ? day.mttrMs : null }))}
          />
        </div>
      </SectionErrorBoundary>

      <div className="flex flex-col gap-3">
        <IncidentsToolbar incidents={incidents} tabCounts={tabCounts} />
        <SectionErrorBoundary>
          <IncidentsTable
            incidents={visible}
            monitors={monitors}
            selectedIds={selected.map((incident) => incident.id)}
            onSelect={setSelectedIds}
            emptyText={
              <div className="py-10">
                <IncidentsEmptyState
                  hasFilters={hasFilters}
                  isOpenTab={tab === "open"}
                  quietDays={daysSinceLastIncident(
                    incidents.filter((incident) => !isIncidentOpen(incident)),
                    now,
                  )}
                  onClear={clear}
                />
              </div>
            }
          />
        </SectionErrorBoundary>
      </div>

      <IncidentBulkBar selected={selected} onClear={() => setSelectedIds([])} />
    </div>
  );
}
