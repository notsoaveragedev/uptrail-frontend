import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { invitationStore, memberStore } from "@/mocks/settingsStore";
import type { Invitation, Member } from "@/types/member";
import { useRemoveMutation, useUpsertMutation } from "./optimistic";

function membersKey(orgSlug: string) {
  return ["members", orgSlug] as const;
}

function invitationsKey(orgSlug: string) {
  return ["invitations", orgSlug] as const;
}

export function membersQuery(orgSlug: string) {
  return queryOptions({
    queryKey: membersKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(300);
      return memberStore.list();
    },
  });
}

export function invitationsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: invitationsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(300);
      return invitationStore.list();
    },
  });
}

export function useSaveMember(orgSlug: string) {
  return useUpsertMutation<Member>(membersKey(orgSlug), memberStore);
}

export function useRemoveMembers(orgSlug: string) {
  return useRemoveMutation<Member>(membersKey(orgSlug), memberStore);
}

export function useSaveInvitation(orgSlug: string) {
  return useUpsertMutation<Invitation>(invitationsKey(orgSlug), invitationStore);
}

export function useRevokeInvitations(orgSlug: string) {
  return useRemoveMutation<Invitation>(invitationsKey(orgSlug), invitationStore);
}
