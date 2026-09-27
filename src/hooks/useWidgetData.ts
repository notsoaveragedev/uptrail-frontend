import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { widgetDataQuery } from "@/api/widgetData";
import type { DashboardRange, DashboardWidget, WidgetType } from "@/types/dashboard";

export function useWidgetData<Type extends WidgetType>(widget: DashboardWidget, range: DashboardRange) {
  const { orgSlug = "" } = useParams();
  return useQuery(widgetDataQuery<Type>(orgSlug, widget, range));
}
