import { Button, Dropdown } from "antd";
import { LuCopy, LuEllipsis, LuPause, LuPencil, LuPlay, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import { useMonitorActions } from "@/hooks/useMonitorActions";
import type { Monitor } from "@/types/monitor";

export function MonitorHeaderActions({ monitor }: { monitor: Monitor }) {
  const actions = useMonitorActions(monitor, { leaveOnDelete: true });

  const items = [
    { key: "duplicate", icon: <LuCopy />, label: "Duplicate", onClick: actions.duplicate },
    { type: "divider" as const },
    { key: "delete", icon: <LuTrash2 />, label: "Delete monitor", danger: true, onClick: actions.remove },
  ];

  return (
    <div className="flex items-center gap-2">
      <Button icon={<LuRefreshCw />} onClick={actions.checkNow} disabled={actions.isPaused}>
        Check now
      </Button>
      <Button icon={actions.isPaused ? <LuPlay /> : <LuPause />} onClick={actions.togglePause}>
        {actions.isPaused ? "Resume" : "Pause"}
      </Button>
      <Button icon={<LuPencil />} onClick={actions.edit}>
        Edit
      </Button>
      <Dropdown trigger={["click"]} placement="bottomRight" menu={{ items }}>
        <Button aria-label={`More actions for ${monitor.name}`} icon={<LuEllipsis />} />
      </Dropdown>
    </div>
  );
}
