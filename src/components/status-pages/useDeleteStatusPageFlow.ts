import { useParams } from "react-router";
import { useDeleteStatusPage, useSaveStatusPage } from "@/api/statusPages";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import type { StatusPage } from "@/types/statusPage";

export function useDeleteStatusPageFlow() {
  const toast = useToast();
  const confirm = useConfirm();
  const { orgSlug = "" } = useParams();
  const deletePage = useDeleteStatusPage(orgSlug);
  const restorePage = useSaveStatusPage(orgSlug);

  function restore(page: StatusPage) {
    restorePage.mutate(page, {
      onSuccess: () => toast.success("Status page restored", page.title),
      onError: () => toast.error("Couldn't restore the page", "Try again in a moment."),
    });
  }

  return async (page: StatusPage) => {
    const isConfirmed = await confirm({
      title: `Delete ${page.title}?`,
      description: page.published
        ? "Visitors get a 404 and subscribers stop receiving updates. Monitors and incidents stay untouched."
        : "The draft and its settings are removed. Monitors and incidents stay untouched.",
      confirmLabel: "Delete page",
      isDanger: true,
    });
    if (!isConfirmed) return false;

    deletePage.mutate(page.id, {
      onSuccess: () =>
        toast.success("Status page deleted", page.title, { label: "Undo", onClick: () => restore(page) }),
      onError: () => toast.error("Couldn't delete the page", "It's back in the list. Try again."),
    });
    return true;
  };
}
