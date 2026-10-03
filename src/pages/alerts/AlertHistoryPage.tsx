import { LuBellOff } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { useParams } from "react-router";
import { alertChannelsQuery, alertEventsQuery, alertRulesQuery } from "@/api/alerts";
import { monitorsQuery } from "@/api/monitors";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { HistoryBulkBar } from "@/components/alerts/HistoryBulkBar";
import { HistoryTable } from "@/components/alerts/HistoryTable";
import { HistoryToolbar } from "@/components/alerts/HistoryToolbar";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { useAlertHistoryFilters } from "@/hooks/useAlertHistoryFilters";
import { useNow } from "@/hooks/useNow";
import { filterEvents, HISTORY_RANGE_TEXT } from "@/lib/alertLists";
import { importWithReload } from "@/lib/lazyPage";
import { EmptyState } from "@/components/ui/EmptyState";

const AlertEventDrawer = lazy(() =>
  importWithReload(() => import("@/components/alerts/AlertEventDrawer")).then((module) => ({
    default: module.AlertEventDrawer,
  })),
);

const SKELETON_COLUMNS = ["w-4", "w-24", "flex-1", "w-28", "w-20", "w-16", "w-20", "w-14"];

type DrawerState = { eventId: string; isOpen: boolean };

export function AlertHistoryPage() {
  const { orgSlug = "" } = useParams();
  const now = useNow(60_000);
  const { data: events = [], isPending } = useQuery(alertEventsQuery(orgSlug));
  const { data: rules = [] } = useQuery(alertRulesQuery(orgSlug));
  const { data: channels = [] } = useQuery(alertChannelsQuery(orgSlug));
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { filters, hasFilters, clear } = useAlertHistoryFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<DrawerState | null>(null);

  const visible = filterEvents(events, filters, now);
  const liveSelection = selectedIds.filter((id) =>
    visible.some((event) => event.id === id && event.acknowledgedBy === null),
  );
  const openEvent = events.find((event) => event.id === drawer?.eventId);

  const emptyState = hasFilters ? (
    <EmptyState icon={<LuBellOff />} title="No alerts match these filters" onClear={clear} />
  ) : (
    <EmptyState icon={<LuBellOff />} title={`All clear · nothing fired in ${HISTORY_RANGE_TEXT[filters.range]}`} />
  );

  return (
    <>
      <title>Alert history · Uptrail</title>
      <div className="flex flex-col gap-4 pt-4 pb-24">
        <HistoryToolbar rules={rules} />
        <SectionErrorBoundary>
          {isPending ? (
            <TableSkeleton columns={SKELETON_COLUMNS} rows={8} />
          ) : (
            <HistoryTable
              key={`${filters.ruleId}-${filters.status}-${filters.range}`}
              events={visible}
              rules={rules}
              channels={channels}
              monitors={monitors}
              selectedIds={liveSelection}
              onSelect={setSelectedIds}
              onOpen={(eventId) => setDrawer({ eventId, isOpen: true })}
              emptyText={<div className="py-10">{emptyState}</div>}
            />
          )}
        </SectionErrorBoundary>
      </div>
      <HistoryBulkBar selectedIds={liveSelection} onClear={() => setSelectedIds([])} />
      <Suspense fallback={null}>
        {drawer && (
          <AlertEventDrawer
            open={drawer.isOpen}
            event={openEvent}
            rule={rules.find((rule) => rule.id === openEvent?.ruleId)}
            monitor={monitors.find((monitor) => monitor.id === openEvent?.monitorId)}
            channels={channels}
            onClose={() => setDrawer({ ...drawer, isOpen: false })}
          />
        )}
      </Suspense>
    </>
  );
}
