import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { widgetRange } from "@/lib/widgetConfig";
import { buildWidgetData } from "@/mocks/widgetData";
import { hashString } from "@/mocks/random";
import type { DashboardRange, DashboardWidget, WidgetType } from "@/types/dashboard";
import type { WidgetDataMap } from "@/types/widgetData";

export function widgetDataRootKey(orgSlug: string) {
  return ["widget-data", orgSlug] as const;
}

export function widgetDataKey(orgSlug: string, widget: DashboardWidget, range: DashboardRange) {
  return [...widgetDataRootKey(orgSlug), widget.type, widget.config, widgetRange(widget, range)] as const;
}

export async function fetchWidgetData<Type extends WidgetType>(widget: DashboardWidget, range: DashboardRange) {
  await fakeRequest(280 + (hashString(widget.id) % 420));
  return buildWidgetData(widget, range) as WidgetDataMap[Type];
}

export function widgetDataQuery<Type extends WidgetType>(
  orgSlug: string,
  widget: DashboardWidget,
  range: DashboardRange,
) {
  return queryOptions({
    queryKey: widgetDataKey(orgSlug, widget, range),
    queryFn: () => fetchWidgetData<Type>(widget, range),
    placeholderData: keepPreviousData,
    throwOnError: false,
  });
}
