import { Button, Dropdown, Tooltip } from "antd";
import { LuCopy, LuEllipsis, LuPause, LuPencil, LuPlay, LuRefreshCw, LuScrollText, LuTrash2 } from "react-icons/lu";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import type { Monitor } from "@/types/overview";

export function MonitorRowActions({ monitor }: { monitor: Monitor }) {
  const toast = useToast();
  const confirm = useConfirm();
  const isPaused = monitor.status === "paused";

  function checkNow() {
    toast.success("Check queued", `${monitor.name} will be checked from 3 regions.`);
  }

  function togglePause() {
    toast.success(isPaused ? "Monitor resumed" : "Monitor paused", monitor.name, {
      label: "Undo",
      onClick: () => toast.info(isPaused ? "Monitor paused again" : "Monitor resumed", monitor.name),
    });
  }

  async function remove() {
    const isConfirmed = await confirm({
      title: `Delete ${monitor.name}?`,
      description: "Its check history, alert rules and status page component will be removed.",
      confirmLabel: "Delete monitor",
      isDanger: true,
    });
    if (!isConfirmed) return;
    toast.success("Monitor deleted", monitor.name, {
      label: "Undo",
      onClick: () => toast.info("Monitor restored", monitor.name),
    });
  }

  const items = [
    { key: "edit", icon: <LuPencil />, label: "Edit monitor" },
    { key: "logs", icon: <LuScrollText />, label: "View logs" },
    { key: "duplicate", icon: <LuCopy />, label: "Duplicate" },
    { type: "divider" as const },
    { key: "delete", icon: <LuTrash2 />, label: "Delete monitor", danger: true },
  ];

  return (
    <div className="flex items-center gap-1">
      <Tooltip title="Check now">
        <Button size="small" aria-label="Check now" icon={<LuRefreshCw />} onClick={checkNow} disabled={isPaused} />
      </Tooltip>
      <Tooltip title={isPaused ? "Resume" : "Pause"}>
        <Button
          size="small"
          aria-label={isPaused ? "Resume" : "Pause"}
          icon={isPaused ? <LuPlay /> : <LuPause />}
          onClick={togglePause}
        />
      </Tooltip>
      <Dropdown trigger={["click"]} menu={{ items, onClick: ({ key }) => key === "delete" && remove() }}>
        <Button size="small" aria-label={`More actions for ${monitor.name}`} icon={<LuEllipsis />} />
      </Dropdown>
    </div>
  );
}
