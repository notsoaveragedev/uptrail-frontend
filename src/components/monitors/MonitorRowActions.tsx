import { Button, Dropdown, Tooltip } from "antd";
import {
  LuCopy,
  LuEllipsis,
  LuExternalLink,
  LuPause,
  LuPencil,
  LuPlay,
  LuRefreshCw,
  LuScrollText,
  LuTrash2,
} from "react-icons/lu";
import { useMonitorActions } from "@/hooks/useMonitorActions";
import type { Monitor } from "@/types/monitor";

export function MonitorRowActions({ monitor }: { monitor: Monitor }) {
  const actions = useMonitorActions(monitor);
  const pauseLabel = actions.isPaused ? "Resume" : "Pause";

  const items = [
    { key: "open", icon: <LuExternalLink />, label: "View details", onClick: actions.open },
    { key: "logs", icon: <LuScrollText />, label: "View logs", onClick: actions.viewLogs },
    { key: "duplicate", icon: <LuCopy />, label: "Duplicate", onClick: actions.duplicate },
    { type: "divider" as const },
    { key: "delete", icon: <LuTrash2 />, label: "Delete monitor", danger: true, onClick: actions.remove },
  ];

  return (
    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <Tooltip title="Check now">
        <Button
          size="small"
          aria-label={`Check ${monitor.name} now`}
          icon={<LuRefreshCw />}
          disabled={actions.isPaused}
          onClick={actions.checkNow}
        />
      </Tooltip>
      <Tooltip title={pauseLabel}>
        <Button
          size="small"
          aria-label={`${pauseLabel} ${monitor.name}`}
          icon={actions.isPaused ? <LuPlay /> : <LuPause />}
          onClick={actions.togglePause}
        />
      </Tooltip>
      <Tooltip title="Edit">
        <Button size="small" aria-label={`Edit ${monitor.name}`} icon={<LuPencil />} onClick={actions.edit} />
      </Tooltip>
      <Dropdown trigger={["click"]} menu={{ items }}>
        <Button size="small" aria-label={`More actions for ${monitor.name}`} icon={<LuEllipsis />} />
      </Dropdown>
    </div>
  );
}
