import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import { widgetDataKey } from "@/api/widgetData";
import { liveLogConfigSchema, readConfig } from "@/lib/widgetConfig";
import { mockLiveLine } from "@/mocks/widgetData";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";
import type { LiveLogData } from "@/types/widgetData";

const STREAM_INTERVAL_MS = 2000;

export function useLiveLogStream(widget: DashboardWidget, range: DashboardRange, isEnabled: boolean) {
  const queryClient = useQueryClient();
  const { orgSlug = "" } = useParams();

  useEffect(() => {
    if (!isEnabled) return;
    const queryKey = widgetDataKey(orgSlug, widget, range);
    const config = readConfig(liveLogConfigSchema, widget);
    const timer = setInterval(() => {
      const line = mockLiveLine(config, Date.now());
      if (!line) return;
      queryClient.setQueryData<LiveLogData>(
        queryKey,
        (data) => data && { lines: [line, ...data.lines].slice(0, config.maxLines) },
      );
    }, STREAM_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [queryClient, orgSlug, widget, range, isEnabled]);
}
