import { useNow } from "@/hooks/useNow";
import { formatAgo } from "@/lib/format";
import { OVERALL_STATUS_LABELS } from "@/lib/statusTheme";
import type { OverallStatus } from "@/types/statusPage";
import { StatusLink } from "./StatusLink";

type StatusFooterProps = {
  lastCheckedAt: number;
  changedAt: number | null;
  overall: OverallStatus;
  isPreview: boolean;
};

const JUST_NOW_MS = 5_000;

export function StatusFooter({ lastCheckedAt, changedAt, overall, isPreview }: StatusFooterProps) {
  const now = useNow();
  const isJustUpdated = changedAt !== null && now - changedAt < JUST_NOW_MS;

  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-subtle">
      <span aria-hidden>{isJustUpdated ? "Updated just now" : `Last updated ${formatAgo(lastCheckedAt, now)}`}</span>
      <span aria-live="polite" className="sr-only">
        {changedAt !== null && `Status updated. ${OVERALL_STATUS_LABELS[overall]}.`}
      </span>
      <span>
        Powered by{" "}
        <StatusLink to="/" isPreview={isPreview} className="font-medium">
          Uptrail
        </StatusLink>
      </span>
    </footer>
  );
}
