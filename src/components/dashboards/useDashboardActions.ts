import { useNavigate, useParams } from "react-router";
import { useCreateDashboard, useDeleteDashboard, useRestoreDashboard } from "@/api/dashboards";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { cloneDashboard, dashboardFileName, dashboardToJson } from "@/lib/dashboards";
import { downloadBlob } from "@/lib/download";
import { paths } from "@/lib/paths";
import type { Dashboard } from "@/types/dashboard";

export function useDashboardActions() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { orgSlug = "" } = useParams();
  const createDashboard = useCreateDashboard(orgSlug);
  const deleteDashboard = useDeleteDashboard(orgSlug);
  const restoreDashboard = useRestoreDashboard(orgSlug);

  function open(dashboard: Dashboard) {
    navigate(paths.dashboard(orgSlug, dashboard.id));
  }

  function clone(dashboard: Dashboard) {
    const copy = cloneDashboard(dashboard);
    createDashboard.mutate(copy, {
      onSuccess: () =>
        toast.success("Dashboard cloned", `${copy.name} is ready to edit.`, {
          label: "Open copy",
          onClick: () => open(copy),
        }),
      onError: () => toast.error("Couldn't clone the dashboard", "Try again in a moment."),
    });
  }

  function exportJson(dashboard: Dashboard) {
    downloadBlob(new Blob([dashboardToJson(dashboard)], { type: "application/json" }), dashboardFileName(dashboard));
    toast.success("Export ready", `${dashboard.name} was saved as JSON.`);
  }

  async function remove(dashboard: Dashboard) {
    const isConfirmed = await confirm({
      title: `Delete ${dashboard.name}?`,
      description: "Everyone in this workspace loses the dashboard and its layout. Monitors and data stay untouched.",
      confirmLabel: "Delete dashboard",
      isDanger: true,
    });
    if (!isConfirmed) return;

    deleteDashboard.mutate([dashboard.id], {
      onSuccess: () =>
        toast.success("Dashboard deleted", dashboard.name, {
          label: "Undo",
          onClick: () => restoreDashboard.mutate(dashboard),
        }),
      onError: () => toast.error("Couldn't delete the dashboard", "It's back in the list. Try again."),
    });
  }

  return { open, clone, exportJson, remove };
}
