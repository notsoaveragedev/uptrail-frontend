import { useState } from "react";
import { readJson, writeJson } from "@/lib/storage";

export function useStoredState<Value>(key: string, fallback: Value) {
  const [value, setValue] = useState<Value>(() => readJson(key, fallback));

  function update(next: Value) {
    setValue(next);
    writeJson(key, next);
  }

  return [value, update] as const;
}
