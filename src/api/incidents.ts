import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { incidentStore } from "@/mocks/incidentStore";
import { currentUser } from "@/mocks/workspace";
import type { Incident, IncidentStatus, TimelineEntry } from "@/types/incident";
import { useCollectionMutation } from "./optimistic";

export function incidentsKey(orgSlug: string) {
  return ["incidents", orgSlug] as const;
}

export function incidentsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: incidentsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(350);
      return incidentStore.list();
    },
  });
}

export function incidentQuery(orgSlug: string, incidentId: string) {
  return queryOptions({
    queryKey: [...incidentsKey(orgSlug), incidentId],
    queryFn: async () => {
      await fakeRequest(300);
      return incidentStore.get(incidentId);
    },
  });
}

export type IncidentChange =
  | { type: "acknowledge" }
  | { type: "resolve"; message?: string; isPublic: boolean }
  | { type: "reopen" }
  | { type: "update"; status: IncidentStatus; message: string; isPublic: boolean }
  | { type: "assign"; assignee: string | null }
  | { type: "severity"; severity: Incident["severity"] };

function timelineEntry(incidentId: string, fields: Omit<TimelineEntry, "id" | "at">): TimelineEntry {
  return { id: `${incidentId}-${Date.now()}`, at: Date.now(), ...fields };
}

export function applyIncidentChange(incident: Incident, change: IncidentChange): Incident {
  const at = Date.now();
  const author = currentUser.name;
  const add = (entry: Omit<TimelineEntry, "id" | "at">) => [timelineEntry(incident.id, entry), ...incident.timeline];

  switch (change.type) {
    case "acknowledge":
      return {
        ...incident,
        acknowledgedAt: at,
        acknowledgedBy: author,
        timeline: add({ kind: "auto", event: "acknowledged", status: null, message: null, isPublic: false, author }),
        updatedAt: at,
      };
    case "resolve":
      return {
        ...incident,
        status: "resolved",
        resolvedAt: at,
        timeline: add({
          kind: "update",
          event: "status_changed",
          status: "resolved",
          message: change.message || "This incident has been resolved.",
          isPublic: change.isPublic,
          author,
        }),
        updatedAt: at,
      };
    case "reopen":
      return {
        ...incident,
        status: "investigating",
        resolvedAt: null,
        timeline: add({
          kind: "update",
          event: "status_changed",
          status: "investigating",
          message: "Reopened.",
          isPublic: false,
          author,
        }),
        updatedAt: at,
      };
    case "update":
      return {
        ...incident,
        status: change.status,
        resolvedAt: change.status === "resolved" ? at : incident.resolvedAt,
        timeline: add({
          kind: "update",
          event: change.status === incident.status ? "note" : "status_changed",
          status: change.status,
          message: change.message,
          isPublic: change.isPublic,
          author,
        }),
        updatedAt: at,
      };
    case "assign":
      return {
        ...incident,
        assignee: change.assignee,
        timeline: add({
          kind: "auto",
          event: "note",
          status: null,
          message: change.assignee ? `Assigned to ${change.assignee}.` : "Unassigned.",
          isPublic: false,
          author,
        }),
        updatedAt: at,
      };
    case "severity":
      return { ...incident, severity: change.severity, updatedAt: at };
  }
}

export function useIncidentChange(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation<Incident, Error, { incidentId: string; change: IncidentChange }, { previous?: Incident[] }>({
    mutationFn: async ({ incidentId, change }) => {
      await fakeRequest(400);
      const current = incidentStore.get(incidentId);
      if (!current) throw new Error("Incident not found");
      const next = applyIncidentChange(current, change);
      incidentStore.upsert(next);
      return next;
    },
    onMutate: async ({ incidentId, change }) => {
      const listKey = incidentsKey(orgSlug);
      const detailKey = incidentQuery(orgSlug, incidentId).queryKey;
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<Incident[]>(listKey);
      const apply = (incident: Incident) =>
        incident.id === incidentId ? applyIncidentChange(incident, change) : incident;
      queryClient.setQueryData<Incident[]>(listKey, (incidents) => incidents?.map(apply));
      queryClient.setQueryData<Incident | null>(detailKey, (incident) => (incident ? apply(incident) : incident));
      return { previous };
    },
    onError: (_error, { incidentId }, context) => {
      queryClient.setQueryData(incidentsKey(orgSlug), context?.previous);
      queryClient.invalidateQueries({ queryKey: incidentQuery(orgSlug, incidentId).queryKey });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: incidentsKey(orgSlug) }),
  });
}

export function useDeclareIncident(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: Omit<Incident, "id" | "number">) => {
      await fakeRequest(500);
      const number = Math.max(...incidentStore.list().map((incident) => incident.number)) + 1;
      const incident: Incident = { ...draft, id: `INC-${number}`, number };
      incidentStore.upsert(incident);
      return incident;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: incidentsKey(orgSlug) }),
  });
}

export function useDeleteIncident(orgSlug: string) {
  return useCollectionMutation<Incident, string>({
    queryKey: incidentsKey(orgSlug),
    apply: (incidents, id) => incidents.filter((incident) => incident.id !== id),
    commit: (id) => incidentStore.remove(id),
  });
}

export function useRestoreIncident(orgSlug: string) {
  return useCollectionMutation<Incident, Incident>({
    queryKey: incidentsKey(orgSlug),
    apply: (incidents, incident) => [incident, ...incidents.filter((item) => item.id !== incident.id)],
    commit: (incident) => incidentStore.upsert(incident),
  });
}
