import { Button } from "antd";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  onClear?: () => void;
};

export function EmptyState({ icon, title, description, action, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span
        aria-hidden
        className="mb-1 flex size-9 items-center justify-center rounded-lg border border-line text-subtle [&_svg]:size-4"
      >
        {icon}
      </span>
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="max-w-96 text-muted">{description}</p>}
      {(action || onClear) && <div className="mt-2">{action ?? <Button onClick={onClear}>Clear filters</Button>}</div>}
    </div>
  );
}
