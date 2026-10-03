import { useQuery } from "@tanstack/react-query";
import { Button, Segmented } from "antd";
import { lazy, Suspense, useState } from "react";
import { LuCalendar, LuList, LuPlus, LuWrench } from "react-icons/lu";
import { useParams } from "react-router";
import { maintenanceQuery } from "@/api/maintenance";
import { monitorsQuery } from "@/api/monitors";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { ActiveMaintenanceBanner } from "@/components/maintenance/ActiveMaintenanceBanner";
import type { MaintenanceDraft } from "@/components/maintenance/MaintenanceDrawer";
import { MaintenanceTable } from "@/components/maintenance/MaintenanceTable";
import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { Can } from "@/components/rbac/Can";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListTabs } from "@/components/ui/ListTabs";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { useMaintenanceFilters } from "@/hooks/useMaintenanceFilters";
import { useNow } from "@/hooks/useNow";
import { DAY_MS } from "@/lib/dates";
import { formatElapsed } from "@/lib/format";
import { importWithReload } from "@/lib/lazyPage";
import { countBy } from "@/lib/list";
import { defaultStart, filterMaintenance, maintenancePhase, MAINTENANCE_TABS, nextStart } from "@/lib/maintenance";
import type { MaintenancePhase, MaintenanceWindow } from "@/types/maintenance";
import type { Monitor } from "@/types/monitor";
import { useProjectOptions } from "@/hooks/useProject";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";

const MaintenanceDrawer = lazy(() =>
  importWithReload(() => import("@/components/maintenance/MaintenanceDrawer")).then((module) => ({
    default: module.MaintenanceDrawer,
  })),
);

const MaintenanceCalendar = lazy(() =>
  importWithReload(() => import("@/components/maintenance/MaintenanceCalendar")).then((module) => ({
    default: module.MaintenanceCalendar,
  })),
);

const TAB_LABELS: Record<MaintenancePhase, string> = { upcoming: "Upcoming", active: "In progress", past: "Past" };

export function MaintenancePage() {
  const { orgSlug = "" } = useParams();
  const { data: windows } = useQuery(maintenanceQuery(orgSlug));
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const [draft, setDraft] = useState<MaintenanceDraft | null>(null);
  const [hasOpenedDrawer, setHasOpenedDrawer] = useState(false);

  function openDrawer(next: MaintenanceDraft) {
    setHasOpenedDrawer(true);
    setDraft(next);
  }

  const openCreate = (startsAt = defaultStart()) => openDrawer({ entry: null, startsAt });

  return (
    <>
      <title>Maintenance · Uptrail</title>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Maintenance"
          meta={windows && <MaintenanceSummary windows={windows} />}
          actions={
            <Can permission="monitor:update">
              <Button type="primary" icon={<LuPlus />} onClick={() => openCreate()}>
                Schedule maintenance
              </Button>
            </Can>
          }
        />
        {windows ? (
          <MaintenanceView
            windows={windows}
            monitors={monitors}
            onEdit={(entry) => openDrawer({ entry })}
            onDuplicate={(entry) => openDrawer({ entry: null, copyOf: entry, startsAt: defaultStart() })}
            onCreate={openCreate}
          />
        ) : (
          <TableSkeleton columns={["flex-1", "w-20", "w-36", "w-12", "w-24", "w-32"]} />
        )}
      </div>
      <Suspense fallback={null}>
        {hasOpenedDrawer && <MaintenanceDrawer draft={draft} onClose={() => setDraft(null)} />}
      </Suspense>
    </>
  );
}

function MaintenanceSummary({ windows }: { windows: MaintenanceWindow[] }) {
  const now = useNow(60_000);
  const active = windows.filter((entry) => maintenancePhase(entry, now) === "active");
  const upcoming = windows
    .filter((entry) => maintenancePhase(entry, now) === "upcoming")
    .sort((a, b) => nextStart(a, now) - nextStart(b, now));
  const soon = upcoming.filter((entry) => nextStart(entry, now) - now < 30 * DAY_MS);

  return (
    <MetaList>
      <span>
        <span className={`font-mono ${active.length ? "text-maintenance" : "text-ink"}`}>{active.length}</span> in
        progress
      </span>
      <span>
        <span className="font-mono text-ink">{soon.length}</span> in the next 30 days
      </span>
      {upcoming[0] && (
        <span>
          next: <span className="text-ink">{upcoming[0].title}</span> in{" "}
          <span className="font-mono">{formatElapsed(nextStart(upcoming[0], now) - now)}</span>
        </span>
      )}
    </MetaList>
  );
}

type MaintenanceViewProps = {
  windows: MaintenanceWindow[];
  monitors: Monitor[];
  onEdit: (entry: MaintenanceWindow) => void;
  onDuplicate: (entry: MaintenanceWindow) => void;
  onCreate: (startsAt?: number) => void;
};

function MaintenanceView({ windows, monitors, onEdit, onDuplicate, onCreate }: MaintenanceViewProps) {
  const projectOptions = useProjectOptions();
  const now = useNow(30_000);
  const { filters, hasFilters, setParam, setTab, setView, clear } = useMaintenanceFilters();
  const active = windows.filter((entry) => maintenancePhase(entry, now) === "active");
  const visible = filterMaintenance(windows, filters, filters.tab, now);
  const tabCounts = countBy(windows, (entry) => maintenancePhase(entry, now));
  const projectCounts = countBy(windows, (entry) => entry.project);
  const isCalendar = filters.view === "calendar";

  return (
    <div className="flex flex-col gap-3">
      {active.map((entry) => (
        <ActiveMaintenanceBanner key={entry.id} entry={entry} now={now} />
      ))}
      <div className="flex flex-wrap items-center gap-2">
        {!isCalendar && (
          <>
            <ListTabs
              label="Maintenance status"
              value={filters.tab}
              onChange={setTab}
              tabs={MAINTENANCE_TABS.map((tab) => ({ value: tab, label: TAB_LABELS[tab], count: tabCounts[tab] ?? 0 }))}
            />
            <ToolbarDivider />
          </>
        )}
        <FacetFilter
          label="Project"
          selected={filters.projects}
          onChange={(values) => setParam("project", values)}
          options={projectOptions.map((project) => ({ ...project, count: projectCounts[project.value] }))}
        />
        <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
        <div className="ml-auto flex items-center gap-2">
          <Segmented
            aria-label="View"
            value={filters.view}
            onChange={setView}
            options={[
              { value: "list", icon: <LuList />, title: "List" },
              { value: "calendar", icon: <LuCalendar />, title: "Calendar" },
            ]}
          />
          <ToolbarSearch
            label="Search maintenance"
            placeholder="Search by title"
            value={filters.query}
            onChange={(value) => setParam("q", value)}
            className=""
          />
        </div>
      </div>
      <SectionErrorBoundary>
        {isCalendar ? (
          <Suspense fallback={<SkeletonBlock className="h-160 border border-line" />}>
            <MaintenanceCalendar
              windows={filterMaintenance(windows, filters, null, now)}
              onOpen={onEdit}
              onCreate={(day) => onCreate(defaultStart(day))}
            />
          </Suspense>
        ) : (
          <MaintenanceTable
            windows={visible}
            monitors={monitors}
            now={now}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            emptyText={
              hasFilters ? (
                <EmptyState icon={<LuWrench />} title="No windows match these filters" onClear={clear} />
              ) : (
                <EmptyState
                  icon={<LuWrench />}
                  title={
                    filters.tab === "past" ? "No past maintenance" : `Nothing ${TAB_LABELS[filters.tab].toLowerCase()}`
                  }
                  description={`Alerts fire normally for all ${monitors.length} monitors.`}
                  action={filters.tab !== "past" && <Button onClick={() => onCreate()}>Schedule maintenance</Button>}
                />
              )
            }
          />
        )}
      </SectionErrorBoundary>
    </div>
  );
}
