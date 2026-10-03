import type { ReactNode } from "react";

export function DangerZone({ children }: { children: ReactNode }) {
  return <div className="flex flex-col divide-y divide-line rounded-md border border-down/40">{children}</div>;
}

type DangerRowProps = { title: string; description: string; action: ReactNode };

export function DangerRow({ title, description, action }: DangerRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <div className="flex flex-col">
        <span className="font-medium text-ink">{title}</span>
        <span className="text-xs text-muted">{description}</span>
      </div>
      {action}
    </div>
  );
}
