import { useParams } from "react-router";
import { useIncidentChange, type IncidentChange } from "@/api/incidents";
import { useToast } from "@/hooks/useToast";
import { SEVERITY_LABELS } from "@/lib/alerts";
import { shortName } from "@/lib/incidents";
import { currentUser } from "@/mocks/workspace";
import type { Severity } from "@/types/alerts";
import type { Incident } from "@/types/incident";

export function useIncidentActions() {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const mutation = useIncidentChange(orgSlug);

  function run(incident: Incident, change: IncidentChange, success?: string) {
    const send = () =>
      mutation.mutate(
        { incidentId: incident.id, change },
        {
          onError: () =>
            toast.error(`Couldn't update ${incident.id}`, "Your change was rolled back.", {
              label: "Retry",
              onClick: send,
            }),
        },
      );
    send();
    if (success) toast.success(success, `${incident.id} · ${incident.title}`);
  }

  return {
    acknowledge: (incident: Incident) => run(incident, { type: "acknowledge" }, "Incident acknowledged"),
    assign: (incident: Incident, assignee: string | null) =>
      run(incident, { type: "assign", assignee }, assignee ? `Assigned to ${shortName(assignee)}` : "Unassigned"),
    assignToMe: (incident: Incident) =>
      run(incident, { type: "assign", assignee: currentUser.name }, "Assigned to you"),
    setSeverity: (incident: Incident, severity: Severity) =>
      run(incident, { type: "severity", severity }, `Severity set to ${SEVERITY_LABELS[severity]}`),
    resolve: (incident: Incident, message: string, isPublic: boolean) =>
      run(incident, { type: "resolve", message, isPublic }, "Incident resolved"),
    reopen: (incident: Incident) => run(incident, { type: "reopen" }, "Incident reopened"),
    postUpdate: (incident: Incident, change: Extract<IncidentChange, { type: "update" }>) => run(incident, change),
  };
}
