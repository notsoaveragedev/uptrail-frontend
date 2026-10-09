import type { ReactNode } from "react";
import { LatencyValue } from "@/components/monitors/LatencyValue";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { latencyTone } from "@/lib/status";

type LogsHeaderProps = {
  rangeLabel: string;
  total: number | null;
  failed: number;
  p95LatencyMs: number;
  onShowFailed: () => void;
  actions?: ReactNode;
};

export function LogsHeader({ rangeLabel, total, failed, p95LatencyMs, onShowFailed, actions }: LogsHeaderProps) {
  return (
    <PageHeader
      title="Logs"
      titleSuffix={rangeLabel}
      meta={
        total === null ? (
          <SkeletonBlock isInset className="h-5 w-72" />
        ) : (
          <MetaList aria-live="polite">
            <span>
              <span className="font-mono text-ink">{total.toLocaleString()}</span> checks
            </span>
            <button type="button" onClick={onShowFailed} className="cursor-pointer hover:text-ink">
              <span className="font-mono text-down">{failed.toLocaleString()}</span> failed
            </button>
            <span>
              p95 <LatencyValue ms={p95LatencyMs} tone={latencyTone(p95LatencyMs)} />
            </span>
          </MetaList>
        )
      }
      actions={actions}
    />
  );
}
