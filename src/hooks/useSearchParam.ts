import { useSearchParams } from "react-router";
import { readEnum, writeParam } from "@/lib/searchParams";

export function useSearchParam<Value extends string>(
  key: string,
  values: readonly Value[],
  fallback: Value,
  { replace = false } = {},
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = readEnum(searchParams, key, values, fallback);

  function setValue(next: Value) {
    setSearchParams((params) => writeParam(params, key, next, fallback), { replace });
  }

  return [value, setValue] as const;
}
