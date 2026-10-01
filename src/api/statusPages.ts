import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { statusPageStore, statusSubscriberStore } from "@/mocks/statusPageStore";
import type { StatusPage, StatusSubscriber } from "@/types/statusPage";
import { useCollectionMutation } from "./optimistic";

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
  return useCollectionMutation<StatusPage, string>({
    queryKey: statusPagesKey(orgSlug),
    apply: (pages, id) => pages.filter((page) => page.id !== id),
    commit: (id) => statusPageStore.remove(id),
  });
}

export function useRemoveSubscriber(orgSlug: string, pageId: string) {
  return useCollectionMutation<StatusSubscriber, string>({
    queryKey: subscribersKey(orgSlug, pageId),
    apply: (subscribers, id) => subscribers.filter((subscriber) => subscriber.id !== id),
    commit: (id) => statusSubscriberStore.remove(id),
  });
}

export function useRestoreSubscriber(orgSlug: string, pageId: string) {
  return useCollectionMutation<StatusSubscriber, StatusSubscriber>({
    queryKey: subscribersKey(orgSlug, pageId),
    apply: (subscribers, subscriber) => [subscriber, ...subscribers],
    commit: (subscriber) => statusSubscriberStore.upsert(subscriber),
  });
}

export async function verifyCustomDomain(host: string) {
  await fakeRequest(1200);
  return !/fail|invalid|example/i.test(host);
}
