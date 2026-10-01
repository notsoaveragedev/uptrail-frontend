import { Button } from "antd";
import type { ReactNode } from "react";

type DangerZoneProps = {
  isPublished: boolean;
  onUnpublish: () => void;
  onDelete: () => void;
};

export function DangerZone({ isPublished, onUnpublish, onDelete }: DangerZoneProps) {
  return (
    <div className="flex flex-col divide-y divide-line rounded-md border border-down/40">
      {isPublished && (
        <DangerRow
          title="Unpublish"
          description="Visitors get a 404 until you publish again."
          action={
            <Button danger size="small" onClick={onUnpublish}>
              Unpublish
            </Button>
          }
        />
      )}
      <DangerRow
        title="Delete page"
        description="Removes the page, its settings and subscribers."
        action={
          <Button danger type="primary" size="small" onClick={onDelete}>
            Delete
          </Button>
        }
      />
    </div>
  );
}

function DangerRow({ title, description, action }: { title: string; description: string; action: ReactNode }) {
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
