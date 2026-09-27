export function readDemoState<State extends string>(
  params: URLSearchParams,
  states: readonly State[],
  fallback: State,
) {
  const value = params.get("state");
  return states.find((state) => state === value) ?? fallback;
}
