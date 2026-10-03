import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { notificationStore } from "@/mocks/settingsStore";
import type { AppNotification } from "@/types/workspace";
import { useCollectionMutation } from "./optimistic";

function notificationsKey(orgSlug: string) {
  return ["notifications", orgSlug] as const;
}

export function notificationsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: notificationsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(300);
      return notificationStore.list();
    },
  });
}

type ReadChange = { ids: string[]; isUnread: boolean };

function markItems(items: AppNotification[], { ids, isUnread }: ReadChange) {
  return items.map((item) => (ids.includes(item.id) ? { ...item, isUnread } : item));
}

export function useMarkNotifications(orgSlug: string) {
  return useCollectionMutation<AppNotification, ReadChange>({
    queryKey: notificationsKey(orgSlug),
    apply: markItems,
    commit: (change) => notificationStore.replace(markItems(notificationStore.list(), change)),
  });
}
