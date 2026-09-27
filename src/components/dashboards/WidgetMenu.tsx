import { Button, Dropdown } from "antd";
import { LuDownload, LuEllipsis, LuMaximize2, LuRefreshCw } from "react-icons/lu";
import { useToast } from "@/hooks/useToast";
import { widgetCsvFileName } from "@/lib/dashboards";
import { downloadBlob } from "@/lib/download";
import { widgetRange, WIDGETS } from "@/lib/widgets";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";

type WidgetMenuProps = {
  widget: DashboardWidget;
  range: DashboardRange;
  onFullscreen: (widgetId: string) => void;
  onRefresh: (widget: DashboardWidget) => void;
};

export function WidgetMenu({ widget, range, onFullscreen, onRefresh }: WidgetMenuProps) {
  const toast = useToast();

  async function exportCsv() {
    try {
      const csv = await WIDGETS[widget.type].exportCsv(widget, widgetRange(widget, range));
      downloadBlob(new Blob([csv], { type: "text/csv" }), widgetCsvFileName(widget));
      toast.success("Export ready", `${widget.title} was saved as CSV.`);
    } catch {
      toast.error("Couldn't export this widget", "Try again in a moment.");
    }
  }

  const items = [
    { key: "fullscreen", icon: <LuMaximize2 />, label: "Full screen", onClick: () => onFullscreen(widget.id) },
    { key: "csv", icon: <LuDownload />, label: "Export CSV", onClick: () => void exportCsv() },
    { key: "refresh", icon: <LuRefreshCw />, label: "Refresh", onClick: () => onRefresh(widget) },
  ];

  return (
    <Dropdown trigger={["click"]} menu={{ items }} placement="bottomRight">
      <Button
        size="small"
        type="text"
        aria-label={`Actions for ${widget.title}`}
        icon={<LuEllipsis />}
        className="opacity-0 transition-opacity group-focus-within/widget:opacity-100 group-hover/widget:opacity-100 aria-expanded:opacity-100"
      />
    </Dropdown>
  );
}
