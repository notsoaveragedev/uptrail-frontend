import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { runBacktest } from "@/lib/alertExpression/backtest";
import { parse } from "@/lib/alertExpression/parse";
import { fakeRequest } from "@/lib/fakeRequest";
import { backtestSeries } from "@/mocks/backtest";

export function backtestQuery(monitorId: string, expression: string | null, forSeconds: number) {
  return queryOptions({
    queryKey: ["backtest", monitorId, expression, forSeconds],
    queryFn: async () => {
      await fakeRequest(650);
      const result = parse(expression ?? "");
      if (!result.ok) throw new Error(result.error.message);
      return runBacktest(result.ast, forSeconds, backtestSeries(monitorId));
    },
    enabled: expression !== null && monitorId !== "",
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
}
