import { upsertItem } from "@/lib/list";

export function createCollectionStore<Item extends { id: string }>(seed: Item[]) {
  let items = seed;

  return {
    list: () => items,
    get: (id: string) => items.find((item) => item.id === id) ?? null,
    upsert: (next: Item) => {
      items = upsertItem(items, next);
    },
    remove: (id: string) => {
      items = items.filter((item) => item.id !== id);
    },
    replace: (next: Item[]) => {
      items = next;
    },
  };
}
