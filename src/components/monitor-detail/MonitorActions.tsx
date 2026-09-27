import { Button, Dropdown } from "antd";
import { LuCopy, LuEllipsis, LuPause, LuPencil, LuPlay, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { useMonitorChange } from "@/api/monitors";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import type { Monitor } from "@/types/monitor";

export function MonitorActions({ monitor }: { monitor: Monitor }) {
  const { orgSlug = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { change, snapshot, restore } = useMonitorChange(orgSlug);
  const isPaused = monitor.status === "paused";
  const ids = [monitor.id];

  function checkNow() {
    toast.success("Check queued", `${monitor.name} will be checked from ${monitor.regions.length} regions.`);
  }

  function togglePause() {
    const action = isPaused ? "resume" : "pause";
    change({ action, ids });
    toast.success(isPaused ? "Monitor resumed" : "Monitor paused", monitor.name, {
      label: "Undo",
      onClick: () => change({ action: isPaused ? "pause" : "resume", ids }),
    });
  }

  function duplicate() {
    toast.success("Monitor duplicated", `${monitor.name} (copy) was created in ${monitor.project}.`);
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
    await navigate(`/o/${orgSlug}/monitors`);
    change({ action: "delete", ids });
    toast.success("Monitor deleted", monitor.name, { label: "Undo", onClick: () => restore(previous) });
  }

  const items = [
    { key: "duplicate", icon: <LuCopy />, label: "Duplicate" },
    { type: "divider" as const },
    { key: "delete", icon: <LuTrash2 />, label: "Delete monitor", danger: true },
  ];

  return (
    <div className="flex items-center gap-2">
      <Button icon={<LuRefreshCw />} onClick={checkNow} disabled={isPaused}>
        Check now
      </Button>
      <Button icon={isPaused ? <LuPlay /> : <LuPause />} onClick={togglePause}>
        {isPaused ? "Resume" : "Pause"}
      </Button>
      <Button icon={<LuPencil />} onClick={() => navigate(`/o/${orgSlug}/monitors/${monitor.id}/edit`)}>
        Edit
      </Button>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{ items, onClick: ({ key }) => (key === "delete" ? remove() : duplicate()) }}
      >
        <Button aria-label={`More actions for ${monitor.name}`} icon={<LuEllipsis />} />
      </Dropdown>
    </div>
  );
}
