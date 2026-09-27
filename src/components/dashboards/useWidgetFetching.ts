import { useIsFetching } from "@tanstack/react-query";
import { useParams } from "react-router";
import { widgetDataKey } from "@/api/widgetData";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";

export function useWidgetFetching(widget: DashboardWidget, range: DashboardRange) {
  const { orgSlug = "" } = useParams();
  return useIsFetching({ queryKey: widgetDataKey(orgSlug, widget, range) }) > 0;
}
