import { useState } from "react";
import { isSamePage } from "@/lib/statusPages";
import type { StatusPage } from "@/types/statusPage";

export function useStatusPageDraft(page: StatusPage) {
  const [saved, setSaved] = useState(page);
  const [draft, setDraft] = useState(page);

  function update(patch: Partial<StatusPage>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function commit(next: StatusPage) {
    setSaved(next);
    setDraft(next);
  }

  return { draft, saved, isDirty: !isSamePage(draft, saved), update, change: setDraft, commit };
}
