import { useQuery } from "@tanstack/react-query";
import { backtestQuery } from "@/api/backtest";
import { print } from "@/lib/alertExpression/print";
import type { ExpressionNode } from "@/types/alerts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const DEBOUNCE_MS = 800;

export function useBacktest(ast: ExpressionNode | null, forSeconds: number, monitorId: string) {
  const expression = ast ? print(ast) : null;
  const debouncedExpression = useDebouncedValue(expression, DEBOUNCE_MS);
  const debouncedFor = useDebouncedValue(forSeconds, DEBOUNCE_MS);
  const query = useQuery(backtestQuery(monitorId, debouncedExpression, debouncedFor));
  const isWaiting = expression !== debouncedExpression || forSeconds !== debouncedFor;

  return {
    result: query.data ?? null,
    isError: query.isError,
    rerun: query.refetch,
    isValid: expression !== null,
    isRunning: expression !== null && (query.isFetching || isWaiting),
  };
}
