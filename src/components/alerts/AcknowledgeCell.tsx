import { Button, Tooltip } from "antd";
import { useParams } from "react-router";
import { useAcknowledgeAlert } from "@/api/alerts";
import { useToast } from "@/hooks/useToast";
import { formatDateTime } from "@/lib/format";
import type { AlertEvent } from "@/types/alerts";

export function AcknowledgeCell({ event }: { event: AlertEvent }) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const acknowledge = useAcknowledgeAlert(orgSlug);

  if (event.acknowledgedBy) {
    return (
      <Tooltip title={event.acknowledgedAt ? `Acknowledged ${formatDateTime(event.acknowledgedAt)}` : undefined}>
        <span className="truncate text-muted">{event.acknowledgedBy}</span>
      </Tooltip>
    );
  }

  return (
    <Button
      size="small"
      onClick={() =>
        acknowledge.mutate(event.id, {
          onError: () => toast.error("Couldn't acknowledge the alert", "Try again in a moment."),
        })
      }
    >
      Acknowledge
    </Button>
  );
}
