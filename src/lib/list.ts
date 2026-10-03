export function toggleItem<Value>(list: Value[], value: Value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function countBy<Item>(items: Item[], read: (item: Item) => string | string[]) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const values = read(item);
    for (const value of Array.isArray(values) ? values : [values]) counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export function upsertItem<Item extends { id: string }>(items: Item[], next: Item) {
  return items.some((item) => item.id === next.id)
    ? items.map((item) => (item.id === next.id ? next : item))
    : [next, ...items];
}

export function matchesAny(selected: string[], value: string | string[]) {
  if (selected.length === 0) return true;
  return (Array.isArray(value) ? value : [value]).some((item) => selected.includes(item));
}

export function matchesText(query: string, ...fields: (string | null)[]) {
  const needle = query.trim().toLowerCase();
  return !needle || fields.some((field) => field?.toLowerCase().includes(needle));
}
