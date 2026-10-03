import { useParams } from "react-router";
import { useDeleteMaintenance, useSaveMaintenance } from "@/api/maintenance";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import type { MaintenanceWindow } from "@/types/maintenance";

export function useMaintenanceActions() {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const save = useSaveMaintenance(orgSlug);
  const remove = useDeleteMaintenance(orgSlug);

  async function deleteWindow(entry: MaintenanceWindow) {
    const isConfirmed = await confirm({
      title: `Delete ${entry.title}?`,
      description: entry.recurrence
        ? "Every future occurrence is removed."
        : "Alerts for its monitors fire normally again.",
      confirmLabel: "Delete",
      isDanger: true,
    });
    if (!isConfirmed) return;
    remove.mutate([entry.id]);
    toast.success("Maintenance deleted", entry.title, { label: "Undo", onClick: () => save.mutate(entry) });
  }

  async function endNow(entry: MaintenanceWindow) {
    const isConfirmed = await confirm({
      title: `End ${entry.title} now?`,
      description: "Alerts resume right away and the status page stops showing maintenance.",
      confirmLabel: "End maintenance",
    });
    if (!isConfirmed) return;
    save.mutate({ ...entry, endsAt: Date.now() });
    toast.success("Maintenance ended", "Alerts are active again.", {
      label: "Undo",
      onClick: () => save.mutate(entry),
    });
  }

  return { deleteWindow, endNow };
}
