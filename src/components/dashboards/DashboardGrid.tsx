import { useState } from "react";
import { layoutFor } from "@/lib/dashboards";
import { rootFontSize } from "@/lib/dom";
import { breakpointForWidth, GRID_COLS, gridMetrics, gridPixelHeight, itemRect } from "@/lib/gridLayout";
import type { Dashboard, DashboardRange, DashboardWidget } from "@/types/dashboard";
import { GridCell } from "./GridCell";
import { useElementWidth } from "@/hooks/useElementWidth";
import { WidgetFrame } from "./WidgetFrame";
import { WidgetFullscreenModal } from "./WidgetFullscreenModal";
import { WidgetMenu } from "./WidgetMenu";

type DashboardGridProps = {
  dashboard: Dashboard;
  range: DashboardRange;
  onRefreshWidget?: (widget: DashboardWidget) => void;
  hasMenus?: boolean;
};

export function DashboardGrid({ dashboard, range, onRefreshWidget, hasMenus = true }: DashboardGridProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);
  const breakpoint = breakpointForWidth(width);
  const layout = layoutFor(dashboard, breakpoint);
  const metrics = gridMetrics(width, GRID_COLS[breakpoint], rootFontSize());
  const fullscreenWidget = dashboard.widgets.find((widget) => widget.id === fullscreenId) ?? null;

  return (
    <>
      <div ref={ref} className="relative w-full" style={{ height: gridPixelHeight(layout, metrics) }}>
        {width > 0 &&
          layout.map((item) => {
            const widget = dashboard.widgets.find((entry) => entry.id === item.i);
            if (!widget) return null;
            return (
              <GridCell key={item.i} rect={itemRect(item, metrics)}>
                <WidgetFrame
                  widget={widget}
                  range={range}
                  syncKey={dashboard.id}
                  className="border-line"
                  actions={
                    hasMenus && (
                      <WidgetMenu
                        widget={widget}
                        range={range}
                        onFullscreen={setFullscreenId}
                        onRefresh={(target) => onRefreshWidget?.(target)}
                      />
                    )
                  }
                />
              </GridCell>
            );
          })}
      </div>
      <WidgetFullscreenModal
        widget={fullscreenWidget}
        range={range}
        syncKey={dashboard.id}
        onClose={() => setFullscreenId(null)}
      />
    </>
  );
}
