import { Button } from "antd";
import { DangerRow, DangerZone } from "@/components/ui/DangerZone";

type StatusPageDangerZoneProps = {
  isPublished: boolean;
  onUnpublish: () => void;
  onDelete: () => void;
};

export function StatusPageDangerZone({ isPublished, onUnpublish, onDelete }: StatusPageDangerZoneProps) {
  return (
    <DangerZone>
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
    </DangerZone>
  );
}
