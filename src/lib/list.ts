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
