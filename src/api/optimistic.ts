import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { upsertItem } from "@/lib/list";

type CollectionMutationOptions<Item, Variables> = {
  queryKey: QueryKey;
  apply: (items: Item[], variables: Variables) => Item[];
  commit: (variables: Variables) => void;
};

export function useCollectionMutation<Item, Variables>({
  queryKey,
  apply,
  commit,
}: CollectionMutationOptions<Item, Variables>) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Variables, { previous?: Item[] }>({
    mutationFn: async (variables) => {
      await fakeRequest(400);
      commit(variables);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Item[]>(queryKey);
      queryClient.setQueryData<Item[]>(queryKey, (items) => items && apply(items, variables));
      return { previous };
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

type Store<Item> = {
  upsert: (item: Item) => void;
  remove: (id: string) => void;
};

export function useUpsertMutation<Item extends { id: string }>(queryKey: QueryKey, store: Store<Item>) {
  return useCollectionMutation<Item, Item>({ queryKey, apply: upsertItem, commit: store.upsert });
}

export function useRemoveMutation<Item extends { id: string }>(queryKey: QueryKey, store: Store<Item>) {
  return useCollectionMutation<Item, string[]>({
    queryKey,
    apply: (items, ids) => items.filter((item) => !ids.includes(item.id)),
    commit: (ids) => ids.forEach(store.remove),
  });
}
