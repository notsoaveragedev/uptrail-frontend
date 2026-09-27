import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { dashboardQuery, useCreateDashboard, useSaveDashboard, VersionConflictError } from "@/api/dashboards";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { cloneDashboard } from "@/lib/dashboards";
import { paths } from "@/lib/paths";
import type { Dashboard } from "@/types/dashboard";

type SaveOptions = {
  onSaved: (saved: Dashboard) => void;
  onDiscarded: (latest: Dashboard) => void;
  allowLeave: () => void;
};

export function useDashboardSave({ onSaved, onDiscarded, allowLeave }: SaveOptions) {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { orgSlug = "" } = useParams();
  const saveDashboard = useSaveDashboard(orgSlug);
  const createDashboard = useCreateDashboard(orgSlug);
  const [conflict, setConflict] = useState<{ latest: Dashboard; draft: Dashboard } | null>(null);
  const [pendingAction, setPendingAction] = useState<"copy" | "overwrite" | null>(null);

  function save(draft: Dashboard) {
    saveDashboard.mutate(draft, {
      onSuccess: (saved) => {
        setConflict(null);
        onSaved(saved);
        toast.success("Dashboard saved", `Version ${saved.version} is live for everyone.`);
      },
      onError: (error) => {
        if (error instanceof VersionConflictError) {
          setConflict({ latest: error.latest, draft });
          return;
        }
        toast.error("Couldn't save the dashboard", "Your edits are still here.", {
          label: "Retry",
          onClick: () => save(draft),
        });
      },
      onSettled: () => setPendingAction(null),
    });
  }

  function showLatest(latest: Dashboard) {
    queryClient.setQueryData(dashboardQuery(orgSlug, latest.id).queryKey, latest);
  }

  function openTheirs() {
    if (!conflict) return;
    showLatest(conflict.latest);
    setConflict(null);
    onDiscarded(conflict.latest);
    toast.info(
      `Showing ${conflict.latest.updatedBy}'s version`,
      `Version ${conflict.latest.version}. Your edits were discarded.`,
    );
  }

  function saveCopy() {
    if (!conflict) return;
    const copy = { ...cloneDashboard(conflict.draft), name: `${conflict.draft.name} (my copy)` };
    setPendingAction("copy");
    createDashboard.mutate(copy, {
      onSuccess: () => {
        showLatest(conflict.latest);
        setConflict(null);
        allowLeave();
        navigate(paths.dashboard(orgSlug, copy.id));
        toast.success("Saved as a copy", `${copy.name} has your edits. The original keeps theirs.`);
      },
      onError: () => toast.error("Couldn't save a copy", "Try again in a moment."),
      onSettled: () => setPendingAction(null),
    });
  }

  async function overwrite() {
    if (!conflict) return;
    const isConfirmed = await confirm({
      title: `Overwrite ${conflict.latest.updatedBy}'s changes?`,
      description: `Version ${conflict.latest.version} is replaced by your edits. Their changes can't be recovered.`,
      confirmLabel: "Overwrite",
      isDanger: true,
    });
    if (!isConfirmed) return;
    setPendingAction("overwrite");
    save({ ...conflict.draft, version: conflict.latest.version });
  }

  return {
    save,
    isSaving: saveDashboard.isPending && pendingAction === null,
    conflict: conflict?.latest ?? null,
    pendingAction,
    openTheirs,
    saveCopy,
    overwrite,
    closeConflict: () => setConflict(null),
  };
}
