import { actionTone } from "@/lib/audit";
import { TONE_TEXT } from "@/lib/status";

export function AuditAction({ action }: { action: string }) {
  const tone = actionTone(action);
  return (
    <span className={`rounded-sm bg-hover px-1.5 py-0.5 font-mono text-xs ${tone ? TONE_TEXT[tone] : "text-ink"}`}>
      {action}
    </span>
  );
}
