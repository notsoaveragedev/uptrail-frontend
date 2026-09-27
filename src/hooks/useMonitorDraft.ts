import { useEffect, useRef, useState } from "react";
import { removeDraft, writeDraft, type MonitorFormValues } from "@/lib/monitorForm";

type UseMonitorDraftOptions = {
  orgSlug: string;
  values: MonitorFormValues;
  step: number;
  isDirty: boolean;
  initialSavedAt: number | null;
};

export function useMonitorDraft({ orgSlug, values, step, isDirty, initialSavedAt }: UseMonitorDraftOptions) {
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const [initialSnapshot] = useState(() => (initialSavedAt ? JSON.stringify({ values, step }) : ""));
  const lastSavedRef = useRef(initialSnapshot);

  useEffect(() => {
    const snapshot = JSON.stringify({ values, step });
    if (!isDirty || snapshot === lastSavedRef.current) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      writeDraft(orgSlug, { values, step, savedAt: now });
      lastSavedRef.current = snapshot;
      setSavedAt(now);
    }, 600);
    return () => clearTimeout(timer);
  }, [orgSlug, values, step, isDirty]);

  function save() {
    const now = Date.now();
    writeDraft(orgSlug, { values, step, savedAt: now });
    lastSavedRef.current = JSON.stringify({ values, step });
    setSavedAt(now);
  }

  function clear() {
    removeDraft(orgSlug);
    lastSavedRef.current = "";
    setSavedAt(null);
  }

  return { savedAt, save, clear };
}
