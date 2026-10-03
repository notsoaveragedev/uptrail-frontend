import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { statusPageStore, statusSubscriberStore } from "@/mocks/statusPageStore";
import type { StatusPage, StatusSubscriber } from "@/types/statusPage";
import { useRemoveMutation, useUpsertMutation } from "./optimistic";

export function statusPagesKey(orgSlug: string) {
  return ["status-pages", orgSlug] as const;
}

export function statusPagesQuery(orgSlug: string) {
  return queryOptions({
    queryKey: statusPagesKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(350);
      return statusPageStore.list();
    },
  });
}

export function statusPageQuery(orgSlug: string, pageId: string) {
  return queryOptions({
    queryKey: [...statusPagesKey(orgSlug), pageId],
    queryFn: async () => {
      await fakeRequest(300);
      return statusPageStore.get(pageId);
    },
  });
}

export function subscribersKey(orgSlug: string, pageId: string) {
  return [...statusPagesKey(orgSlug), pageId, "subscribers"] as const;
}

export function subscribersQuery(orgSlug: string, pageId: string) {
  return queryOptions({
    queryKey: subscribersKey(orgSlug, pageId),
    queryFn: async () => {
      await fakeRequest(300);
      return statusSubscriberStore.list().filter((subscriber) => subscriber.pageId === pageId);
    },
  });
}

export function useSaveStatusPage(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: StatusPage) => {
      await fakeRequest(500);
      const saved = { ...page, updatedAt: Date.now() };
      statusPageStore.upsert(saved);
      return saved;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(statusPageQuery(orgSlug, saved.id).queryKey, saved);
      queryClient.invalidateQueries({ queryKey: statusPagesKey(orgSlug), exact: true });
    },
  });
}

export function useDeleteStatusPage(orgSlug: string) {
  return useRemoveMutation<StatusPage>(statusPagesKey(orgSlug), statusPageStore);
}

export function useRemoveSubscriber(orgSlug: string, pageId: string) {
  return useRemoveMutation<StatusSubscriber>(subscribersKey(orgSlug, pageId), statusSubscriberStore);
}

export function useRestoreSubscriber(orgSlug: string, pageId: string) {
  return useUpsertMutation<StatusSubscriber>(subscribersKey(orgSlug, pageId), statusSubscriberStore);
}

export async function verifyCustomDomain(host: string) {
  await fakeRequest(1200);
  return !/fail|invalid|example/i.test(host);
}
