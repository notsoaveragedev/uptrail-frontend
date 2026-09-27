export type SortState<Key extends string> = { key: Key; isDescending: boolean };

export function readList(params: URLSearchParams, key: string) {
  return params.get(key)?.split(",").filter(Boolean) ?? [];
}

export function readEnum<Value extends string>(
  params: URLSearchParams,
  key: string,
  values: readonly Value[],
  fallback: Value,
) {
  const value = params.get(key);
  return values.find((item) => item === value) ?? fallback;
}

export function sortText<Key extends string>(sort: SortState<Key>) {
  return `${sort.isDescending ? "-" : ""}${sort.key}`;
}

export function readSort<Key extends string>(
  params: URLSearchParams,
  keys: readonly Key[],
  fallback: SortState<Key>,
): SortState<Key> {
  const text = params.get("sort") ?? sortText(fallback);
  const key = text.replace(/^-/, "");
  return {
    key: keys.find((item) => item === key) ?? fallback.key,
    isDescending: text.startsWith("-"),
  };
}

export function writeParam(params: URLSearchParams, key: string, value: string | string[] | null, fallback?: string) {
  const text = Array.isArray(value) ? value.join(",") : value;
  if (!text || text === fallback) params.delete(key);
  else params.set(key, text);
  return params;
}
