import { Button, Tooltip } from "antd";
import { LuCheckCheck, LuUserPlus } from "react-icons/lu";
import { isIncidentOpen } from "@/lib/incidents";
import { currentUser } from "@/mocks/workspace";
import type { Incident } from "@/types/incident";
import { useIncidentActions } from "./useIncidentActions";

export function IncidentRowActions({ incident }: { incident: Incident }) {
  const actions = useIncidentActions();
  if (!isIncidentOpen(incident)) return null;

  return (
    <div className="row-actions flex items-center justify-end gap-1">
      {!incident.acknowledgedAt && (
        <Tooltip title="Acknowledge">
          <Button
            size="small"
            aria-label={`Acknowledge ${incident.id}`}
            icon={<LuCheckCheck />}
            onClick={() => actions.acknowledge(incident)}
          />
        </Tooltip>
      )}
      {incident.assignee !== currentUser.name && (
        <Tooltip title="Assign to me">
          <Button
            size="small"
            aria-label={`Assign ${incident.id} to me`}
            icon={<LuUserPlus />}
            onClick={() => actions.assignToMe(incident)}
          />
        </Tooltip>
      )}
    </div>
  );
}
