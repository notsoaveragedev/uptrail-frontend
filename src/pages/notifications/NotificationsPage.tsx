import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useState } from "react";
import { LuBellOff, LuCheckCheck, LuMail, LuMailOpen } from "react-icons/lu";
import { useParams } from "react-router";
import { notificationsQuery } from "@/api/notifications";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { NotificationIcon } from "@/components/notifications/NotificationIcon";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { Card } from "@/components/ui/Card";
import { DayHeader } from "@/components/ui/DayHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListTabs } from "@/components/ui/ListTabs";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useNow } from "@/hooks/useNow";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { DAY_MS, groupByDay } from "@/lib/dates";
import { countBy } from "@/lib/list";
import {
  filterNotifications,
  NOTIFICATION_FILTER_KEYS,
  NOTIFICATION_META,
  NOTIFICATION_TYPES,
  readNotificationFilters,
} from "@/lib/notifications";
import type { AppNotification } from "@/types/workspace";
import { useProjectOptions } from "@/hooks/useProject";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";

export function NotificationsPage() {
  const { orgSlug = "" } = useParams();
  const { data: notifications } = useQuery(notificationsQuery(orgSlug));

  return (
    <>
      <title>Notifications · Uptrail</title>
      {notifications ? (
        <NotificationsView notifications={notifications} />
      ) : (
        <div aria-busy className="flex flex-col gap-5">
          <SkeletonBlock isInset className="h-7 w-48" />
          <SkeletonBlock isInset className="h-8 w-96" />
          <SkeletonBlock className="h-120 border border-line" />
        </div>
      )}
    </>
  );
}

function NotificationsView({ notifications }: { notifications: AppNotification[] }) {
  const projectOptions = useProjectOptions();
  const now = useNow(60_000);
  const { setRead, markAllRead, open } = useNotificationActions();
  const { filters, hasFilters, setParam, clear } = useFilterParams(NOTIFICATION_FILTER_KEYS, readNotificationFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visible = filterNotifications(notifications, filters);
  const unread = notifications.filter((item) => item.isUnread);
  const thisWeek = notifications.filter((item) => now - item.at < 7 * DAY_MS).length;
  const typeCounts = countBy(notifications, (item) => item.type);
  const projectCounts = countBy(notifications, (item) => item.project ?? []);
  const selected = visible.filter((item) => selectedIds.includes(item.id));

  function toggleSelected(id: string, isSelected: boolean) {
    setSelectedIds((ids) => (isSelected ? [...ids, id] : ids.filter((item) => item !== id)));
  }

  return (
    <div className="flex flex-col gap-5 pb-20">
      <PageHeader
        title="Notifications"
        meta={
          <MetaList>
            <span>
              <span className="font-mono text-ink">{unread.length}</span> unread
            </span>
            <span>
              <span className="font-mono text-ink">{thisWeek}</span> this week
            </span>
          </MetaList>
        }
        actions={
          <Button icon={<LuCheckCheck />} disabled={unread.length === 0} onClick={() => markAllRead(unread)}>
            Mark all read
          </Button>
        }
      />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ListTabs
            label="Show"
            value={filters.isUnreadOnly ? "unread" : "all"}
            onChange={(value) => setParam("unread", value === "unread" ? "1" : null)}
            tabs={[
              { value: "all", label: "All", count: notifications.length },
              { value: "unread", label: "Unread", count: unread.length },
            ]}
          />
          <ToolbarDivider />
          <FacetFilter
            label="Type"
            selected={filters.types}
            onChange={(values) => setParam("type", values)}
            options={NOTIFICATION_TYPES.map((type) => ({
              value: type,
              label: (
                <span className="flex items-center gap-2">
                  <NotificationIcon type={type} />
                  {NOTIFICATION_META[type].label}
                </span>
              ),
              searchText: NOTIFICATION_META[type].label,
              count: typeCounts[type],
            }))}
          />
          <FacetFilter
            label="Project"
            selected={filters.projects}
            onChange={(values) => setParam("project", values)}
            options={projectOptions.map((project) => ({ ...project, count: projectCounts[project.value] }))}
          />
          <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
          <ToolbarSearch
            label="Search notifications"
            placeholder="Search notifications"
            value={filters.query}
            onChange={(value) => setParam("q", value)}
          />
        </div>
        <SectionErrorBoundary>
          <Card className="overflow-hidden">
            {visible.length === 0 ? (
              filters.isUnreadOnly && !filters.types.length && !filters.projects.length && !filters.query ? (
                <EmptyState
                  icon={<LuCheckCheck />}
                  title="You're all caught up"
                  description="New alerts and incident updates show up here."
                />
              ) : (
                <EmptyState icon={<LuBellOff />} title="No notifications match these filters" onClear={clear} />
              )
            ) : (
              groupByDay(visible, (item) => item.at, now).map((day) => (
                <section key={day.key} aria-label={day.label} className="border-b border-line last:border-b-0">
                  <DayHeader label={day.label} count={day.items.length} />
                  <ul>
                    {day.items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.includes(item.id)}
                        isSelecting={selected.length > 0}
                        onSelect={(isSelected) => toggleSelected(item.id, isSelected)}
                        onOpen={() => open(item)}
                        onToggleRead={() => setRead([item], !item.isUnread)}
                      />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </Card>
        </SectionErrorBoundary>
      </div>
      <SelectionBar count={selected.length} onClear={() => setSelectedIds([])}>
        <Button
          type="text"
          icon={<LuMailOpen />}
          onClick={() => {
            setRead(selected, false);
            setSelectedIds([]);
          }}
        >
          Mark read
        </Button>
        <ToolbarDivider />
        <Button
          type="text"
          icon={<LuMail />}
          onClick={() => {
            setRead(selected, true);
            setSelectedIds([]);
          }}
        >
          Mark unread
        </Button>
      </SelectionBar>
    </div>
  );
}
