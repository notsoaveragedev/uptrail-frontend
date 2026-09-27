import { SEVERITY_LABELS, SEVERITY_TONE } from "@/lib/alerts";
import { TONE_BADGE } from "@/lib/status";
import type { Severity } from "@/types/alerts";

export function SeverityTag({ severity }: { severity: Severity }) {
  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 text-caps font-semibold tracking-widest uppercase ${TONE_BADGE[SEVERITY_TONE[severity]]}`}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
}
