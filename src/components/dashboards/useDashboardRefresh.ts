import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import { monitorsKey } from "@/api/monitors";
import { widgetDataKey, widgetDataRootKey } from "@/api/widgetData";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";

export function useDashboardRefresh() {
  const queryClient = useQueryClient();
  const { orgSlug = "" } = useParams();
  const [refreshedAt, setRefreshedAt] = useState(Date.now);

  function refreshAll() {
    setRefreshedAt(Date.now());
    void queryClient.invalidateQueries({ queryKey: widgetDataRootKey(orgSlug) });
    void queryClient.invalidateQueries({ queryKey: monitorsKey(orgSlug) });
  }

  function refreshWidget(widget: DashboardWidget, range: DashboardRange) {
    void queryClient.invalidateQueries({ queryKey: widgetDataKey(orgSlug, widget, range) });
  }

  return { refreshedAt, refreshAll, refreshWidget };
}
