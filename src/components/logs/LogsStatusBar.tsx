import { Loader } from "@/components/ui/Loader";

type LogsStatusBarProps = {
  loaded: number;
  total: number;
  isFetching: boolean;
  hasMore: boolean;
};

export function LogsStatusBar({ loaded, total, isFetching, hasMore }: LogsStatusBarProps) {
  return (
    <div className="relative z-20 flex h-8 items-center justify-between border-t border-line bg-card px-3 font-mono text-xs text-subtle">
      <span className="flex items-center gap-2">
        {isFetching && <Loader size="sm" label="Loading more checks" className="text-subtle" />}
        Showing {loaded.toLocaleString()} of {total.toLocaleString()}
        {hasMore ? (isFetching ? " · loading more…" : "") : total > 0 ? " · end of results" : ""}
      </span>
      <span className="hidden items-center gap-1.5 sm:flex">
        <kbd className="kbd">↑↓</kbd> move <kbd className="kbd">↵</kbd> open <kbd className="kbd">Esc</kbd> close
      </span>
    </div>
  );
}
