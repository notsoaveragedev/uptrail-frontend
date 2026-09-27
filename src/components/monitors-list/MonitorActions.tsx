import { Button, Dropdown, Tooltip } from "antd";
import { LuCopy, LuEllipsis, LuExternalLink, LuPause, LuPencil, LuPlay, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { useMonitorChange } from "@/api/monitors";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import type { Monitor } from "@/types/monitor";

export function MonitorActions({ monitor }: { monitor: Monitor }) {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { orgSlug = "" } = useParams();
  const { change, snapshot, restore } = useMonitorChange(orgSlug);
  const isPaused = monitor.status === "paused";
  const ids = [monitor.id];

  function togglePause() {
    change({ action: isPaused ? "resume" : "pause", ids });
    toast.success(isPaused ? "Monitor resumed" : "Monitor paused", monitor.name, {
      label: "Undo",
      onClick: () => change({ action: isPaused ? "pause" : "resume", ids }),
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
    const previous = snapshot();
    change({ action: "delete", ids });
    toast.success("Monitor deleted", monitor.name, { label: "Undo", onClick: () => restore(previous) });
  }

  const items = [
    { key: "open", icon: <LuExternalLink />, label: "View details" },
    { key: "duplicate", icon: <LuCopy />, label: "Duplicate" },
    { type: "divider" as const },
    { key: "delete", icon: <LuTrash2 />, label: "Delete monitor", danger: true },
  ];

  function handleMenu(key: string) {
    if (key === "open") navigate(`/o/${orgSlug}/monitors/${monitor.id}`);
    if (key === "duplicate")
      toast.success("Monitor duplicated", `${monitor.name} (copy) is paused until you review it.`);
    if (key === "delete") remove();
  }

  return (
    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <Tooltip title="Check now">
        <Button
          size="small"
          aria-label={`Check ${monitor.name} now`}
          icon={<LuRefreshCw />}
          disabled={isPaused}
          onClick={() => toast.success("Check queued", `${monitor.name} will be checked from 3 regions.`)}
        />
      </Tooltip>
      <Tooltip title={isPaused ? "Resume" : "Pause"}>
        <Button
          size="small"
          aria-label={`${isPaused ? "Resume" : "Pause"} ${monitor.name}`}
          icon={isPaused ? <LuPlay /> : <LuPause />}
          onClick={togglePause}
        />
      </Tooltip>
      <Tooltip title="Edit">
        <Button
          size="small"
          aria-label={`Edit ${monitor.name}`}
          icon={<LuPencil />}
          onClick={() => navigate(`/o/${orgSlug}/monitors/${monitor.id}/edit`)}
        />
      </Tooltip>
      <Dropdown trigger={["click"]} menu={{ items, onClick: ({ key }) => handleMenu(key) }}>
        <Button size="small" aria-label={`More actions for ${monitor.name}`} icon={<LuEllipsis />} />
      </Dropdown>
    </div>
  );
}
