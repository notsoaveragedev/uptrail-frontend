import { DEFAULT_VALUES, STEPS, type MonitorFormValues } from "./monitorForm";
import { readJson, removeStored, writeJson } from "./storage";

type MonitorDraft = { values: MonitorFormValues; step: number; savedAt: number };

function draftKey(orgSlug: string) {
  return `uptrail:monitor-draft:${orgSlug}`;
}

export function readDraft(orgSlug: string): MonitorDraft | null {
  const draft = readJson<MonitorDraft | null>(draftKey(orgSlug), null);
  if (!draft?.values || typeof draft.savedAt !== "number") return null;
  const step = Math.min(Math.max(Number(draft.step) || 0, 0), STEPS.length - 1);
  return { values: { ...DEFAULT_VALUES, ...draft.values }, step, savedAt: draft.savedAt };
}

export function writeDraft(orgSlug: string, draft: MonitorDraft) {
  writeJson(draftKey(orgSlug), draft);
}

export function removeDraft(orgSlug: string) {
  removeStored(draftKey(orgSlug));
}
