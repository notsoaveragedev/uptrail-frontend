import type { ReactNode } from "react";

export function StepFooter({ start, children }: { start?: ReactNode; children: ReactNode }) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
      <div className="flex items-center gap-3 text-xs text-subtle">{start}</div>
      <div className="flex items-center gap-2">{children}</div>
    </footer>
  );
}
