import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { addMonitors, useMonitorChange } from "@/api/monitors";
import { duplicateMonitor } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { Monitor } from "@/types/monitor";
import { useConfirm } from "./useConfirm";
import { useToast } from "./useToast";

export function useMonitorActions(monitor: Monitor, { leaveOnDelete = false } = {}) {
  const { orgSlug = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { change, changeWithUndo } = useMonitorChange(orgSlug);
  const isPaused = monitor.status === "paused";
  const ids = [monitor.id];

  function checkNow() {
    change({ action: "check", ids });
    toast.success("Check queued", `${monitor.name} will be checked from ${monitor.regions.length} regions.`);
  }

  function togglePause() {
    const undo = changeWithUndo({ action: isPaused ? "resume" : "pause", ids });
    toast.success(isPaused ? "Monitor resumed" : "Monitor paused", monitor.name, { label: "Undo", onClick: undo });
  }

  async function duplicate() {
    await addMonitors(queryClient, orgSlug, [duplicateMonitor(monitor)]);
    toast.success("Monitor duplicated", `${monitor.name} (copy) is paused until you review it.`);
  }

  async function remove() {
    const isConfirmed = await confirm({
      title: `Delete ${monitor.name}?`,
      description: "Its check history, alert rules and status page component will be removed.",
      confirmLabel: "Delete monitor",
      isDanger: true,
    });
    if (!isConfirmed) return;
    if (leaveOnDelete) await navigate(paths.monitors(orgSlug));
    const undo = changeWithUndo({ action: "delete", ids });
    toast.success("Monitor deleted", monitor.name, { label: "Undo", onClick: undo });
  }

  return {
    isPaused,
    checkNow,
    togglePause,
    duplicate,
    remove,
    edit: () => navigate(paths.monitorEdit(orgSlug, monitor.id)),
    open: () => navigate(paths.monitor(orgSlug, monitor.id)),
    viewLogs: () => navigate(paths.logs(orgSlug, { monitor: monitor.id })),
  };
}
