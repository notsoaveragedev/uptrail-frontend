import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";

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
