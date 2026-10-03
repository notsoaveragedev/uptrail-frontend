import { LuScrollText } from "react-icons/lu";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "antd";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { logsQuery } from "@/api/logs";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { ActiveFilterChips } from "@/components/logs/ActiveFilterChips";
import { ExportControl } from "@/components/logs/ExportControl";
import { FacetSidebar } from "@/components/logs/FacetSidebar";
import { LogDetailsDrawer } from "@/components/logs/LogDetailsDrawer";
import { LogsGrid } from "@/components/logs/LogsGrid";
import { LogsGroupHeader } from "@/components/logs/LogsGroupHeader";
import { LogsHeader } from "@/components/logs/LogsHeader";
import { LogsStatusBar } from "@/components/logs/LogsStatusBar";
import { LogsToolbar } from "@/components/logs/LogsToolbar";
import { SavedViewsMenu } from "@/components/logs/SavedViewsMenu";
import { useLogsFilters } from "@/hooks/useLogsFilters";
import { useStoredState } from "@/hooks/useStoredState";
import { defaultLogColumnState } from "@/lib/logColumns";
import { buildLogItems } from "@/lib/logsQuery";
import type { LogsSortKey } from "@/types/logs";
import { EmptyState } from "@/components/ui/EmptyState";

export function LogsPage() {
  const { orgSlug = "" } = useParams();
  const queryClient = useQueryClient();
  const { filters, searchParams, setParam, setSort, clearFilters, activeFilterCount } = useLogsFilters();
  const [columnState, setColumnState] = useStoredState("uptrail:logs-columns", defaultLogColumnState);
  const [isSidebarOpen, setIsSidebarOpen] = useStoredState("uptrail:logs-sidebar", true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const query = useInfiniteQuery(logsQuery(orgSlug, filters));

  const pages = query.data?.pages;
  const summary = pages?.[0];
  const items = useMemo(
    () => buildLogItems(pages ?? [], filters, collapsedGroups, (group) => <LogsGroupHeader group={group} />),
    [pages, filters, collapsedGroups],
  );

  const rowKeys = items.flatMap((item) => (item.type === "row" ? [item.key] : []));
  const activeRowKey = searchParams.get("check");
  const activeIndex = activeRowKey ? rowKeys.indexOf(activeRowKey) : -1;
  const loaded = pages?.reduce((count, page) => count + page.items.length, 0) ?? 0;
  const visibleColumns = columnState.order.filter((key) => !columnState.hidden.includes(key));

  function toggleGroup(key: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function openRow(key: string | null) {
    setParam("check", key);
  }

  const emptyState = (
    <EmptyState
      icon={<LuScrollText />}
      title="No checks match these filters"
      onClear={activeFilterCount > 0 || filters.query ? clearFilters : undefined}
      action={
        activeFilterCount > 0 || filters.query ? undefined : (
          <Button onClick={() => setParam("range", "24h")}>Try the last 24 hours</Button>
        )
      }
    />
  );

  return (
    <>
      <title>Logs · Uptrail</title>
      <div className="flex h-[calc(100dvh-6.5rem)] min-h-[36rem] flex-col gap-4">
        <LogsHeader
          range={filters.range}
          total={summary?.total ?? null}
          failed={summary?.failed ?? 0}
          p95LatencyMs={summary?.p95LatencyMs ?? 0}
          onShowFailed={() => setParam("status", ["down"])}
          actions={
            <>
              <SavedViewsMenu columnState={columnState} onColumnStateChange={setColumnState} />
              <ExportControl filters={filters} total={summary?.total ?? 0} visibleColumns={visibleColumns} />
            </>
          }
        />

        <SectionErrorBoundary>
          <LogsToolbar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            columnState={columnState}
            onColumnStateChange={setColumnState}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["logs", orgSlug] })}
          />
        </SectionErrorBoundary>
        <ActiveFilterChips />

        <div className="flex min-h-0 flex-1 gap-4">
          {isSidebarOpen && (
            <SectionErrorBoundary>
              <FacetSidebar facets={summary?.facets} isStale={query.isPlaceholderData} />
            </SectionErrorBoundary>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <SectionErrorBoundary>
              <LogsGrid
                columnState={columnState}
                onColumnStateChange={setColumnState}
                items={items}
                rowCount={summary?.total ?? 0}
                sort={filters.sort}
                onSortChange={(sort) => setSort(sort.key as LogsSortKey, sort.isDescending)}
                hasMore={query.hasNextPage}
                isFetchingMore={query.isFetchingNextPage}
                onEndReached={() => query.fetchNextPage()}
                isLoading={query.isPending}
                activeRowKey={activeRowKey}
                onOpenRow={openRow}
                collapsedGroups={collapsedGroups}
                onToggleGroup={toggleGroup}
                emptyState={emptyState}
                footer={
                  <LogsStatusBar
                    loaded={loaded}
                    total={summary?.total ?? 0}
                    isFetching={query.isFetching}
                    hasMore={query.hasNextPage}
                  />
                }
              />
            </SectionErrorBoundary>
          </div>
        </div>
      </div>

      <LogDetailsDrawer
        resultId={activeRowKey}
        onClose={() => openRow(null)}
        onPrev={activeIndex > 0 ? () => openRow(rowKeys[activeIndex - 1]) : undefined}
        onNext={
          activeIndex >= 0 && activeIndex < rowKeys.length - 1 ? () => openRow(rowKeys[activeIndex + 1]) : undefined
        }
      />
    </>
  );
}
