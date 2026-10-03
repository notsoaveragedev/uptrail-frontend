import { Button, Tooltip } from "antd";
import { LuArrowRight, LuChevronDown, LuChevronUp, LuX } from "react-icons/lu";
import { Link } from "react-router";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { KbdButton } from "@/components/ui/KbdButton";
import { formatBytes, formatClockMs, latencyText } from "@/lib/format";
import { paths } from "@/lib/paths";
import type { CheckResultDetail } from "@/types/logs";

type DetailHeaderProps = {
  detail: CheckResultDetail | undefined;
  orgSlug: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

function metaLine(detail: CheckResultDetail) {
  const code = detail.statusCode ?? "no response";
  const parts = [formatClockMs(detail.ts), detail.region, `${detail.method} ${code}`, latencyText(detail.latencyMs)];
  return detail.sizeBytes === null ? parts : [...parts, formatBytes(detail.sizeBytes)];
}

export function DetailHeader({ detail, orgSlug, onClose, onPrev, onNext }: DetailHeaderProps) {
  return (
    <header className="flex flex-col gap-2 border-b border-line px-5 pt-4 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {detail && <StatusBadge status={detail.status} />}
          <h2 id="log-detail-title" className="truncate text-md font-semibold">
            {detail?.monitorName ?? "Check result"}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <KbdButton label="Previous check" hint="↑" icon={<LuChevronUp />} onClick={onPrev} />
          <KbdButton label="Next check" hint="↓" icon={<LuChevronDown />} onClick={onNext} />
          <Tooltip
            title={
              <span className="flex items-center gap-2">
                Close <kbd className="kbd">Esc</kbd>
              </span>
            }
          >
            <Button type="text" size="small" aria-label="Close details" icon={<LuX />} onClick={onClose} />
          </Tooltip>
        </div>
      </div>
      {detail && (
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-mono text-xs text-muted">{metaLine(detail).join(" · ")}</p>
          <Link to={paths.monitor(orgSlug, detail.monitorId)} className="flex shrink-0 items-center gap-1 text-xs">
            View monitor <LuArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </header>
  );
}
