export function readJson<Value>(key: string, fallback: Value): Value {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as Value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function removeStored(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}
