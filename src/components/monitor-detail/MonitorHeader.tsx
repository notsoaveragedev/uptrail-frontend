import { Tag } from "antd";
import { LuExternalLink } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { MetaList } from "@/components/ui/MetaList";
import { useNow } from "@/hooks/useNow";
import { formatElapsed } from "@/lib/format";
import { displayUrl, formatInterval, MONITOR_TYPE_LABELS, projectLabel } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import { STATUS_LABELS } from "@/lib/status";
import type { Monitor } from "@/types/monitor";
import { MonitorHeaderActions } from "./MonitorHeaderActions";

export function MonitorHeader({ monitor }: { monitor: Monitor }) {
  const { orgSlug = "" } = useParams();
  const now = useNow(30_000);
  const since = formatElapsed(now - monitor.statusSince);

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link to={paths.monitors(orgSlug)}>Monitors</Link>
        <span aria-hidden className="text-faint">
          /
        </span>
        <span aria-current="page" className="truncate text-ink">
          {monitor.name}
        </span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={monitor.status} label={`${STATUS_LABELS[monitor.status]} · for ${since}`} />
            <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight outline-none">
              {monitor.name}
            </h1>
          </div>
          <MetaList className="text-muted">
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs"
            >
              {displayUrl(monitor.url)}
              <LuExternalLink aria-hidden className="size-3" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <span>
              {MONITOR_TYPE_LABELS[monitor.type]} · {monitor.method} · every {formatInterval(monitor.intervalSec)} ·{" "}
              {monitor.regions.length} regions
            </span>
            <span className="flex flex-wrap items-center gap-2">
              {projectLabel(monitor.project)}
              {monitor.tags.map((tag) => (
                <Tag key={tag} className="m-0 font-mono text-xs">
                  {tag}
                </Tag>
              ))}
            </span>
          </MetaList>
        </div>
        <MonitorHeaderActions monitor={monitor} />
      </div>
    </div>
  );
}
