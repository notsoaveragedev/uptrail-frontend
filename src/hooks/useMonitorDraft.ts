import { useEffect, useEffectEvent, useRef, useState } from "react";
import { removeDraft, writeDraft } from "@/lib/monitorDraft";
import type { MonitorFormValues } from "@/lib/monitorForm";

type UseMonitorDraftOptions = {
  orgSlug: string;
  values: MonitorFormValues;
  step: number;
  isDirty: boolean;
  initialSavedAt: number | null;
};

const AUTOSAVE_DELAY_MS = 600;

function snapshotOf(values: MonitorFormValues, step: number) {
  return JSON.stringify({ values, step });
}

export function useMonitorDraft({ orgSlug, values, step, isDirty, initialSavedAt }: UseMonitorDraftOptions) {
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const [initialSnapshot] = useState(() => (initialSavedAt ? snapshotOf(values, step) : ""));
  const lastSavedRef = useRef(initialSnapshot);

  function save() {
    const now = Date.now();
    writeDraft(orgSlug, { values, step, savedAt: now });
    lastSavedRef.current = snapshotOf(values, step);
    setSavedAt(now);
  }

  const autosave = useEffectEvent(() => {
    if (snapshotOf(values, step) !== lastSavedRef.current) save();
  });

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(autosave, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [orgSlug, values, step, isDirty]);

  function clear() {
    removeDraft(orgSlug);
    lastSavedRef.current = "";
    setSavedAt(null);
  }

  return { savedAt, save, clear };
}
