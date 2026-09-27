import { Button, Dropdown, Segmented, Tooltip } from "antd";
import { LuChevronDown, LuLink, LuPencil, LuRefreshCw, LuTv } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { StatusDot } from "@/components/ui/StatusDot";
import { useCopy } from "@/hooks/useCopy";
import { DASHBOARD_RANGES, REFRESH_OPTIONS, type RefreshValue } from "@/lib/dashboards";
import { paths } from "@/lib/paths";
import type { DashboardRange } from "@/types/dashboard";

type ViewControlsProps = {
  dashboardId: string;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  refresh: RefreshValue;
  onRefreshChange: (refresh: RefreshValue) => void;
  onRefreshNow: () => void;
  onEdit: () => void;
};

const REFRESH_NOW_KEY = "now";

export function ViewControls({
  dashboardId,
  range,
  onRangeChange,
  refresh,
  onRefreshChange,
  onRefreshNow,
  onEdit,
}: ViewControlsProps) {
  const navigate = useNavigate();
  const copy = useCopy();
  const { orgSlug = "" } = useParams();
  const isLive = refresh !== "off";

  const refreshItems = [
    { key: REFRESH_NOW_KEY, icon: <LuRefreshCw />, label: "Refresh now" },
    { type: "divider" as const },
    {
      type: "group" as const,
      label: "Auto-refresh",
      children: REFRESH_OPTIONS.map(({ value, label }) => ({ key: value, label })),
    },
  ];

  function handleRefreshMenu(key: string) {
    if (key === REFRESH_NOW_KEY) onRefreshNow();
    else onRefreshChange(key as RefreshValue);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        aria-label="Time range"
        value={range}
        onChange={onRangeChange}
        options={DASHBOARD_RANGES}
        className="font-mono"
      />
      <Dropdown
        trigger={["click"]}
        menu={{
          items: refreshItems,
          selectable: true,
          selectedKeys: [refresh],
          onClick: ({ key }) => handleRefreshMenu(key),
        }}
      >
        <Button aria-label={`Auto-refresh ${isLive ? `every ${refresh}` : "off"}`} className={isLive ? "text-up" : ""}>
          {isLive ? <StatusDot fill="bg-up" className="animate-pulse" /> : <LuRefreshCw aria-hidden />}
          <span className="font-mono text-xs">{isLive ? refresh : "Off"}</span>
          <LuChevronDown aria-hidden className="size-3 text-subtle" />
        </Button>
      </Dropdown>
      <Tooltip title="TV mode">
        <Button
          aria-label="Open TV mode"
          icon={<LuTv />}
          onClick={() => navigate(paths.dashboardTv(orgSlug, dashboardId))}
        />
      </Tooltip>
      <Button
        icon={<LuLink />}
        onClick={() => copy(window.location.href, "Link copied", "It opens this dashboard with the same range.")}
      >
        Share
      </Button>
      <Button type="primary" icon={<LuPencil />} onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}
