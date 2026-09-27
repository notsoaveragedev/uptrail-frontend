import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import type { WidgetType } from "@/types/dashboard";
import { WidgetSkeleton } from "./WidgetSkeleton";

type WidgetStateProps<Data> = {
  type: WidgetType;
  query: UseQueryResult<Data>;
  noun: string;
  children: (data: Data) => ReactNode;
};

export function WidgetState<Data>({ type, query, noun, children }: WidgetStateProps<Data>) {
  if (query.isPending) return <WidgetSkeleton type={type} />;
  if (query.isError) return <WidgetError noun={noun} onRetry={() => void query.refetch()} />;
  return children(query.data);
}

export function WidgetError({ noun, onRetry }: { noun: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex size-full items-center justify-center gap-2 text-xs text-muted">
      <LuTriangleAlert aria-hidden className="size-3.5 shrink-0 text-degraded" />
      Couldn't load {noun}.
      <button type="button" onClick={onRetry} className="cursor-pointer font-medium text-ink hover:underline">
        Retry
      </button>
    </div>
  );
}

export function WidgetEmpty({ children }: { children: ReactNode }) {
  return <p className="flex size-full items-center justify-center text-center text-xs text-subtle">{children}</p>;
}
