import type { ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { LuTriangleAlert } from "react-icons/lu";

function SectionFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="flex items-center gap-2 p-3 text-xs text-muted">
      <LuTriangleAlert className="size-3.5 shrink-0 text-degraded" />
      <span className="flex-1">This section couldn't load.</span>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="cursor-pointer font-medium text-ink hover:underline"
      >
        Retry
      </button>
    </div>
  );
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary FallbackComponent={SectionFallback}>{children}</ErrorBoundary>;
}
