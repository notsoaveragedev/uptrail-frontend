export function createCollectionStore<Item extends { id: string }>(seed: Item[]) {
  let items = seed;

  return {
    list: () => items,
    get: (id: string) => items.find((item) => item.id === id) ?? null,
    upsert: (next: Item) => {
      items = items.some((item) => item.id === next.id)
        ? items.map((item) => (item.id === next.id ? next : item))
        : [next, ...items];
    },
    remove: (id: string) => {
      items = items.filter((item) => item.id !== id);
    },
    replace: (next: Item[]) => {
      items = next;
    },
  };
}
