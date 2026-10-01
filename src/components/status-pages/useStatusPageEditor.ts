import { useState } from "react";
import { useSaveStatusPage } from "@/api/statusPages";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { contrastChecks, formatRatio, pageAddress } from "@/lib/statusPages";
import type { StatusPage } from "@/types/statusPage";
import { useDeleteStatusPageFlow } from "./useDeleteStatusPageFlow";
import { useStatusPageDraft } from "./useStatusPageDraft";

type Pending = "save" | "publish" | null;

function publishConfirm(page: StatusPage, isDirty: boolean) {
  const failing = contrastChecks(page.theme).filter((check) => check.isFailing);
  const saveNote = isDirty ? " Your unsaved changes are saved too." : "";
  if (failing.length > 0) {
    return {
      title: "Publish with low contrast?",
      description: `${failing.map((check) => `${check.label} is ${formatRatio(check.ratio)}`).join(" and ")}. Visitors will see the default colours until you fix it.${saveNote}`,
      confirmLabel: "Publish anyway",
    };
  }
  return {
    title: `Publish ${page.title}?`,
    description: `Anyone can open it at ${pageAddress(page)}, and subscribers get incident updates by email.${saveNote}`,
    confirmLabel: "Publish",
  };
}

function unpublishConfirm(page: StatusPage, isDirty: boolean) {
  return {
    title: `Unpublish ${page.title}?`,
    description: `The page will return 404 to visitors.${isDirty ? " Your unsaved changes are saved too." : ""}`,
    confirmLabel: "Unpublish",
    isDanger: true,
  };
}

export function useStatusPageEditor(orgSlug: string, page: StatusPage, onDeleted: () => void) {
  const toast = useToast();
  const confirm = useConfirm();
  const { draft, saved, isDirty, update, change, commit } = useStatusPageDraft(page);
  const savePage = useSaveStatusPage(orgSlug);
  const deletePage = useDeleteStatusPageFlow();
  const [pending, setPending] = useState<Pending>(null);
  const { allowLeave } = useUnsavedChangesGuard({
    isDirty,
    title: "Discard your changes?",
    description: `Your edits to ${saved.title} haven't been saved.`,
  });

  async function persist(next: StatusPage, kind: Pending) {
    setPending(kind);
    try {
      commit(await savePage.mutateAsync(next));
    } finally {
      setPending(null);
    }
  }

  async function save() {
    if (pending) return;
    if (!draft.title.trim()) return toast.error("Give the page a title", "Visitors see it at the top of the page.");
    try {
      await persist(draft, "save");
      toast.success(saved.published ? "Changes are live" : "Draft saved", pageAddress(draft));
    } catch {
      toast.error("Couldn't save the page", "Check your connection and try again.", { label: "Retry", onClick: save });
    }
  }

  async function togglePublish() {
    if (pending) return;
    const isPublishing = !saved.published;
    const options = isPublishing ? publishConfirm(draft, isDirty) : unpublishConfirm(draft, isDirty);
    if (!(await confirm(options))) return;
    try {
      await persist({ ...draft, published: isPublishing }, "publish");
      if (isPublishing) toast.success("Status page published", `Live at ${pageAddress(draft)}.`);
      else toast.success("Status page unpublished", "Visitors now get a 404.");
    } catch {
      toast.error(`Couldn't ${isPublishing ? "publish" : "unpublish"} the page`, "Try again in a moment.", {
        label: "Retry",
        onClick: togglePublish,
      });
    }
  }

  async function remove() {
    if (!(await deletePage(saved))) return;
    allowLeave();
    onDeleted();
  }

  return {
    draft,
    isDirty,
    isPublished: saved.published,
    isSaving: pending === "save",
    isPublishing: pending === "publish",
    update,
    change,
    save,
    togglePublish,
    remove,
  };
}
